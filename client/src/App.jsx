import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Header from './components/before/Header'
import About from './components/before/About'
import Wedo from './components/before/Wedo'
import Footer from './components/before/Footer'
import './App.css'
import Signin from './components/pages/Signin'
import Login from './components/pages/Login'
import OAuthCallback from './components/pages/OAuthCallback'
import Home from './components/after/Home.jsx'
import Payment from './components/pages/Payment'
import Cart from './components/pages/Cart'
import CartCheckout from './components/pages/CartCheckout'
import ForgotPassword from './components/pages/ForgotPassword'
import VerifyOTP from './components/pages/VerifyOTP'
import ResetPassword from './components/pages/ResetPassword'

const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:5174'

function ExternalAdminRedirect({ path }) {
  const location = useLocation()

  useEffect(() => {
    const target = `${ADMIN_APP_URL}${path}${location.search}${location.hash}`
    window.location.replace(target)
  }, [location.hash, location.search, path])

  return null
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header />
                <Wedo />
                <About />
                <Footer />
              </>
            }
          />
          <Route path="/signin" element={<Signin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/home" element={<Home />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/cart-checkout" element={<CartCheckout />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-login" element={<ExternalAdminRedirect path="/admin-login" />} />
          <Route path="/admin-signin" element={<ExternalAdminRedirect path="/admin-signin" />} />
          <Route path="/admin" element={<ExternalAdminRedirect path="/admin" />} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route path="/offers" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
