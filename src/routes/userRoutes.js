import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

/* ----------------------------- PUBLIC ROUTES ----------------------------- */

// Register
router.post(
  '/register',
  [
    body('full_name').notEmpty().withMessage('Full name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  userController.register,
);

// Login
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], userController.login);

/* ---------------------------- PROFILE PROTECTED ROUTES --------------------------- */

// Get profile for user who is login
router.get('/profile', Authenticate, userController.getProfile);

// Get profile of user by employer - search by resdex
router.get('/profile/:id', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), userController.getProfileById);

// Update profile
router.patch('/profile/update', Authenticate, userController.updateProfile);

/* ----------------------------- Resume  ---------------------------- */

// update resume
router.patch('/upload-resume', Authenticate, upload.single('resume'), userController.uploadResume);

router.get('/resume/get', Authenticate, userController.getResume);

/* ----------------------------- EDUCATIONS  ---------------------------- */

// Add new education
router.post('/educations', Authenticate, [body('degree').notEmpty().withMessage('Degree is required')], userController.addEducation);

// Get all educations
router.get('/educations', Authenticate, userController.getEducations);

// Update a specific education
router.patch('/educations/update/:id', Authenticate, userController.updateEducation);

// Delete a specific education
router.delete('/educations/delete/:id', Authenticate, userController.deleteEducation);

/* ----------------------------- EXPERIENCES  --------------------------- */

// Add new experience
router.post(
  '/experiences',
  Authenticate,
  [
    body('company_name').notEmpty().withMessage('Company name is required'),
    body('job_title').notEmpty().withMessage('Job title is required'),
  ],
  userController.addExperience,
);

// Get all experiences
router.get('/experiences', Authenticate, userController.getExperiences);

// Update a specific experience
router.patch('/experience/update/:id', Authenticate, userController.updateExperience);

// Delete a specific experience
router.delete('/experience/delete/:id', Authenticate, userController.deleteExperience);

/* -------------------------------- SKILLS  ----------------------------- */

// Add new skill
router.post('/skills', Authenticate, userController.addSkill);

// Get all skills
router.get('/skills', Authenticate, userController.getSkills);

// Update a specific skill
router.patch('/skills/update/:id', Authenticate, userController.updateSkill);

// Delete a specific skill
router.delete('/skills/delete/:id', Authenticate, userController.deleteSkill);

/* ----------------------------- ACCOUNT MANAGEMENT ----------------------------- */

// Delete user account (optional)
// router.delete('/account', Authenticate, userController.deleteAccount);

export default router;
