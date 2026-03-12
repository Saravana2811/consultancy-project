import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  isAdmin: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
