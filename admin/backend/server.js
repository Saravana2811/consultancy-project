import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './src/routes/auth.js';
import materialsRouter from './src/routes/materials.js';
import uploadRouter from './src/routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

// ─── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools, local dev, configured frontend, and Render domains.
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (CLIENT_ORIGIN && origin === CLIENT_ORIGIN) return callback(null, true);
    if (/^https:\/\/.+\.onrender\.com$/.test(origin)) return callback(null, true);
    return callback(new Error('CORS blocked for origin: ' + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ROUTES ────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/upload', uploadRouter);

app.get('/health', (_, res) => res.json({ ok: true, service: 'admin-backend', port: PORT }));
app.get('/api/health', (_, res) => res.json({ ok: true, service: 'admin-backend', port: PORT }));

// ─── MONGO + START ─────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI/MONGODB_URI not set in environment');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected (admin backend)');
    app.listen(PORT, () => console.log(`🔐 Admin API running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });
