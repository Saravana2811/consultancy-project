import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
}, { 
  timestamps: true,
  collection: 'admin_users'
});

export default mongoose.model('Admin', adminSchema);
