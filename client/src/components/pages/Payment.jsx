import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import catalogImg from '../../assets/photo4.jpg'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Banknote,
  CheckCircle2,
  Package,
  MapPin,
  Palette,
  Truck,
  Tag,
  Home,
  AlertCircle
} from 'lucide-react'

export default function Payment() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const product = state?.product

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

  // Delivery details
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [deliveryState, setDeliveryState] = useState('')
  const [pincode, setPincode] = useState('')

  // Order details
  const [selectedColorNumbers, setSelectedColorNumbers] = useState('')
  const [lengthMeters, setLengthMeters] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [orderId, setOrderId] = useState('')

  const pricePerMeter = 45
  const deliveryCharge = lengthMeters && Number(lengthMeters) >= 5000 ? 0 : 299

  const calculateSubtotal = () => {
    const length = Number(lengthMeters) || 0
    return length * pricePerMeter
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = (subtotal * discount) / 100
    return subtotal - discountAmount + deliveryCharge
  }

  const applyPromo = () => {
    const code = promoCode.toUpperCase()
    if (code === 'TEXTILE10' || code === 'FIRSTORDER') {
      setDiscount(10)
      setError('')
    } else if (code === 'BULK20') {
      setDiscount(20)
      setError('')
    } else {
      setError('Invalid promo code')
      setDiscount(0)
    }
  }

  const generateOrderId = () => {
    return 'PTM' + Date.now().toString().slice(-8)
  }

  const getDeliveryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (!product) return null

  const handlePay = (e) => {
    e.preventDefault()
    setError('')

    // Validate delivery details
    if (!fullName.trim()) return setError('Please enter your full name')
    if (!phone || phone.length < 10) return setError('Please enter a valid 10-digit phone number')
    if (!gstNumber || gstNumber.length !== 15) return setError('Please enter a valid 15-character GST number')
    if (!email.includes('@')) return setError('Please enter a valid email address for receipt')
    if (!address.trim()) return setError('Please enter delivery address')
    if (!city.trim()) return setError('Please enter city')
    if (!pincode || pincode.length !== 6) return setError('Please enter a valid 6-digit pincode')

    // Validate payment method
    if (method === 'card') {
      if (card.replace(/\s/g, '').length < 15) return setError('Enter valid card number (15-16 digits)')
      if (!cardExpiry || cardExpiry.length < 5) return setError('Enter card expiry (MM/YY)')
      if (!cardCvv || cardCvv.length < 3) return setError('Enter valid CVV')
    }

    if (method === 'upi' && !upi.includes('@'))
      return setError('Enter valid UPI ID (e.g., name@upi)')

    // Validate color numbers and length
    const colorNums = selectedColorNumbers
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)

    if (colorNums.length === 0) return setError('Please enter at least one color number from the catalog')

    const lengthVal = Number(String(lengthMeters).replace(/[^0-9.-]/g, ''))
    if (!lengthVal || lengthVal < 1000) return setError('Length must be at least 1000 meters')

    setProcessing(true)
    const newOrderId = generateOrderId()
    setOrderId(newOrderId)

    // Send bill email
    try {
      const orderDetails = {
        orderId: newOrderId,
        customerName: fullName,
        productTitle: product.title,
        lengthMeters: lengthVal,
        colors: selectedColorNumbers,
        phone,
        gstNumber,
        address,
        city,
        state: deliveryState,
        pincode,
        pricePerMeter,
        subtotal: calculateSubtotal(),
        discount,
        deliveryCharge,
        total: calculateTotal(),
        deliveryDate: getDeliveryDate(),
        paymentMethod: method.toUpperCase()
      }

      console.log('Sending bill with quantity reduction:', {
        productId: product._id || product.id,
        quantityPurchased: lengthVal
      })

      fetch('http://localhost:5000/api/send-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          orderDetails: orderDetails,
          productId: product._id || product.id,
          quantityPurchased: lengthVal
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
            console.log('✅ Bill email sent successfully and quantity updated')
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
    }, 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center border-4 border-green-500 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-800">Order Placed Successfully!</h2>
              <div className="text-sm text-slate-600">
                Order ID: <Badge className="text-base font-mono bg-purple-600">{orderId}</Badge>
              </div>
            </div>
            
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
              <CardContent className="p-6 space-y-3 text-left">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Product:</span>
                  <strong className="text-slate-800">{product.title}</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Length:</span>
                  <strong className="text-slate-800">{lengthMeters} meters</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Colors:</span>
                  <strong className="text-slate-800">{selectedColorNumbers}</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Delivery to:</span>
                  <strong className="text-slate-800">{fullName}</strong>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t-2 border-slate-300">
                  <span>Total Paid:</span>
                  <span className="text-green-600">₹{calculateTotal().toLocaleString()}</span>
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
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Package className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
              <Button 
                onClick={() => navigate('/home')} 
                variant="outline"
                className="flex-1 border-2 bg-slate-600 text-white hover:bg-slate-700"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT — PRODUCT SUMMARY */}
          <Card className="h-fit shadow-xl border-2">
            <CardHeader>
              <CardTitle className="text-2xl">{product.title}</CardTitle>
              <p className="text-slate-600">{product.desc}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <img
                  src={catalogImg}
                  alt="Color Catalog"
                  onClick={() => window.open(catalogImg, '_blank')}
                  className="w-full rounded-xl cursor-pointer border-2 border-slate-200 hover:border-purple-400 transition-all"
                  title="Click to view full size"
                />
                <div className="text-sm text-purple-600 text-center mt-3 font-medium">
                  👆 Click to view color catalog
                </div>
              </div>

              <div className="border-t pt-6">
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
                  <CardContent className="p-5 space-y-3">
                    <h4 className="font-semibold text-lg mb-4">Order Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Price per meter</span>
                      <span className="font-medium">₹{pricePerMeter}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Length</span>
                      <span className="font-medium">{lengthMeters || 0} meters</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">₹{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span className="font-medium">-₹{((calculateSubtotal() * discount) / 100).toLocaleString()}</span>
                      </div>
                    )}
                    {deliveryCharge === 0 && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        🎉 Free delivery on orders ≥ 5000m
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-3 border-t-2">
                      <span>Total</span>
                      <span className="text-purple-600">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                <Truck className="w-5 h-5" />
                <span>Estimated Delivery: <strong>{getDeliveryDate()}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT — PAYMENT FORM */}
          <Card className="shadow-xl border-2 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Secure Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePay} className="space-y-6">
                {/* DELIVERY DETAILS */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold flex items-center gap-2 text-purple-300">
                    <MapPin className="w-5 h-5" />
                    Delivery Details
                  </h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit number"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstNumber" className="text-white">GST Number *</Label>
                      <Input
                        id="gstNumber"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value.toUpperCase().slice(0, 15))}
                        placeholder="15-digit GST"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">Address *</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Flat no, Building, Street"
                      rows={2}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-white">City *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryState" className="text-white">State *</Label>
                      <Input
                        id="deliveryState"
                        value={deliveryState}
                        onChange={(e) => setDeliveryState(e.target.value)}
                        placeholder="State"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-white">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email (for receipt) *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>

                {/* ORDER DETAILS */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-lg font-semibold flex items-center gap-2 text-purple-300">
                    <Palette className="w-5 h-5" />
                    Order Details
                  </h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="colorNumbers" className="text-white">Color Numbers (from catalog) *</Label>
                    <Input
                      id="colorNumbers"
                      value={selectedColorNumbers}
                      onChange={(e) => setSelectedColorNumbers(e.target.value)}
                      placeholder="e.g. 1001,1005,1010"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <p className="text-xs text-purple-300">View catalog above and enter color numbers separated by commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lengthMeters" className="text-white">Length (meters) *</Label>
                    <Input
                      id="lengthMeters"
                      value={lengthMeters}
                      onChange={(e) => setLengthMeters(e.target.value.replace(/\D/g, ''))}
                      placeholder="Minimum 1000 meters"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <p className="text-xs text-purple-300">Minimum order: 1000 meters • Free delivery on 5000+ meters</p>
                  </div>

                  {/* PROMO CODE */}
                  <div className="space-y-2">
                    <Label htmlFor="promoCode" className="text-white flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Promo Code
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="promoCode"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button
                        type="button"
                        onClick={applyPromo}
                        variant="outline"
                        className="bg-purple-500/20 text-purple-300 border-purple-400 hover:bg-purple-500/30"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-xs text-purple-300">💡 Try: TEXTILE10, FIRSTORDER, BULK20</p>
                  </div>
                </div>

                {/* PAYMENT METHODS */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-purple-300">Payment Method</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      type="button"
                      onClick={() => setMethod('card')}
                      variant={method === 'card' ? 'default' : 'outline'}
                      className={method === 'card' ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Card
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setMethod('upi')}
                      variant={method === 'upi' ? 'default' : 'outline'}
                      className={method === 'upi' ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      UPI
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setMethod('net')}
                      variant={method === 'net' ? 'default' : 'outline'}
                      className={method === 'net' ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Bank
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setMethod('cod')}
                      variant={method === 'cod' ? 'default' : 'outline'}
                      className={method === 'cod' ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}
                    >
                      <Banknote className="w-4 h-4 mr-2" />
                      COD
                    </Button>
                  </div>
                </div>

                {/* CARD PAYMENT FIELDS */}
                {method === 'card' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card" className="text-white">Card Number *</Label>
                      <Input
                        id="card"
                        value={card}
                        onChange={(e) =>
                          setCard(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())
                        }
                        placeholder="xxxx xxxx xxxx xxxx"
                        maxLength={19}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry" className="text-white">Expiry (MM/YY) *</Label>
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
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-white">CVV *</Label>
                        <Input
                          id="cvv"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="CVV"
                          maxLength={4}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI PAYMENT FIELDS */}
                {method === 'upi' && (
                  <div className="space-y-2">
                    <Label htmlFor="upi" className="text-white">UPI ID *</Label>
                    <Input
                      id="upi"
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      placeholder="name@upi"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <p className="text-xs text-purple-300">GPay • PhonePe • Paytm • Amazon Pay</p>
                  </div>
                )}

                {/* NET BANKING FIELDS */}
                {method === 'net' && (
                  <div className="space-y-2">
                    <Label htmlFor="bank" className="text-white">Select Bank *</Label>
                    <select 
                      id="bank"
                      className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white"
                    >
                      <option className="text-slate-800">State Bank of India</option>
                      <option className="text-slate-800">HDFC Bank</option>
                      <option className="text-slate-800">ICICI Bank</option>
                      <option className="text-slate-800">Axis Bank</option>
                      <option className="text-slate-800">Punjab National Bank</option>
                      <option className="text-slate-800">Bank of Baroda</option>
                      <option className="text-slate-800">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {/* COD INFO */}
                {method === 'cod' && (
                  <Card className="bg-purple-500/10 border-purple-400/30">
                    <CardContent className="p-4 space-y-2">
                      <div className="font-semibold text-purple-300">💵 Cash on Delivery</div>
                      <div className="text-sm text-purple-200">Pay when product is delivered to your doorstep</div>
                      <div className="text-xs text-purple-300 space-y-1">
                        <div>✓ No online payment required</div>
                        <div>✓ Pay after inspection</div>
                        <div>✓ Additional ₹50 COD charge applies</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {error && (
                  <Card className="bg-red-500/10 border-red-400/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-red-300">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
                >
                  {processing ? '⏳ Processing Payment...' : `Pay ₹${calculateTotal().toLocaleString()}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
