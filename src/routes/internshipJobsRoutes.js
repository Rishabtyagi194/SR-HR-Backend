import express from 'express';

import { Authenticate } from '../middleware/authMiddleware.js';
import {
  createInternshipJobsController,
  deleteInternshipJobsController,
  getInternshipJobsByIdController,
  ListAllInternshipJobsController,
  updateInternshipJobsController,
} from '../controllers/internshipController.js';

const router = express.Router();

router.post('/create', Authenticate, createInternshipJobsController);
router.get('/all-internships', ListAllInternshipJobsController);
router.get('/get-internship/:id', getInternshipJobsByIdController);
router.patch('/update/:id', Authenticate, updateInternshipJobsController);
router.delete('/delete/:id', Authenticate, deleteInternshipJobsController);

export default router;
