// // models/subscriptionPlan.model.js

// import mongoose from 'mongoose';

// const PlanOptionSchema = new mongoose.Schema({
//   name: { type: String, required: true }, // e.g., "Hot Vacancy"
//   slug: { type: String, required: true },
//   price: { type: Number, required: true },
//   currency: { type: String, default: 'INR' },
//   validityDays: { type: Number, required: true },
//   jobLocationLimit: { type: Number, default: 1 },
//   jobApplyLimit: { type: Number, default: 0 }, // 0 => unlimited
//   features: { type: [String], default: [] },
//   isActive: { type: Boolean, default: true },
//   metadata: { type: Object },
// });

// const CategorySchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true }, // e.g., "Job Posting"
//     slug: { type: String, required: true, unique: true },
//     description: { type: String },
//     plans: [PlanOptionSchema], // Embed plans here
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true },
// );

// const subscriptionCategoryModel = mongoose.model('SubscriptionCategory', CategorySchema);
// export default subscriptionCategoryModel;
