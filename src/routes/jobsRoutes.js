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
<<<<<<< HEAD
router.get('/jobs', ListAllJobsController);
=======
router.get('/list-all-jobs', ListAllJobsController);
>>>>>>> 25f851ac7d721537ea311ef8d52d1e578de77e08
router.get('/get-job/:id', getJobsByIdController);
router.patch('/update/:id', Authenticate, updateJobsController);
router.delete('/delete/:id', Authenticate, deleteJobsController);

export default router;
