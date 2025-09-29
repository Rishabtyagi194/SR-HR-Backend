// src/routes/authRoutes.js
import express from 'express';
import { EmployerLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/employer/login', EmployerLogin);

export default router;
