import express from 'express';
import { getAllCompanies } from '../controllers/subscription.controller.js';
import { Authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// list all registered companies
router.get('/admin/companies', Authenticate, getAllCompanies); // only super Admin can see

// GET /admin/companies/:id — company detail + subscription + payments
// router.get('/admin/companies/:id', () => {});

// // POST /admin/companies/:id/suspend — suspend company
// router.post('/admin/companies/:id/suspend', () => {});

// // POST /admin/companies/:id/verify — mark verified
// router.post('/admin/companies/:id/verify', () => {});

export default router;
