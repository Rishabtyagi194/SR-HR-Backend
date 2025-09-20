// models/endUser.model.js
import mongoose from "mongoose";

const JobSeekerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },

  resumeUrl: { type: String }, // uploaded resume
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

  profileVisibility: { type: Boolean, default: true }, // searchable by employers
  status: { type: String, enum: ["active","deleted"], default: "active" }
}, { timestamps: true });

const endUserModel = mongoose.model("JobSeeker", JobSeekerSchema);
export default endUserModel
