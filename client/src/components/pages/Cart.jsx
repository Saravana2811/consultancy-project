import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Palette } from 'lucide-react';
import catalogImg from '../../assets/photo4.jpg';
import p3 from '../../assets/photo3.jpg';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartItemColorQuantities, getCartTotal, clearCart } = useCart();
  const [showColorCatalog, setShowColorCatalog] = useState(false);

  const getRows = (item) => {
    if (Array.isArray(item.colorQuantities) && item.colorQuantities.length > 0) {
      return item.colorQuantities;
    }

    return [{ color: '', quantity: Math.max(1000, parseInt(item.cartQuantity, 10) || 1000) }];
  };

  const getAvailableMeters = (item) => {
    const parsed = parseInt(item?.quantity, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const handleRowChange = (item, rowIndex, key, value) => {
    const rows = [...getRows(item)];
    if (!rows[rowIndex]) return;

    if (key === 'color') {
      rows[rowIndex] = {
        ...rows[rowIndex],
        color: String(value || '').replace(/\D/g, '').slice(0, 2),
      };
    }

    if (key === 'quantity') {
      const parsed = parseInt(value, 10);
      rows[rowIndex] = {
        ...rows[rowIndex],
        quantity: Number.isNaN(parsed) ? 1000 : Math.max(1000, parsed),
      };
    }

    updateCartItemColorQuantities(item.cartItemId, rows);
  };

  const handleAddRow = (item) => {
    const rows = [...getRows(item), { color: '', quantity: 1000 }];
    updateCartItemColorQuantities(item.cartItemId, rows);
  };

  const handleRemoveRow = (item, rowIndex) => {
    const rows = getRows(item);
    if (rows.length <= 1) {
      updateCartItemColorQuantities(item.cartItemId, [{ color: '', quantity: 1000 }]);
      return;
    }

    updateCartItemColorQuantities(
      item.cartItemId,
      rows.filter((_, index) => index !== rowIndex)
    );
  };

  const isValidColor = (colorValue) => {
    const num = Number(colorValue);
    return Number.isInteger(num) && num >= 1 && num <= 40;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    for (const item of cart) {
      const rows = getRows(item);
      const availableMeters = getAvailableMeters(item);
      if (rows.length === 0) {
        alert(`Please add at least one color row for ${item.title}`);
        return;
      }

      for (const row of rows) {
        if (!isValidColor(row.color)) {
          alert(`Invalid color number for ${item.title}. Use only 1 to 40.`);
          return;
        }

        if ((parseInt(row.quantity, 10) || 0) < 1000) {
          alert(`Each color quantity must be at least 1000m for ${item.title}.`);
          return;
        }
      }

      const uniqueColors = new Set(rows.map((row) => row.color));
      if (uniqueColors.size !== rows.length) {
        alert(`Duplicate colors found for ${item.title}. Use one row per color.`);
        return;
      }

      const requestedMeters = rows.reduce((sum, row) => sum + (parseInt(row.quantity, 10) || 0), 0);
      if (availableMeters !== null && requestedMeters > availableMeters) {
        alert(
          `Requested quantity exceeds available stock for ${item.title}. Available: ${availableMeters}m, Requested: ${requestedMeters}m.`
        );
        return;
      }
    }

    navigate('/cart-checkout', { state: { cartItems: cart } });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate('/home')} 
            variant="outline" 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <Card className="shadow-xl">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-6">Add some materials to get started!</p>
              <Button 
                onClick={() => navigate('/home')}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                Browse Materials
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/home')} 
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
          
          <Button 
            onClick={clearCart} 
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Color Catalog Button */}
                <div className="mb-4">
                  <Button
                    onClick={() => setShowColorCatalog(!showColorCatalog)}
                    variant="outline"
                    className="w-full"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    {showColorCatalog ? 'Hide' : 'View'} Color Catalog
                  </Button>
                  
                  {showColorCatalog && (
                    <div className="mt-4 border rounded-lg p-4 bg-white">
                      <img
                        src={catalogImg}
                        alt="Color Catalog"
                        onClick={() => window.open(catalogImg, '_blank')}
                        className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        title="Click to view full size"
                      />
                      <p className="text-sm text-center text-gray-600 mt-2">
                        Click image to view full size. Select colors 1-40
                      </p>
                    </div>
                  )}
                </div>

                {cart.map((item) => (
                  <div 
                    key={item.cartItemId} 
                    className="flex flex-col gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <img 
                        src={item.imageUrl || item.image || p3}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => { e.target.src = p3; }}
                      />
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {item.description || item.desc}
                            </p>
                            <div className="text-sm text-gray-500">
                              Price per meter: Rs.{item.price}
                            </div>
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="self-start"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="mt-3 space-y-3">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              Color-wise Quantities *
                            </Label>
                            <div className="space-y-2">
                              {getRows(item).map((row, rowIndex) => (
                                <div key={`${item.cartItemId}_${rowIndex}`} className="grid grid-cols-12 gap-2 items-center">
                                  <Input
                                    type="number"
                                    value={row.color || ''}
                                    onChange={(e) => handleRowChange(item, rowIndex, 'color', e.target.value)}
                                    placeholder="Color 1-40"
                                    className="col-span-5"
                                    min="1"
                                    max="40"
                                  />
                                  <Input
                                    type="number"
                                    value={row.quantity}
                                    onChange={(e) => handleRowChange(item, rowIndex, 'quantity', e.target.value)}
                                    placeholder="Meters"
                                    className="col-span-5"
                                    min="1000"
                                    max={getAvailableMeters(item) ?? undefined}
                                    step="100"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemoveRow(item, rowIndex)}
                                    className="col-span-2"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddRow(item)}
                              className="mt-2"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Color Row
                            </Button>
                            <p className="text-xs text-gray-500 mt-1">
                              Example: Color 12 - 1500m and Color 27 - 2000m in one item
                            </p>
                            {getAvailableMeters(item) !== null && (
                              <p className="text-xs text-amber-700 mt-1">
                                Max allowed for this item: {getAvailableMeters(item)}m total across all color rows.
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t font-bold text-lg text-teal-600">
                          Subtotal: Rs.{(item.price * item.cartQuantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item._id || item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.title}</span>
                      <span className="font-medium">Rs.{(item.price * item.cartQuantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-teal-600">Rs.{getCartTotal().toLocaleString()}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  Proceed to Checkout
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Minimum order quantity: 1000 meters per item
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
