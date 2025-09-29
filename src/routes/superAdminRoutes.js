// src/routes/adminRoutes.js
import express from 'express';
import { AdminLogin, AdminSignup } from '../controllers/superAdminController.js';
import { fetchAllCompanies } from '../controllers/companyController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', AdminSignup);
router.post('/login', AdminLogin);

router.get('/all-companies', Authenticate, authorizeRoles('super_admin'), fetchAllCompanies);

export default router;
