// models/candidate.model.js
import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  resumeUrl: { type: String }, // stored file link
  skills: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  workHistory: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  profileVisibility: { type: Boolean, default: true }, // visible to recruiters
  status: { type: String, enum: ["active", "deleted"], default: "active" }
}, { timestamps: true });

export default mongoose.model("Candidate", CandidateSchema);
