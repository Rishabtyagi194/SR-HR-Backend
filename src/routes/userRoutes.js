import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/fileUploadMiddleware.js';
// import passport from 'passport';
// import jwt from 'jsonwebtoken';

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


export default router;
