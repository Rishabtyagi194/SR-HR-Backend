// src/controllers/userController.js
import UserService from '../services/userService.js';
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { full_name, email, password, phone } = req.body;
    const result = await UserService.register({ full_name, email, password, phone });

    return res.status(201).json({ message: 'User registered', data: result });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await UserService.login({ email, password });
    console.log('result', result);

    return res.json({ message: 'Login successful', data: result });
  } catch (err) {
    console.error('login error:', err);
    return res.status(401).json({ message: 'Authentication failed', error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // auth middleware must set req.user
    console.log('userId', userId);

    const data = await UserService.getProfile(userId);
    return res.json({ message: 'Profile fetched', data });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.user_id;
//     const profile = req.body;
//     await UserService.updateProfile(userId, profile);
//     return res.json({ message: 'Profile updated' });
//   } catch (err) {
//     console.error('updateProfile error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = req.body;

    console.log('userId', userId);
    console.log('profile', req.body);

    const updatedProfile = await UserService.updateProfile(userId, profile);

    return res.json({
      message: 'Profile updated',
      data: updatedProfile,
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addEducation = async (req, res) => {
  try {
    const userId = req.user.id;
    const edu = req.body;
    await UserService.addEducation(userId, edu);
    return res.status(201).json({ message: 'Education added' });
  } catch (err) {
    console.error('addEducation error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addExperience = async (req, res) => {
  try {
    const userId = req.user.id;
    const exp = req.body;
    await UserService.addExperience(userId, exp);
    return res.status(201).json({ message: 'Experience added' });
  } catch (err) {
    console.error('addExperience error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const skill = req.body;
    await UserService.addSkill(userId, skill);
    return res.status(201).json({ message: 'Skill added' });
  } catch (err) {
    console.error('addSkill error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumeUrl = req.file.location;

    await pool.query('UPDATE user_profiles SET resume_url = ? WHERE id = ?', [resumeUrl, userId]);
    res.status(200).json({ message: 'Resume uploaded successfully', resumeUrl });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
