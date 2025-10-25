// src/routes/companyRoutes.js
import express from 'express';
import { createCompanyAndEmployer, fetchAllCompanies } from '../controllers/companyController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', createCompanyAndEmployer);

router.get('/all-companies', Authenticate, authorizeRoles('super_admin'), fetchAllCompanies);

export default router;
