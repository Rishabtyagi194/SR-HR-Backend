import express from 'express';
import { Authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { deleteRecordById, listUploadedData, updateRecordById, uploadEmployeeData } from '../controllers/uploadController.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

router.post('/upload', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), upload.single('file'), uploadEmployeeData);

router.get('/list', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), listUploadedData);

// Update / Delete individual record by ID
router.patch('/record/:id', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), updateRecordById);
router.delete('/record/:id', Authenticate, authorizeRoles('employer_admin', 'employer_staff'), deleteRecordById);
export default router;
