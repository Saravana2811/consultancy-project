import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

async function createAdminUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin';

  if (!email || !password) {
    console.error('Usage: node createAdmin.js <email> <password> [name]');
    console.error('Example: node createAdmin.js admin@example.com password123 "Admin User"');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'textile' });
    console.log('MongoDB connected');

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      // Update existing user to admin
      existingUser.isAdmin = true;
      await existingUser.save();
      console.log(`✓ User ${email} updated to admin successfully!`);
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        isAdmin: true
      });
      console.log(`✓ Admin user created successfully!`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdminUser();
