import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOtpEmail } from '../utils/mail.js';

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'poornimark.23aim@kongu.edu';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================
   ADMIN LOGIN
   POST /api/auth/login
========================= */
router.post('/login', async (req, res) => {
  try {
    const { email = '', password = '' } = req.body || {};

    // Only allow the designated admin email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase())
      return res.status(403).json({ error: 'Access denied. Unauthorized email.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash)
      return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isAdmin)
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { uid: user._id, email: user.email, isAdmin: true },
      process.env.JWT_SECRET || 'admin_secret',
      { expiresIn: '7d' }
    );

    return res.json({
      ok: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: true },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   FORGOT PASSWORD – sends OTP
   POST /api/auth/forgot-password
========================= */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email = '' } = req.body || {};
    if (!email || !validateEmail(email))
      return res.status(400).json({ error: 'Valid email is required' });

    // Always respond ok to avoid email enumeration
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ ok: true });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.otpCode = await bcrypt.hash(otp, 10);
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendOtpEmail(user.email, otp);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   VERIFY OTP
   POST /api/auth/verify-otp
========================= */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email = '', otp = '' } = req.body || {};
    if (!email || !otp)
      return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otpCode || !user.otpExpiry)
      return res.status(400).json({ error: 'OTP expired or invalid' });

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ error: 'OTP expired or invalid' });

    const match = await bcrypt.compare(otp, user.otpCode);
    if (!match)
      return res.status(400).json({ error: 'OTP expired or invalid' });

    const resetToken = jwt.sign(
      { uid: user._id, purpose: 'password_reset' },
      process.env.JWT_SECRET || 'admin_secret',
      { expiresIn: '15m' }
    );

    user.otpCode = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({ ok: true, resetToken });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   RESET PASSWORD
   POST /api/auth/reset-password
========================= */
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken = '', newPassword = '' } = req.body || {};
    if (!resetToken || !newPassword)
      return res.status(400).json({ error: 'Reset token and new password are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'admin_secret');
    } catch {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }

    if (decoded.purpose !== 'password_reset')
      return res.status(400).json({ error: 'Invalid reset token' });

    const user = await User.findById(decoded.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ ok: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
