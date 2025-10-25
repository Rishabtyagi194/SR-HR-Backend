// src/routes/adminRoutes.js
import express from 'express';
import { AdminLogin, AdminSignup } from '../controllers/superAdminController.js';

const router = express.Router();

router.post('/signup', AdminSignup);
router.post('/login', AdminLogin);

export default router;
