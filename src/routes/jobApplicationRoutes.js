// routes/jobApplicationRoutes.js
import express from 'express';
import {
  applyForJobController,
  getAllCompanyApplications,
  getApplicationsForJob,
  getUserAllAppliedJobs,
  uploadResumeOnJobController,
} from '../controllers/jobApplicationController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

// ----------------------------------  Users  ---------------------------------

// User apply for job
router.post('/:category/:jobId/apply', Authenticate, authorizeRoles('job_seeker'), applyForJobController);

// Get all jobs applied by the current user
router.get('/user/all-applied/jobs', Authenticate, getUserAllAppliedJobs);


// ---------------------------------- Employer  ---------------------------------

// Employer views applications/response for a specific job
router.get('/:category/:jobId/all-applications', Authenticate, getApplicationsForJob);

// Employer views all applications/response for all jobs in their company
router.get('/company/all', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), getAllCompanyApplications);


// ---------------------------------- Consultant ---------------------------------

// Consultant upload resume on a particular job 
router.post('/:category/:jobId/consultant/submit-resume', Authenticate, 
  authorizeRoles('consultant_admin', 'consultant_staff'),
  upload.array('resumes', 10),
  uploadResumeOnJobController);





export default router;
