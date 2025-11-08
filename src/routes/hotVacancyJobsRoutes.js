import express from 'express';

import { Authenticate } from '../middleware/authMiddleware.js';
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

router.post('/create', Authenticate, createJobsController);
router.get('/all-jobs', Authenticate, ListAllJobsController); // Get all jobs (public view)
router.get('/get-job/:id', getJobsByIdController); // View single job detail
router.patch('/update/:id', Authenticate, updateJobsController);
router.delete('/delete/:id', Authenticate, deleteJobsController);

router.get('/employer-jobs', Authenticate, getEmployerJobsController); // Get all posted jobs (with total responses)
router.get('/employer-job/:jobId', Authenticate, getSingleJobWithApplicationsController); // View full job + applications(response) + profiles
export default router;
