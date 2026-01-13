import express from 'express';
import { getAllConsultants, loginConsultant, registerAgency } from '../controllers/consultantAuthController.js';

const router = express.Router();

router.post('/register-agency', registerAgency);

router.post('/agency/login', loginConsultant);

router.get('/all-consultant', getAllConsultants);


export default router;
