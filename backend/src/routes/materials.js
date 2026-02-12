import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Material from '../models/Material.js';
import User from '../models/User.js';

const router = Router();

/* =========================
   Middleware: Verify JWT Token
========================= */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

/* =========================
   Middleware: Check if Admin
========================= */
async function checkAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check the isAdmin field
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (err) {
    console.error('Check admin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

/* =========================
   GET ALL MATERIALS (Public)
   GET /api/materials
========================= */
router.get('/', async (req, res) => {
  try {
    const materials = await Material.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name email');
    
    console.log(`📦 Fetched ${materials.length} active materials`);
    
    res.json({ materials });
  } catch (err) {
    console.error('Get materials error:', err);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

/* =========================
   GET SINGLE MATERIAL
   GET /api/materials/:id
========================= */
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    res.json({ material });
  } catch (err) {
    console.error('Get material error:', err);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

/* =========================
   CREATE MATERIAL (Authenticated Users)
   POST /api/materials
========================= */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, imageUrl, price, quantity, isActive } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const materialData = {
      title,
      description,
      category,
      imageUrl,
      price: price || 0,
      quantity: quantity || 0,
      uploadedBy: req.user.uid,
      isActive: isActive !== undefined ? isActive : true
    };
    
    console.log('Creating material:', materialData.title, '| isActive:', materialData.isActive);
    
    const material = await Material.create(materialData);
    
    const populatedMaterial = await Material.findById(material._id)
      .populate('uploadedBy', 'name email');
    
    console.log('✅ Material created successfully:', populatedMaterial._id);
    
    res.status(201).json({ 
      message: 'Material created successfully',
      material: populatedMaterial 
    });
  } catch (err) {
    console.error('Create material error:', err);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

/* =========================
   UPDATE MATERIAL (Authenticated Users)
   PUT /api/materials/:id
========================= */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, imageUrl, price, quantity, isActive } = req.body;
    
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    if (title !== undefined) material.title = title;
    if (description !== undefined) material.description = description;
    if (category !== undefined) material.category = category;
    if (imageUrl !== undefined) material.imageUrl = imageUrl;
    if (price !== undefined) material.price = price;
    if (quantity !== undefined) material.quantity = quantity;
    if (isActive !== undefined) material.isActive = isActive;
    
    await material.save();
    
    const updatedMaterial = await Material.findById(material._id)
      .populate('uploadedBy', 'name email');
    
    res.json({ 
      message: 'Material updated successfully',
      material: updatedMaterial 
    });
  } catch (err) {
    console.error('Update material error:', err);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

/* =========================
   DELETE MATERIAL (Authenticated Users)
   DELETE /api/materials/:id
========================= */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    await Material.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    console.error('Delete material error:', err);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

/* =========================
   REDUCE MATERIAL QUANTITY AFTER PURCHASE (Public)
   POST /api/materials/:id/reduce-quantity
========================= */
router.post('/:id/reduce-quantity', async (req, res) => {
  try {
    const { quantityPurchased } = req.body;
    
    if (!quantityPurchased || quantityPurchased <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }
    
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Check if enough quantity is available
    if (material.quantity < quantityPurchased) {
      return res.status(400).json({ 
        error: 'Insufficient quantity available',
        available: material.quantity,
        requested: quantityPurchased
      });
    }
    
    // Reduce the quantity
    material.quantity -= quantityPurchased;
    await material.save();
    
    console.log(`📉 Reduced quantity for ${material.title}: ${quantityPurchased} meters. Remaining: ${material.quantity}`);
    
    res.json({ 
      message: 'Quantity reduced successfully',
      material: {
        id: material._id,
        title: material.title,
        remainingQuantity: material.quantity
      }
    });
  } catch (err) {
    console.error('Reduce quantity error:', err);
    res.status(500).json({ error: 'Failed to reduce quantity' });
  }
});

export default router;
