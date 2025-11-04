import UserService from '../services/userService.js';
import { validationResult } from 'express-validator';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { getReadPool } from '../config/database.js';

// =================== AUTH ===================
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const result = await UserService.register(req.body);
    res.status(201).json({ message: 'User registered successfully', data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await UserService.login(req.body);
    res.json({ message: 'Login successful', data: result });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

// =================== PROFILE ===================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await UserService.getProfile(userId);
    res.json({ message: 'Profile fetched successfully', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedProfile = await UserService.updateProfile(userId, req.body);
    res.json({ message: 'Profile updated successfully', data: updatedProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =================== RESUME ===================

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const localFilePath = req.file?.path;

    if (!localFilePath) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    //  Check if old resume exists in DB
    const [user] = await getReadPool().execute(`SELECT resume_public_id FROM user_profiles WHERE user_id = ?`, [userId]);

    const oldPublicId = user?.[0]?.resume_public_id;

    //  Delete old resume from Cloudinary if exists
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }

    //  Upload new resume to Cloudinary
    const uploadResult = await uploadOnCloudinary(localFilePath);
    if (!uploadResult) {
      return res.status(500).json({ message: 'Failed to upload to Cloudinary' });
    }
    // console.log('uploadResult:', JSON.stringify(uploadResult, null, 2));

    const resumeUrl = uploadResult.secure_url;
    const resumePublicId = uploadResult.public_id;

    //  Update DB
    const result = await UserService.uploadResume(userId, resumeUrl, resumePublicId);

    res.status(200).json({
      message: 'Resume updated successfully',
      data: result,
    });
  } catch (err) {
    console.error('Error in uploadResume:', err);
    res.status(500).json({ message: err.message });
  }
};

// =================== EDUCATION ===================
export const addEducation = async (req, res) => {
  try {
    await UserService.addEducation(req.user.id, req.body);
    res.status(201).json({ message: 'Education added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEducations = async (req, res) => {
  try {
    const educations = await UserService.listEducations(req.user.id);
    res.status(201).json({
      message: 'Education added successfully',
      total: educations.length,
      data: educations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    await UserService.updateEducation(req.user.id, id, req.body);
    res.json({ message: 'Education updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    await UserService.deleteEducation(req.params.id);
    res.json({ message: 'Education deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  ----------------------- EXPERIENCE  -----------------------
export const addExperience = async (req, res) => {
  try {
    await UserService.addExperience(req.user.id, req.body);
    res.status(201).json({ message: 'Experience added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExperiences = async (req, res) => {
  try {
    const experiences = await UserService.listExperiences(req.user.id);
    res.status(201).json({
      message: 'Experience fetched successfully',
      total: experiences.length,
      data: experiences,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('id', id);

    await UserService.updateExperience(req.user.id, id, req.body);
    res.json({ message: 'Experience updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    await UserService.deleteExperience(req.params.id);
    res.json({ message: 'Experience deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  -------------------------- SKILLS  --------------------------
export const addSkill = async (req, res) => {
  try {
    await UserService.addSkill(req.user.id, req.body);
    res.status(201).json({ message: 'Skill added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSkills = async (req, res) => {
  try {
    const skills = await UserService.listSkills(req.user.id);
    res.json({
      message: 'Skills fetched successfully',
      total: skills.length,
      data: skills,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSkill = async (req, res) => {
  try {
    console.log(' Params:', req.params);
    console.log(' User:', req.user);
    console.log(' Body:', req.body);

    await UserService.updateSkill(req.user.id, req.params.id, req.body);
    res.json({ message: 'Skill updated successfully' });
  } catch (err) {
    console.error('Error in updateSkill:', err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    await UserService.deleteSkill(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ***********************************************************************************************

// // src/controllers/userController.js
// import { getWritePool } from '../config/database.js';
// import UserService from '../services/userService.js';
// import { validationResult } from 'express-validator';

// export const register = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//     const { full_name, email, password, phone } = req.body;
//     const result = await UserService.register({ full_name, email, password, phone });

//     return res.status(201).json({ message: 'User registered', data: result });
//   } catch (err) {
//     console.error('register error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const result = await UserService.login({ email, password });
//     console.log('result', result);

//     return res.json({ message: 'Login successful', data: result });
//   } catch (err) {
//     console.error('login error:', err);
//     return res.status(401).json({ message: 'Authentication failed', error: err.message });
//   }
// };

// export const getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // auth middleware must set req.user
//     console.log('userId', userId);

//     const data = await UserService.getProfile(userId);
//     return res.json({ message: 'Profile fetched', data });
//   } catch (err) {
//     console.error('getProfile error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // export const updateProfile = async (req, res) => {
// //   try {
// //     const userId = req.user.user_id;
// //     const profile = req.body;
// //     await UserService.updateProfile(userId, profile);
// //     return res.json({ message: 'Profile updated' });
// //   } catch (err) {
// //     console.error('updateProfile error:', err);
// //     return res.status(500).json({ message: 'Server error', error: err.message });
// //   }
// // };

// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const profile = req.body;

//     console.log('userId', userId);
//     console.log('profile', req.body);

//     const updatedProfile = await UserService.updateProfile(userId, profile);

//     return res.json({
//       message: 'Profile updated',
//       data: updatedProfile,
//     });
//   } catch (err) {
//     console.error('updateProfile error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// export const addEducation = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const edu = req.body;
//     await UserService.addEducation(userId, edu);
//     return res.status(201).json({ message: 'Education added' });
//   } catch (err) {
//     console.error('addEducation error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// export const addExperience = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const exp = req.body;
//     await UserService.addExperience(userId, exp);
//     return res.status(201).json({ message: 'Experience added' });
//   } catch (err) {
//     console.error('addExperience error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// export const addSkill = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const skill = req.body;
//     await UserService.addSkill(userId, skill);
//     return res.status(201).json({ message: 'Skill added' });
//   } catch (err) {
//     console.error('addSkill error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// export const uploadResume = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const resumeUrl = req.file.location;

//     await getWritePool().query('UPDATE user_profiles SET resume_url = ? WHERE id = ?', [resumeUrl, userId]);
//     res.status(200).json({ message: 'Resume uploaded successfully', resumeUrl });
//   } catch (error) {
//     console.error('Error uploading resume:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
