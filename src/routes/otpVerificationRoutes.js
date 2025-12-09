// routes/jobApplicationRoutes.js
import express from 'express';
import { resendOTP, verifyOTP } from '../controllers/verifyOTPController.js';

const router = express.Router();

router.post('/verify-otp', verifyOTP);

router.post('/resend-otp', resendOTP);

export default router;
