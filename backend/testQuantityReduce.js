import 'dotenv/config';
import mongoose from 'mongoose';
import Material from './src/models/Material.js';

async function testQuantityReduction() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Missing MONGODB_URI in .env');
      process.exit(1);
    }

    await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'textile' });
    console.log('✅ MongoDB connected');

    // Find first material
    const material = await Material.findOne({ isActive: true });
    
    if (!material) {
      console.log('❌ No materials found in database');
      process.exit(0);
    }

    console.log('\n📦 Testing with material:');
    console.log(`   ID: ${material._id}`);
    console.log(`   Title: ${material.title}`);
    console.log(`   Current Quantity: ${material.quantity}`);

    // Test reducing quantity
    const testAmount = 100;
    const oldQuantity = material.quantity;
    
    if (material.quantity >= testAmount) {
      material.quantity -= testAmount;
      await material.save();
      console.log(`\n✅ Successfully reduced quantity by ${testAmount}`);
      console.log(`   Old: ${oldQuantity} -> New: ${material.quantity}`);
      
      // Restore original quantity
      material.quantity = oldQuantity;
      await material.save();
      console.log(`\n🔄 Restored original quantity: ${material.quantity}`);
    } else {
      console.log(`\n⚠️ Insufficient quantity. Available: ${material.quantity}, Test amount: ${testAmount}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testQuantityReduction();
