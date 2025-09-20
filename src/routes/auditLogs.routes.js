import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller.js';
import { Authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// filter by actor/action/date
router.get('/audit-logs', Authenticate, getAuditLogs);

export default router;
