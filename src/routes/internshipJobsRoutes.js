import express from 'express';

import { Authenticate } from '../middleware/authMiddleware.js';
import {
  createInternshipJobsController,
  deleteInternshipJobsController,
  getEmployerInternshipController,
  getInternshipJobsByIdController,
  getSingleInternshipWithApplicationsController,
  ListAllInternshipJobsController,
  updateInternshipJobsController,
} from '../controllers/internshipController.js';

const router = express.Router();

router.post('/create', Authenticate, createInternshipJobsController);
router.get('/all-internships', Authenticate, ListAllInternshipJobsController);
router.get('/get-internship/:id', getInternshipJobsByIdController);
router.patch('/update/:id', Authenticate, updateInternshipJobsController);
router.delete('/delete/:id', Authenticate, deleteInternshipJobsController);

router.get('/employer-internships', Authenticate, getEmployerInternshipController); // Get all posted jobs (with total responses)
router.get('/employer-internship/:jobId', Authenticate, getSingleInternshipWithApplicationsController); // View full job + applications(response) + profiles

export default router;
