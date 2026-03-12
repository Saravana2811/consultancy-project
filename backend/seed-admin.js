import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
await mongoose.connect(MONGO_URI);
console.log('MongoDB connected');

const ADMIN_EMAIL = 'poornimark.23aim@kongu.edu';
const ADMIN_PASSWORD = '1234567';

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
