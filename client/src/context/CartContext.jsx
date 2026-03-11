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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('textile-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
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
      return [...prevCart, { 
        ...item, 
        cartItemId, 
        cartQuantity: quantity, 
        selectedColors: colors 
      }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId, quantity) => {
    if (quantity < 1000) {
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.cartItemId === cartItemId
          ? { ...item, cartQuantity: quantity }
          : item
      )
    );
  };

  const updateCartItemColors = (cartItemId, colors) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.cartItemId === cartItemId
          ? { ...item, selectedColors: colors }
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
    clearCart,
    getCartTotal,
    getCartItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
