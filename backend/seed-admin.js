import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
await mongoose.connect(MONGO_URI);
console.log('MongoDB connected');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in root .env for seeding');
  process.exit(1);
}

let user = await User.findOne({ email: ADMIN_EMAIL });

if (user) {
  user.isAdmin = true;
  user.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await user.save();
  console.log('✅ Updated existing user → isAdmin: true, password reset to 1234567');
} else {
  await User.create({
    name: 'Admin',
    email: ADMIN_EMAIL,
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
    isAdmin: true,
  });
  console.log('✅ Created new admin user');
}

await mongoose.disconnect();
process.exit(0);
