import dotenv from 'dotenv';
dotenv.config(); // ✅ FIXED (auto loads .env)

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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (CLIENT_ORIGIN && origin === CLIENT_ORIGIN) return callback(null, true);
    return callback(new Error('CORS blocked for origin: ' + origin));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/api/auth', authRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/upload', uploadRouter);

// health check
app.get('/api/health', (_, res) =>
  res.json({ ok: true, port: PORT })
);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'textile';

if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI, { dbName: DB_NAME })
  .then(() => {
    console.log(`✅ MongoDB connected (db: ${DB_NAME})`);
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error("❌ DB error:", err);
    process.exit(1);
  });