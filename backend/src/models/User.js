import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String }, // Optional for OAuth users
  googleId: { type: String, sparse: true }, // Google OAuth ID
  isAdmin: { type: Boolean, default: false },
  gstNo: { type: String, trim: true },
  companyName: { type: String, trim: true },
  address: { type: String, trim: true },
  contactDetails: { type: String, trim: true },
  otpCode: { type: String },      // hashed OTP for password reset
  otpExpiry: { type: Date },       // OTP expiry timestamp
}, { timestamps: true });

export default mongoose.model('User', userSchema);
