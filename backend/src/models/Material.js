import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Material', materialSchema);
