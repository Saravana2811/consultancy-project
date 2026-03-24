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
  useEffect(() => {
    const scriptId = 'global-chatbot-embed'
    const styleId = 'global-chatbot-embed-style'
    const scriptBaseUrl = 'http://10.85.110.44:3000/embed.js'

    // Remove stale script instances so URL updates always take effect.
    document
      .querySelectorAll('script[data-bot-id="cmmuh5zeo00018l3ldyhodsho"], script#global-chatbot-embed')
      .forEach((node) => node.remove())

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        iframe[src*="10.85.110.44:3000"],
        iframe[src*="/embed"] {
          z-index: 2147483647 !important;
        }
      `
      document.head.appendChild(style)
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `${scriptBaseUrl}?v=${Date.now()}`
    script.async = true
    script.setAttribute('data-bot-id', 'cmmuh5zeo00018l3ldyhodsho')
    script.setAttribute('data-color', '#000000')
    script.onerror = () => {
      console.error('Chatbot embed failed to load:', scriptBaseUrl)
    }
    document.body.appendChild(script)
  }, [])

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
          <Route path="/payments" element={<Navigate to="/payment" replace />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
