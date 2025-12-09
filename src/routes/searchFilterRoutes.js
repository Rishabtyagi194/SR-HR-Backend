import express from 'express';
import { searchKeywordController, suggestionController } from '../controllers/searchController.js';
import { Authenticate } from '../middleware/authMiddleware.js';
import { saveKeywordController } from '../controllers/saveKeywordController.js';

const router = express.Router();

router.get('/suggestions',  suggestionController);

router.post('/resume', Authenticate, searchKeywordController);

// save keyword to DB
router.post('/saveKeyword', Authenticate, saveKeywordController);

export default router;
