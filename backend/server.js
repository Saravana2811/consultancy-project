import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './src/routes/auth.js';
import { sendWelcomeEmail, sendBillEmail } from './src/utils/mail.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const ALLOWED_ORIGINS = CLIENT_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (no origin) and allowed origins
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Allow any localhost (different ports) and 127.0.0.1 for local development
    try {
      const parsed = new URL(origin);
      const hostname = parsed.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') return callback(null, true);
    } catch (e) {
      // ignore parse errors
    }
    console.warn(`Blocked CORS origin: ${origin}`);
    // Deny gracefully (false) instead of throwing an error to avoid crashing
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.use('/api/auth', authRouter);

// test email endpoint (POST { email, name })
app.post('/api/test-email', async (req, res) => {
  const { email, name } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  try {
    const result = await sendWelcomeEmail(email, name);
    if (result && result.ok) return res.json({ ok: true, message: 'Email sent', info: result.info });
    return res.status(500).json({ ok: false, error: result && result.error ? result.error : 'Failed to send email' });
  } catch (err) {
    console.error('Test email send failed', err);
    res.status(500).json({ error: err && err.message ? err.message : 'Failed to send test email' });
  }
});

// send bill endpoint (POST { email, orderDetails })
app.post('/api/send-bill', async (req, res) => {
  const { email, orderDetails } = req.body || {};
  
  if (!email) return res.status(400).json({ error: 'email is required' });
  if (!orderDetails) return res.status(400).json({ error: 'orderDetails is required' });
  
  try {
    const result = await sendBillEmail(email, orderDetails);
    if (result && result.ok) {
      return res.json({ ok: true, message: 'Bill email sent successfully' });
    }
    return res.status(500).json({ 
      ok: false, 
      error: result && result.error ? result.error : 'Failed to send bill email' 
    });
  } catch (err) {
    console.error('Bill email send failed', err);
    res.status(500).json({ 
      error: err && err.message ? err.message : 'Failed to send bill email' 
    });
  }
});

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'textile' });
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
