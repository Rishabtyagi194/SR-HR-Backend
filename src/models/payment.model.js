// models/payment.model.js
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    amountCents: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    provider: { type: String, enum: ['stripe', 'paypal', 'razorpay', 'manual'], required: true },
    providerPaymentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    metadata: Object,
  },
  { timestamps: true },
);

PaymentSchema.index({ providerPaymentId: 1 });

const paymentModel = mongoose.model('Payment', PaymentSchema);

export default paymentModel;
