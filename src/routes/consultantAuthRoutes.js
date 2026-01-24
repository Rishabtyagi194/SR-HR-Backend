import express from 'express';
import { getAllConsultants, loginConsultant, registerAgency } from '../controllers/consultantAuthController.js';
import { updateResumeStatusController } from '../controllers/consultantApplicationController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register-agency', registerAgency);

router.post('/agency/login', loginConsultant);

router.get('/all-consultant', getAllConsultants);

// update the resume status uploaded by consultant - update by employer
router.patch(
  '/resume/status',
  Authenticate,
  authorizeRoles('employer_admin', 'employer_staff'),
  updateResumeStatusController
);


// router.get('/resume/success-rate', getAllConsultants);

export default router;
