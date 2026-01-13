import express from 'express';

import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
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

// create internship
router.post('/create', Authenticate,  authorizeRoles('employer_admin', 'employer_staff', 'consultant_admin', 'consultant_staff'), createInternshipJobsController);

// Get all posted internships for employer (HR, consultant) 
router.get('/employer-internships', Authenticate,  authorizeRoles('employer_admin', 'employer_staff', 'consultant_admin', 'consultant_staff'), getEmployerInternshipController); // Get all posted jobs (with total responses)

// View full internship + applications(response) + profiles
router.get('/employer-internship/:jobId', Authenticate, getSingleInternshipWithApplicationsController); // View full job + applications(response) + profiles

// Get all internships user/consultant(public view)
router.get('/all-internships', Authenticate, ListAllInternshipJobsController);

// View single internship detail
router.get('/get-internship/:id', getInternshipJobsByIdController);


// update internship
router.patch('/update/:id', Authenticate, updateInternshipJobsController);

// delete internship 
router.delete('/delete/:id', Authenticate, deleteInternshipJobsController);


export default router;
