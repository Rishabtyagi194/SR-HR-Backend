import express from 'express';
import multer from 'multer';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { listUploadedData, uploadEmployeeData } from '../controllers/uploadController.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

router.post('/upload', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), upload.single('file'), uploadEmployeeData);

router.get('/list', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), listUploadedData);

export default router;
