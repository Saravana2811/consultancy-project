import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { sendWelcomeEmail, sendOtpEmail } from '../utils/mail.js';

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
    const { name = '', email = '', password = '', isAdmin = false, gstNo = '', companyName = '', address = '', contactDetails = '' } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    if (!validateEmail(email))
      return res.status(400).json({ error: 'Invalid email address' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Check if email exists in both User and Admin collections
    const userExists = await User.findOne({ email });
    const adminExists = await Admin.findOne({ email });
    if (userExists || adminExists)
      return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin or user based on isAdmin flag
    let user;
    if (isAdmin) {
      user = await Admin.create({
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash
      });
    } else {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        gstNo: gstNo.trim(),
        companyName: companyName.trim(),
        address: address.trim(),
        contactDetails: contactDetails.trim()
      });
    }

    const token = signToken(user);

    /* Send welcome email (non-blocking) - skip for admin users */
    let emailStatus = { ok: true };
    if (!isAdmin) {
      try {
        const info = await sendWelcomeEmail(user.email, user.name);
        emailStatus = info || { ok: true };
      } catch (e) {
        console.warn('Welcome email failed:', e?.message);
        emailStatus = { ok: false, error: 'Email send failed' };
      }
    }

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, isAdmin: isAdmin },
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

    // Check both User and Admin collections
    let user = await User.findOne({ email: email.toLowerCase() });
    let isAdmin = false;
    
    if (!user) {
      user = await Admin.findOne({ email: email.toLowerCase() });
      isAdmin = !!user;
    }
    
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);

    /* Optional login email - skip for admin users */
    let emailStatus = { ok: true };
    if (!isAdmin) {
      try {
        const info = await sendWelcomeEmail(user.email, user.name);
        emailStatus = info || { ok: true };
      } catch (e) {
        console.warn('Login email failed:', e?.message);
        emailStatus = { ok: false };
      }
    }

    return res.json({
      user: { id: user._id, name: user.name, email: user.email, isAdmin: isAdmin },
      token,
      email: emailStatus
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   GET CURRENT USER
   GET /api/auth/me
========================= */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access token required' });
    
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', async (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token' });
      
      const user = await User.findById(decoded.uid).select('-passwordHash');
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      return res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* =========================
   Middleware Functions
========================= */
export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      // Try to find user in User collection first
      let user = await User.findById(decoded.uid).select('-passwordHash');
      let isAdminUser = false;
      
      // If not found, try Admin collection
      if (!user) {
        user = await Admin.findById(decoded.uid).select('-passwordHash');
        isAdminUser = !!user;
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      req.user = user;
      req.isAdmin = isAdminUser;
      next();
    });
  } catch (err) {
    console.error('Verify token error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export function isAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/* =========================
   GOOGLE OAUTH ROUTES
========================= */

// Initiate Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/login?error=oauth_failed`
  }),
  async (req, res) => {
    try {
      // User is authenticated, generate JWT token
      const user = req.user;
      const token = signToken(user);

      // Send welcome email for new OAuth users (non-blocking)
      if (!user.passwordHash || user.passwordHash === 'oauth_user') {
        try {
          await sendWelcomeEmail(user.email, user.name);
        } catch (e) {
          console.warn('Welcome email failed:', e?.message);
        }
      }

      // Redirect to frontend with token
      const redirectUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/oauth/callback?token=${token}&userId=${user._id}&userName=${encodeURIComponent(user.name)}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/login?error=oauth_error`);
    }
  }
);

/* =========================
   FORGOT PASSWORD
   POST /api/auth/forgot-password
========================= */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email = '' } = req.body || {};
    if (!email || !validateEmail(email))
      return res.status(400).json({ error: 'Valid email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond ok to avoid email enumeration
    if (!user) return res.json({ ok: true });

    // Generate 6-digit OTP
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

    // Issue a short-lived reset token
    const resetToken = jwt.sign(
      { uid: user._id, purpose: 'password_reset' },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '15m' }
    );

    // Clear OTP so it cannot be reused
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
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'dev_secret');
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
