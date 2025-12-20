import express from 'express';
import { getSavedJobs, saveJob, unsaveJob } from '../controllers/savedJobsController.js';
import { Authenticate } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/:jobId/save', Authenticate,  saveJob);

router.delete('/:jobId/save', Authenticate, unsaveJob);

router.get('/get/saved', Authenticate, getSavedJobs);

export default router;
