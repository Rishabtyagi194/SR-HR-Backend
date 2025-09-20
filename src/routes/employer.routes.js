import express from 'express';
import { EmployerLogin, getAllEmployers } from '../controllers/employer.controller.js';
import { Authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', EmployerLogin);

router.get('/get-employers', Authenticate, getAllEmployers); // only super admin can see all employers

export default router;
