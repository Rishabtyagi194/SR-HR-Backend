import express from 'express';

import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createJobsController,
  deleteJobsController,
  getEmployerJobsController,
  getJobsByIdController,
  getSingleJobWithApplicationsController,
  ListAllJobsController,
  updateJobsController,
} from '../controllers/hotVacancyJobController.js';

const router = express.Router();

router.post('/create', Authenticate, authorizeRoles('employer_admin', 'employer_staff', 'consultant_admin', 'consultant_staff'), createJobsController);

// Get all posted jobs for employer (HR, consultant) 
router.get('/employer-jobs', Authenticate, authorizeRoles('employer_admin', 'employer_staff', 'consultant_admin', 'consultant_staff'),  getEmployerJobsController); 

// View full job + applications(response) + profiles
router.get('/employer-job/:jobId', Authenticate, getSingleJobWithApplicationsController); 

// Get all jobs user/consultant(public view)
router.get('/all-jobs', Authenticate, authorizeRoles('job_seeker', 'consultant_admin', 'consultant_staff'), ListAllJobsController); 

// View single job detail
router.get('/get-job/:id', getJobsByIdController); 

router.patch('/update/:id', Authenticate, updateJobsController);

router.delete('/delete/:id', Authenticate, deleteJobsController);



export default router;
