// models/employerUser.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const EmployerUserSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['employer_admin', 'employer_staff'],
      default: 'employer_admin',
    },

    permissions: [{ type: String, default: 'free' }], // e.g., ["post_jobs","manage_applications"]

    isActive: { type: Boolean, default: false },
    lastLogin: { type: Date },
    loginHistory: [
      {
        loginAt: { type: Date, default: Date.now },
        ip: String,
        userAgent: String,
      },
    ],
  },
  { timestamps: true },
);

// hash password before saving
EmployerUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password
EmployerUserSchema.methods.comparePassword = async function (employeerPassword) {
  return await bcrypt.compare(employeerPassword, this.password);
};

const employerUserModel = mongoose.model('EmployerUser', EmployerUserSchema);
export default employerUserModel;
