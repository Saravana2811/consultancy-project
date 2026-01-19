import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendWelcomeEmail } from '../utils/mail.js';

const router = Router();

/* =========================
   Helpers
========================= */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(user) {
  return jwt.sign(
    { uid: user._id, email: user.email },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );
}

/* =========================
   SIGN UP
   POST /api/auth/signup
========================= */
router.post('/signup', async (req, res) => {
  try {
    const { name = '', email = '', password = '' } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    if (!validateEmail(email))
      return res.status(400).json({ error: 'Invalid email address' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash
    });

    const token = signToken(user);

    /* Send welcome email (non-blocking) */
    let emailStatus = { ok: true };
    try {
      const info = await sendWelcomeEmail(user.email, user.name);
      emailStatus = info || { ok: true };
    } catch (e) {
      console.warn('Welcome email failed:', e?.message);
      emailStatus = { ok: false, error: 'Email send failed' };
    }

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
      email: emailStatus
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   LOGIN
   POST /api/auth/login
========================= */
router.post('/login', async (req, res) => {
  try {
    const { email = '', password = '' } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);

    /* Optional login email */
    let emailStatus = { ok: true };
    try {
      const info = await sendWelcomeEmail(user.email, user.name);
      emailStatus = info || { ok: true };
    } catch (e) {
      console.warn('Login email failed:', e?.message);
      emailStatus = { ok: false };
    }

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
      email: emailStatus
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
