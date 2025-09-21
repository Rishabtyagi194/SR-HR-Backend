// models/admin.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    phone: { type: Number, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'system'], default: 'super_admin' },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

// hash password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password
AdminSchema.methods.comparePassword = async function (adminPassword) {
  return await bcrypt.compare(adminPassword, this.password);
};

const AdminModel = mongoose.model('Admin', AdminSchema);
export default AdminModel;
