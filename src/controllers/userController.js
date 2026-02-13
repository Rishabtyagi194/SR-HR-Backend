import UserService from '../services/userService.js';
import { validationResult } from 'express-validator';
import { getReadPool } from '../config/database.js';
import { saveSearchKeyword } from '../services/searchKeywordService.js';
import { uploadUserResume } from '../utils/cloudinary/userResumeUploader.js';
import { deleteFromCloudinary } from '../utils/cloudinary/baseUploader.js';

// =================== AUTH ===================

//  Register controller
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const result = await UserService.register(req.body);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error('Register Error:', err.message);

    return res.status(500).json({
      success: false,
      message: err.message || 'Registration failed',
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const result = await UserService.login(req.body);
    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    console.error(' Login Error:', err);
    res.status(401).json({ success: false, message: err.message });
  }
};
