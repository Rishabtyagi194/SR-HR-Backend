// src/routes/companyRoutes.js
import express from 'express';
import { createCompanyAndEmployer } from '../controllers/companyController.js';

const router = express.Router();

router.post('/register', createCompanyAndEmployer);

export default router;
