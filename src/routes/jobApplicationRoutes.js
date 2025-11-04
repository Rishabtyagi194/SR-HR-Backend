// routes/jobApplicationRoutes.js
import express from 'express';
import { applyForJobController, getApplicationsForJob } from '../controllers/jobApplicationController.js';
import { Authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// User applies for a job
router.post('/:jobId/apply', Authenticate, applyForJobController);

// Employer views all applications for a job
router.get('/:jobId/all-applications', Authenticate, getApplicationsForJob);

export default router;
