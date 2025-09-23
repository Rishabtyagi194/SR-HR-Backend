import mongoose from 'mongoose';

const jobVacancySchema = new mongoose.Schema(
  {
    title: { type: String }, // Job title
    employmentType: { type: String }, // Full-time, Part-time, etc.
    keySkills: [{ type: String }], // Array of skills
    companyIndustry: { type: String },
    department: { type: String },
    roleCategory: { type: String },
    workMode: { type: String, enum: ['Onsite', 'Remote', 'Hybrid'] },
    jobLocation: {
      type: [String],
      validate: [(arr) => arr.length <= 3, 'Max 3 locations allowed'],
    },
    locality: { type: String },
    workExperience: {
      from: { type: Number }, // in years
      to: { type: Number },
    },
    annualSalaryRange: {
      min: { type: Number },
      max: { type: Number },
    },
    educationQualification: { type: String },
    candidateIndustry: { type: String },
    diversityHiring: { type: Boolean, default: false },
    jobDescription: { type: String },
    multipleVacancies: { type: Boolean, default: false },
    includeWalkIn: { type: Boolean, default: false },
    candidateQuestions: [{ type: String }],
    notifyAIRecommended: { type: Boolean, default: false },
    notificationEmails: [{ type: String }],
    notificationFrequency: { type: String, enum: ['Daily', 'Weekly'], default: 'Daily' },
    companyName: { type: String },
    companyLegalName: { type: String },
    referenceCode: { type: String },
    autoRefresh: { type: Boolean, default: false },
    refreshSchedule: { type: String }, // e.g. "Daily", "Weekly"
  },
  { timestamps: true },
);

const JobVacancyModel = mongoose.model('JobVacancy', jobVacancySchema);
export default JobVacancyModel;
