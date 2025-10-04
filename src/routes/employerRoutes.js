// src/routes/adminRoutes.js
import express from 'express';
import { createEmployerStaff, employerLogin } from '../controllers/employerController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', employerLogin);

router.post('/staff/create', Authenticate, authorizeRoles('employer_admin'), createEmployerStaff); // only employer admin can create its staff

export default router;
