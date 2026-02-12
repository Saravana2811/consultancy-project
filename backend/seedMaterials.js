import 'dotenv/config';
import mongoose from 'mongoose';
import Material from './src/models/Material.js';
import User from './src/models/User.js';

const sampleMaterials = [
  {
    title: "Premium Cotton Fabric",
    description: "High-quality 100% organic cotton fabric, perfect for clothing and home textiles",
    category: "Cotton",
    imageUrl: "https://images.unsplash.com/photo-1524705866437-a9aeb8c83c85?w=500",
    price: 15.99,
    quantity: 500
  },
  {
    title: "Silk Satin Fabric",
    description: "Luxurious silk satin with smooth finish, ideal for evening wear and drapes",
    category: "Silk",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=500",
    price: 45.99,
    quantity: 200
  },
  {
    title: "Wool Blend Material",
    description: "Warm and durable wool blend, perfect for winter garments",
    category: "Wool",
    imageUrl: "https://images.unsplash.com/photo-1515442261605-f8e7904e6385?w=500",
    price: 32.50,
    quantity: 300
  },
  {
    title: "Denim Fabric",
    description: "Classic denim fabric in various weights, suitable for jeans and jackets",
    category: "Denim",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
    price: 22.00,
    quantity: 450
  },
  {
    title: "Linen Fabric",
    description: "Natural linen fabric with excellent breathability, great for summer wear",
    category: "Linen",
    imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500",
    price: 28.75,
    quantity: 350
  },
  {
    title: "Polyester Blend",
    description: "Durable polyester blend fabric, wrinkle-resistant and easy care",
    category: "Synthetic",
    imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea588c87?w=500",
    price: 12.50,
    quantity: 600
  }
];

async function seedMaterials() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'textile' });
    console.log('MongoDB connected');

    // Find an admin user or use any user
    const adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first using createAdmin.js');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.email}`);

    // Clear existing materials (optional)
    const shouldClear = process.argv[2] === '--clear';
    if (shouldClear) {
      await Material.deleteMany({});
      console.log('Cleared existing materials');
    }

    // Insert sample materials
    const materials = sampleMaterials.map(m => ({
      ...m,
      uploadedBy: adminUser._id
    }));

    const result = await Material.insertMany(materials);
    console.log(`✓ Successfully seeded ${result.length} materials!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedMaterials();
