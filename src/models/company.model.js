// models/company.model.js
import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    industry: { type: String },
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201-1000', '1000+'], default: '1-10' },
    website: { type: String },
    logoUrl: { type: String },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    address: { type: String },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },

    // Reference to Employer Admin (the subscription owner)
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployerUser' },
  },
  { timestamps: true },
);

const companyModel = mongoose.model('Company', CompanySchema);
export default companyModel;
