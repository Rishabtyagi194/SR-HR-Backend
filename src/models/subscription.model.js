// models/subscription.model.js
import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    plan: {
      categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionCategory' },
      planSlug: { type: String, required: true },
      name: { type: String }, // store name at purchase time
      price: { type: Number }, // store purchased price
      currency: { type: String, default: 'INR' },
      validityDays: { type: Number },
      jobLocationLimit: { type: Number },
      jobApplyLimit: { type: Number },
      features: { type: [String], default: [] },
    },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    billingCycle: { type: String, enum: ['monthly', 'yearly', 'one_time'], required: true },
    nextBillingDate: { type: Date },
    paymentProviderSubscriptionId: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true },
);

SubscriptionSchema.index({ companyId: 1, status: 1 });

const SubscriptionModel = mongoose.model('Subscription', SubscriptionSchema);
export default SubscriptionModel;
