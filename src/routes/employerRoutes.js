// src/routes/adminRoutes.js
import express from 'express';
import {
  createEmployerStaff,
  deleteUser,
  employerLogin,
  getUserById,
  listAllEmployers,
  listAllStaffs,
  updateUser,
} from '../controllers/employerController.js';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { getReadPool } from '../config/database.js';

const router = express.Router();

router.post('/login', employerLogin);

//create staff
router.post('/staff/create', Authenticate, authorizeRoles('employer_admin'), createEmployerStaff); // only employer admin can create its staff

// list all employers not staff
router.get('/all-employers', Authenticate, authorizeRoles('super_admin'), listAllEmployers);

// list all staff
router.get('/staff/all', Authenticate, authorizeRoles('employer_admin'), listAllStaffs);

// Get single employer/staff
router.get('/user/:id', Authenticate, authorizeRoles('super_admin', 'employer_admin'), getUserById);

// Update employer/staff
router.patch('/user/:id', Authenticate, authorizeRoles('super_admin', 'employer_admin'), updateUser);
// router.patch('/user/:id', Authenticate, authorizeRoles('employer_admin'), updateUser);

// Delete employer/staff
router.delete('/user/:id', Authenticate, authorizeRoles('super_admin', 'employer_admin'), deleteUser);


// ----------------------------------- consultant ------------------------------------

// router.patch('/consultant-resume/status', Authenticate, authorizeRoles('super_admin', 'employer_admin'), updateUser);


export default router;
