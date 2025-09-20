// models/application.model.js
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  resumeUrl: { type: String }, // override candidate resume if uploaded again
  coverLetter: { type: String },
  status: { 
    type: String, 
    enum: ["applied", "shortlisted", "rejected", "interview", "hired"], 
    default: "applied" 
  },
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
export default mongoose.model("Application", ApplicationSchema);
