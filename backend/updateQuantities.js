import 'dotenv/config';
import mongoose from 'mongoose';
import Material from './src/models/Material.js';

async function updateQuantities() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'textile' });
    console.log('✅ MongoDB connected\n');

    // Update all active materials to have realistic quantities (in meters)
    const result = await Material.updateMany(
      { isActive: true },
      { $set: { quantity: 50000 } } // 50,000 meters initial stock
    );

    console.log(`✅ Updated ${result.modifiedCount} materials with new quantity: 50,000 meters\n`);

    // Show updated materials
    const materials = await Material.find({ isActive: true });
    
    console.log('📦 Updated materials:\n');
    materials.forEach((mat, index) => {
      console.log(`${index + 1}. ${mat.title}`);
      console.log(`   Quantity: ${mat.quantity} meters`);
      console.log('');
    });

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateQuantities();
