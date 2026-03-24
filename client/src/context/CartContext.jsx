import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const clampQuantity = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 1000 : Math.max(1000, parsed);
  };

  const getMaxAllowedForItem = (item) => {
    const parsed = parseInt(item?.quantity, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const clampQuantityForItem = (item, value) => {
    const minimumSafe = clampQuantity(value);
    const maxAllowed = getMaxAllowedForItem(item);
    if (maxAllowed === null) return minimumSafe;
    return Math.min(minimumSafe, maxAllowed);
  };

  const sanitizeColor = (value) => String(value || '').replace(/\D/g, '').slice(0, 2);

  const buildColorQuantities = (item) => {
    if (Array.isArray(item?.colorQuantities) && item.colorQuantities.length > 0) {
      return item.colorQuantities.map((entry) => ({
        color: sanitizeColor(entry?.color),
        quantity: clampQuantityForItem(item, entry?.quantity),
      }));
    }

    const firstColor = String(item?.selectedColors || '')
      .split(/[\s,]+/)
      .map((c) => c.trim())
      .find(Boolean);

    return [{
      color: sanitizeColor(firstColor || ''),
      quantity: clampQuantityForItem(item, item?.cartQuantity),
    }];
  };

  const normalizeCartItem = (item) => {
    const colorQuantities = buildColorQuantities(item);
    const totalQuantity = colorQuantities.reduce((sum, entry) => sum + entry.quantity, 0);

    return {
      ...item,
      colorQuantities,
      cartQuantity: totalQuantity,
      selectedColors: colorQuantities.map((entry) => entry.color).filter(Boolean).join(', '),
    };
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('textile-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed.map(normalizeCartItem));
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('textile-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1000, colors = '') => {
    setCart(prevCart => {
      // Always add as a new cart entry with unique cartItemId
      const cartItemId = `${item._id || item.id}_${Date.now()}_${Math.random()}`;
      const initialColor = sanitizeColor(
        String(colors || '')
          .split(/[\s,]+/)
          .map((c) => c.trim())
          .find(Boolean) || ''
      );
      const initialQuantity = clampQuantity(quantity);
      const stockSafeQuantity = clampQuantityForItem(item, initialQuantity);
      return [...prevCart, { 
        ...item, 
        cartItemId, 
        cartQuantity: stockSafeQuantity,
        selectedColors: initialColor,
        colorQuantities: [{ color: initialColor, quantity: stockSafeQuantity }],
      }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId, quantity) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.cartItemId === cartItemId
          ? (() => {
              const clampedQuantity = clampQuantityForItem(item, quantity);
              return {
                ...item,
                cartQuantity: clampedQuantity,
                colorQuantities: [{
                  color: sanitizeColor(item.selectedColors || ''),
                  quantity: clampedQuantity,
                }],
              };
            })()
          : item
      )
    );
  };

  const updateCartItemColors = (cartItemId, colors) => {
    const color = sanitizeColor(
      String(colors || '')
        .split(/[\s,]+/)
        .map((c) => c.trim())
        .find(Boolean) || ''
    );

    setCart(prevCart => 
      prevCart.map(item => 
        item.cartItemId === cartItemId
          ? {
              ...item,
              selectedColors: color,
              colorQuantities: [{ color, quantity: clampQuantityForItem(item, item.cartQuantity) }],
            }
          : item
      )
    );
  };

  const updateCartItemColorQuantities = (cartItemId, colorQuantities) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.cartItemId === cartItemId
          ? (() => {
              const cleaned = (colorQuantities || []).map((entry) => ({
                color: sanitizeColor(entry?.color),
                quantity: clampQuantityForItem(item, entry?.quantity),
              }));

              const safeRows = cleaned.length > 0 ? cleaned : [{ color: '', quantity: clampQuantityForItem(item, 1000) }];
              const totalQuantity = safeRows.reduce((sum, entry) => sum + entry.quantity, 0);

              return {
                ...item,
                colorQuantities: safeRows,
                cartQuantity: totalQuantity,
                selectedColors: safeRows.map((entry) => entry.color).filter(Boolean).join(', '),
              };
            })()
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  const getCartItemCount = () => {
    return cart.length;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemColors,
    updateCartItemColorQuantities,
    clearCart,
    getCartTotal,
    getCartItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
