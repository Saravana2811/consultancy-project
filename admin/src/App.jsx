import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import AdminLogin from './components/pages/AdminLogin'
import AdminSignin from './components/pages/AdminSignin'
import AdminDashboard from './components/pages/AdminDashboard'
import ForgotPassword from './components/pages/ForgotPassword'
import VerifyOTP from './components/pages/VerifyOTP'
import ResetPassword from './components/pages/ResetPassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default → admin login */}
        <Route path="/" element={<Navigate to="/admin-login" replace />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-signin" element={<AdminSignin />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Forgot password OTP flow */}
        <Route path="/forgot-password" element={<ForgotPassword redirectTo="/admin-login" />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword redirectTo="/admin-login" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/admin-login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
