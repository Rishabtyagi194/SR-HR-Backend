import express from 'express';
import {
  createJobsController,
  deleteJobsController,
  getJobsByIdController,
  ListAllJobsController,
  updateJobsController,
} from '../controllers/jobsController.js';
import { Authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', Authenticate, createJobsController);
router.get('/jobs', ListAllJobsController);
router.get('/list-all-jobs', ListAllJobsController);
router.get('/get-job/:id', getJobsByIdController);
router.patch('/update/:id', Authenticate, updateJobsController);
router.delete('/delete/:id', Authenticate, deleteJobsController);

export default router;
