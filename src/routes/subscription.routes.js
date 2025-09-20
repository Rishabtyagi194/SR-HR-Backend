import express from 'express';
import {
  //   selectPlan,
  createCompanyAndAdmin,
  //   createPayment,
  //   verifyPayment,
} from '../controllers/subscription.controller.js';

const router = express.Router();

// Step 1: Employer selects plan
// router.post('/select-plan', selectPlan);

// Step 2: Employer creates company + admin
router.post('/create-company-payment', createCompanyAndAdmin);

// Step 3: Create Razorpay order (payment init)
// router.post('/create-payment', createPayment);

// Step 4: Verify payment (after Razorpay success)
// router.post('/verify-payment', verifyPayment);

export default router;
