// src/routes/organisationRoutes.js
import express from 'express';
import { fetchAllorganisations, registerOrganisationAndEmployers } from '../controllers/organisationController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerOrganisationAndEmployers);

router.get('/all-organisations', Authenticate, authorizeRoles('super_admin'), fetchAllorganisations);

export default router;
