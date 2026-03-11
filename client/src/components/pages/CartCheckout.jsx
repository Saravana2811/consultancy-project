import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import catalogImg from '../../assets/photo4.jpg'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { 
  CreditCard, 
  Smartphone, 
  Banknote,
  CheckCircle2,
  Package,
  Truck,
  Home,
  AlertCircle,
  ShoppingCart
} from 'lucide-react'

export default function CartCheckout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { cart, clearCart, getCartTotal } = useCart()
  const cartItems = state?.cartItems || cart

  const [method, setMethod] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Payment fields
  const [card, setCard] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [upi, setUpi] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.cartQuantity), 0)
  }

  const generateOrderId = () => {
    return 'PTM' + Date.now().toString().slice(-8)
  }

  const getDeliveryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (!cartItems || cartItems.length === 0) {
    navigate('/cart')
    return null
  }

  const handlePay = (e) => {
    e.preventDefault()
    setError('')

    // Validate email
    if (!email.includes('@')) return setError('Please enter a valid email address for receipt')

    // Validate payment method
    if (method === 'card') {
      if (card.replace(/\s/g, '').length < 15) return setError('Enter valid card number (15-16 digits)')
      if (!cardExpiry || cardExpiry.length < 5) return setError('Enter card expiry (MM/YY)')
      if (!cardCvv || cardCvv.length < 3) return setError('Enter valid CVV')
    }

    if (method === 'upi' && !upi.includes('@'))
      return setError('Enter valid UPI ID (e.g., name@upi)')

    setProcessing(true)
    const newOrderId = generateOrderId()
    setOrderId(newOrderId)

    // Send bill email for cart items
    try {
      const orderDetails = {
        orderId: newOrderId,
        items: cartItems.map(item => ({
          productId: item._id || item.id,
          title: item.title,
          lengthMeters: item.cartQuantity,
          colors: item.selectedColors,
          pricePerMeter: item.price,
          subtotal: item.price * item.cartQuantity
        })),
        total: calculateTotal(),
        deliveryDate: getDeliveryDate(),
        paymentMethod: method.toUpperCase()
      }

      fetch('http://localhost:5000/api/send-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          orderDetails: orderDetails,
          isCartOrder: true
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
            console.log('✅ Bill email sent successfully')
          } else {
            console.error('❌ Failed to send bill email:', data.error)
          }
        })
        .catch(err => {
          console.error('❌ Error sending bill email:', err)
        })
    } catch (err) {
      console.error('Error preparing bill email:', err)
    }

    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
      clearCart() // Clear cart after successful payment
    }, 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-gray-50 p-6">
        <Card className="max-w-3xl w-full shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center border-4 border-green-500 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-800">Order Placed Successfully!</h2>
              <div className="text-sm text-slate-600">
                Order ID: <Badge className="text-base font-mono bg-teal-600">{orderId}</Badge>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
              <CardContent className="p-6 space-y-3 text-left">
                <div className="font-semibold mb-2">Ordered Items:</div>
                {cartItems.map((item, index) => (
                  <div key={index} className="py-2 border-b last:border-0">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">{item.title}</span>
                      <strong className="text-slate-800">Rs.{(item.price * item.cartQuantity).toLocaleString()}</strong>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {item.cartQuantity}m | Colors: {item.selectedColors}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg pt-3 border-t-2 border-slate-300">
                  <span>Total Paid:</span>
                  <span className="text-green-600">Rs.{calculateTotal().toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
              <Truck className="w-5 h-5" />
              <span>Estimated Delivery: <strong>{getDeliveryDate()}</strong></span>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => window.print()} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                <Package className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
              <Button 
                onClick={() => navigate('/home')} 
                variant="outline"
                className="flex-1 border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT — ORDER SUMMARY */}
          <Card className="h-fit shadow-xl border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <Card key={index} className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100">
                    <CardContent className="p-4">
                      <div className="font-semibold">{item.title}</div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-slate-600">Price per meter:</span>
                        <span className="font-medium">Rs.{item.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Length:</span>
                        <span className="font-medium">{item.cartQuantity} meters</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Colors:</span>
                        <span className="font-medium">{item.selectedColors}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                        <span>Subtotal:</span>
                        <span className="text-teal-600">Rs.{(item.price * item.cartQuantity).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white border-2 border-slate-600">
                <CardContent className="p-5">
                  <div className="flex justify-between font-bold text-2xl">
                    <span>Total</span>
                    <span className="text-teal-300">Rs.{calculateTotal().toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 p-4 bg-teal-50 rounded-lg text-sm text-teal-800">
                <Truck className="w-5 h-5" />
                <span>Estimated Delivery: <strong>{getDeliveryDate()}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT — PAYMENT FORM */}
          <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-slate-700 via-blue-900 to-teal-900 text-white">
            <CardHeader className="pb-6 pt-8 px-8">
              <CardTitle className="text-4xl">Secure Checkout</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-8 pb-8">
              <form onSubmit={handlePay} className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="email" className="text-white text-xl">Email (for receipt) *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-16 text-xl px-4"
                  />
                </div>

                {/* PAYMENT METHODS */}
                <div className="space-y-5 pt-6 border-t border-white/10">
                  <h4 className="text-2xl font-semibold text-teal-300">Payment Method</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      type="button"
                      onClick={() => setMethod('card')}
                      variant={method === 'card' ? 'default' : 'outline'}
                      size="sm"
                      className={method === 'card' ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-lg py-4' : 'bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg py-4'}
                    >
                      <CreditCard className="w-6 h-6 mr-2" />
                      Card
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setMethod('upi')}
                      variant={method === 'upi' ? 'default' : 'outline'}
                      size="sm"
                      className={method === 'upi' ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-lg py-4' : 'bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg py-4'}
                    >
                      <Smartphone className="w-6 h-6 mr-2" />
                      UPI
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setMethod('cod')}
                      variant={method === 'cod' ? 'default' : 'outline'}
                      size="sm"
                      className={method === 'cod' ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-lg py-4' : 'bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg py-4'}
                    >
                      <Banknote className="w-6 h-6 mr-2" />
                      COD
                    </Button>
                  </div>
                </div>

                {/* CARD PAYMENT FIELDS */}
                {method === 'card' && (
                  <div className="space-y-5">
                    <div className="space-y-4">
                      <Label htmlFor="card" className="text-white text-xl">Card Number *</Label>
                      <Input
                        id="card"
                        value={card}
                        onChange={(e) =>
                          setCard(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())
                        }
                        placeholder="xxxx xxxx xxxx xxxx"
                        maxLength={19}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-16 text-xl px-4"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-4">
                        <Label htmlFor="expiry" className="text-white text-xl">Expiry (MM/YY) *</Label>
                        <Input
                          id="expiry"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '')
                            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4)
                            setCardExpiry(val)
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-16 text-xl px-4"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="cvv" className="text-white text-xl">CVV *</Label>
                        <Input
                          id="cvv"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="CVV"
                          maxLength={4}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-16 text-xl px-4"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI PAYMENT FIELDS */}
                {method === 'upi' && (
                  <div className="space-y-4">
                    <Label htmlFor="upi" className="text-white text-xl">UPI ID *</Label>
                    <Input
                      id="upi"
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      placeholder="name@upi"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-16 text-xl px-4"
                    />
                    <p className="text-lg text-teal-300">GPay | PhonePe | Paytm | Amazon Pay</p>
                  </div>
                )}

                {method === 'cod' && (
                  <Card className="bg-teal-500/10 border-teal-400/30">
                    <CardContent className="p-5 space-y-3">
                      <div className="font-semibold text-teal-300 text-xl">Cash on Delivery</div>
                      <div className="text-lg text-teal-200">Pay when product is delivered to your doorstep</div>
                      <ul className="text-lg text-teal-300 space-y-2">
                        <li>No online payment required</li>
                        <li>Pay after inspection</li>
                        <li>Additional Rs.50 COD charge applies</li>
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {error && (
                  <Card className="bg-red-500/10 border-red-400/30">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4 text-red-300 text-xl">
                        <AlertCircle className="w-7 h-7" />
                        <span>{error}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full py-8 text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:opacity-50"
                >
                  {processing ? 'Processing Payment...' : `Pay Rs.${calculateTotal().toLocaleString()}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
