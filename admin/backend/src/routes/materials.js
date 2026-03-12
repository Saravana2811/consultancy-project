import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Material from '../models/Material.js';
import User from '../models/User.js';

const router = Router();

function authenticateToken(req, res, next) {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET || 'admin_secret', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

/* GET all materials */
router.get('/', async (req, res) => {
  try {
    const materials = await Material.find({}).sort({ createdAt: -1 }).populate('uploadedBy', 'name email');
    res.json({ materials });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

/* GET single material */
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json({ material });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

/* CREATE material */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, imageUrl, price, quantity, isActive } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const material = await Material.create({
      title, description, category, imageUrl,
      price: price || 0,
      quantity: quantity || 0,
      uploadedBy: req.user.uid,
      isActive: isActive !== undefined ? isActive : true,
    });

    const populated = await Material.findById(material._id).populate('uploadedBy', 'name email');
    res.status(201).json({ message: 'Material created successfully', material: populated });
  } catch (err) {
    console.error('Create material error:', err);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

/* UPDATE material */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, imageUrl, price, quantity, isActive } = req.body;
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });

    if (title !== undefined) material.title = title;
    if (description !== undefined) material.description = description;
    if (category !== undefined) material.category = category;
    if (imageUrl !== undefined) material.imageUrl = imageUrl;
    if (price !== undefined) material.price = price;
    if (quantity !== undefined) material.quantity = quantity;
    if (isActive !== undefined) material.isActive = isActive;

    await material.save();
    const updated = await Material.findById(material._id).populate('uploadedBy', 'name email');
    res.json({ message: 'Material updated successfully', material: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update material' });
  }
});

/* DELETE material */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

/* REDUCE QUANTITY after purchase */
router.post('/:id/reduce-quantity', async (req, res) => {
  try {
    const { quantityPurchased } = req.body;
    if (!quantityPurchased || quantityPurchased <= 0)
      return res.status(400).json({ error: 'Valid quantity is required' });

    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    if (material.quantity < quantityPurchased)
      return res.status(400).json({ error: 'Insufficient quantity', available: material.quantity });

    material.quantity -= quantityPurchased;
    await material.save();
    res.json({ message: 'Quantity reduced', material: { id: material._id, remainingQuantity: material.quantity } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reduce quantity' });
  }
});

export default router;
