// routes/jobApplicationRoutes.js
import express from 'express';
import {
  applyForJobController,
  getAllCompanyApplications,
  getApplicationsForJob,
  getUserAllAppliedJobs,
} from '../controllers/jobApplicationController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply for job
router.post('/:category/:jobId/apply', Authenticate, applyForJobController);

// Employer views applications for a specific job
router.get('/:category/:jobId/all-applications', Authenticate, getApplicationsForJob);

// Employer views all applications for all jobs in their company
router.get('/company/all', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), getAllCompanyApplications);

// Get all jobs applied by the current user
router.get('/user/all-applied/jobs', Authenticate, getUserAllAppliedJobs);

export default router;
