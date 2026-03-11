import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Header from './components/before/Header'
import About from './components/before/About'
import Wedo from './components/before/Wedo'
import Footer from './components/before/Footer'
import './App.css'
import Signin from './components/pages/Signin'
import Login from './components/pages/Login'
import OAuthCallback from './components/pages/OAuthCallback'
import AdminLogin from './components/pages/AdminLogin'
import AdminSignin from './components/pages/AdminSignin'
import Home from './components/after/Home.jsx'
import Payment from './components/pages/Payment'
import Cart from './components/pages/Cart'
import CartCheckout from './components/pages/CartCheckout'
import AdminDashboard from './components/pages/AdminDashboard'

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
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-signin" element={<AdminSignin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/cart-checkout" element={<CartCheckout />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          <Route path="/offers" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
