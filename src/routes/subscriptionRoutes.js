// src/routes/subscriptionRoutes.js
import express from 'express';
import { createCategory } from '../controllers/subscriptionController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/categories', Authenticate, authorizeRoles('super_admin'), createCategory);

export default router;
