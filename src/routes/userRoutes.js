import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/fileUploadMiddleware.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

/* ----------------------------- PUBLIC ROUTES ----------------------------- */

// Register
router.post(
  '/register',
  [
    body('full_name').trim().notEmpty().withMessage('Full name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  ],
  userController.register
);

// Login
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], userController.login);


/* ---------------------- login with google ------------------------------------*/ 

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role || 'job_seeker',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}`
    );
  }
);


/* ---------------------------- PROFILE PROTECTED ROUTES --------------------------- */

// Get profile for user who is login
router.get('/profile', Authenticate, userController.getProfile);

// Get profile of user by employer - search by resdex
router.get('/profile/:id', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), userController.getProfileById);

// Update Basic profile
router.patch('/profile/update/basic', Authenticate, upload.single('profileImage'), userController.updateBasicDetails);

// get basic profile
router.get('/basic', Authenticate, userController.getBasicDetails);

// Update Basic profile
router.patch('/profile/personal-details/update', Authenticate, userController.updateProfilePersonalDetails);

// get personal profile details
router.get('/personal-details', Authenticate, userController.getpersonalProfileDetails);

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

/* -------------------------- PROJECTS -------------------------- */

// Add project(s)
router.post('/projects', Authenticate, userController.addProject);

// Get all projects
router.get('/projects', Authenticate, userController.getProjects);

// Update project
router.patch('/projects/update/:id', Authenticate, userController.updateProject);

// Delete project
router.delete('/projects/delete/:id', Authenticate, userController.deleteProject);

/* ---------------------- ACCOMPLISHMENTS ---------------------- */

// social profiles
router.post('/social-profiles', Authenticate, userController.addSocialProfile);
router.get('/social-profiles', Authenticate, userController.getSocialProfiles);
router.patch('/social-profiles/update/:id', Authenticate, userController.updateSocialProfile);
router.delete('/social-profiles/delete/:id', Authenticate, userController.deleteSocialProfile);

// work samples
router.post('/work-samples', Authenticate, userController.addWorkSample);
router.get('/work-samples', Authenticate, userController.getWorkSamples);
router.patch('/work-samples/update/:id', Authenticate, userController.updateWorkSample);
router.delete('/work-samples/delete/:id', Authenticate, userController.deleteWorkSample);

// certifications
router.post('/certifications', Authenticate, userController.addCertification);
router.get('/certifications', Authenticate, userController.getCertifications);
router.patch('/certifications/update/:id', Authenticate, userController.updateCertification);
router.delete('/certifications/delete/:id', Authenticate, userController.deleteCertification);

/* ----------------------------- ACCOUNT MANAGEMENT ----------------------------- */

// Delete user account (optional)
// router.delete('/account', Authenticate, userController.deleteAccount);

export default router;
