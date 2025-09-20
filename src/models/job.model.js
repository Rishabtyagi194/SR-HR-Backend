// models/job.model.js
import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  employmentType: { type: String, enum: ["full-time", "part-time", "internship", "contract"], default: "full-time" },
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: "INR" }
  },
  requiredSkills: [{ type: String }],
  experienceRequired: { type: Number, default: 0 },
  status: { type: String, enum: ["open", "closed", "draft"], default: "open" },
  postedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
}, { timestamps: true });

JobSchema.index({ title: "text", description: "text", location: 1 });
export default mongoose.model("Job", JobSchema);
