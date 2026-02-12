import 'dotenv/config';
import mongoose from 'mongoose';
import Material from './src/models/Material.js';

async function checkMaterialQuantities() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'textile' });
    console.log('✅ MongoDB connected\n');

    const materials = await Material.find({ isActive: true });
    
    console.log(`📦 Found ${materials.length} active materials:\n`);
    
    materials.forEach((mat, index) => {
      console.log(`${index + 1}. ${mat.title}`);
      console.log(`   ID: ${mat._id}`);
      console.log(`   Quantity: ${mat.quantity} units`);
      console.log(`   Price: ₹${mat.price}`);
      console.log('');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMaterialQuantities();
