// models/settings.model.js
import mongoose from "mongoose";
const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Object, required: true },
  description: { type: String }
}, { timestamps: true });

const settingModel =  mongoose.model("Settings", SettingsSchema);
export default settingModel