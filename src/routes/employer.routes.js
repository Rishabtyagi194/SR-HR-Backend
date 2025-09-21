import express from 'express';
import { createEmployerStaff, EmployerLogin, getAllEmployerStaff } from '../controllers/employer.controller.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', EmployerLogin);

router.post('/staff/create', Authenticate, authorizeRoles('employer_admin'), createEmployerStaff); // only employer admin can create its staff

router.get('/staff/all', Authenticate, authorizeRoles('employer_admin'), getAllEmployerStaff); // only employer admin can see its staff

export default router;
