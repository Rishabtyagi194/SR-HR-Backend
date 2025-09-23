import express from 'express';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { createJobVacancy } from '../controllers/jobVacancy.controller.js';

const router = express.Router();

router.post('/create', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), createJobVacancy);

export default router;
