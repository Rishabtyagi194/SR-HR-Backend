import express from 'express';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/fileUploadMiddleware.js';
import {
  uploadResumeController,
  //  uploadResumeController1
} from '../controllers/resumeController.js';
// import { listUploadedData } from '../controllers/uploadExcelController.js';

const router = express.Router();

router.post('/upload', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), upload.single('resume'), uploadResumeController);
// router.post(
//   '/api/upload',
//   Authenticate,
//   authorizeRoles('employer_admin', 'employer_staff'),
//   upload.single('resume'),
//   uploadResumeController1,
// );

// router.get('/list', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), listUploadedData);

export default router;
