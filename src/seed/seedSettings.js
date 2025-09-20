import mongoose from "mongoose";
import settingModel from "../models/settings.model.js";

async function seedSettings() {
  await mongoose.connect("mongodb://localhost:27017/jobportal");

  const defaultSettings = [
    {
      key: "subscription_plans",
      value: {
        basic: { price: 5000, jobLimit: 10 },
        pro: { price: 12000, jobLimit: 50 },
        enterprise: { price: 25000, jobLimit: 200 }
      },
      description: "Pricing plans for employers"
    },
    {
      key: "support_email",
      value: "support@jobportal.com",
      description: "Default support email"
    },
    {
      key: "resume_upload_limit",
      value: { sizeMB: 5, fileTypes: ["pdf","doc","docx"] },
      description: "Resume upload restrictions"
    }
  ];

  await settingModel.insertMany(defaultSettings);
  console.log("✅ Settings seeded");
  process.exit();
}

seedSettings();
