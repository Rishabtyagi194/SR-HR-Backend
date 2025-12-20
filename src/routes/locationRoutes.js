import express from 'express';
import { locationController } from '../controllers/locationController.js';

const router = express.Router();

router.get("/search", locationController);

export default router;
