import express from 'express';
import { contactUsController, getcontactUsController } from '../controllers/contactusController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', contactUsController)

router.get('/create', Authenticate, authorizeRoles('employer_admin'), getcontactUsController)

export default router;