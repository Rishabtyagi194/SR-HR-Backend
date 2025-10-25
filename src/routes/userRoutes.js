// src/routes/userRoutes.js
import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController.js';
import { Authenticate } from '../middleware/authMiddleware.js';
// import { upload } from '../services/s3Service.js';

const router = express.Router();

// public
router.post(
  '/register',
  [
    body('full_name').notEmpty().withMessage('full_name required'),
    body('email').isEmail().withMessage('valid email required'),
    body('password').isLength({ min: 6 }).withMessage('password min 6 chars'),
  ],
  userController.register,
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], userController.login);

// protected
router.get('/profile', Authenticate, userController.getProfile);
router.patch('/profile', Authenticate, userController.updateProfile);

router.post('/educations', Authenticate, [body('degree').notEmpty().withMessage('degree required')], userController.addEducation);

router.post('/experiences', Authenticate, [body('company_name').notEmpty(), body('job_title').notEmpty()], userController.addExperience);

router.post('/skills', Authenticate, [body('skill_name').notEmpty()], userController.addSkill);

// router.post('/upload-resume', Authenticate, upload.single('resume'), userController.uploadResume);

export default router;
