import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkUsageLimit } from '../middleware/subscription.js';
import {
    generateRoadmap,
    getActiveRoadmap,
    getAllRoadmaps,
    completeWeek,
    getWeekDetail,
} from '../controllers/roadmapController.js';

const router = express.Router();

router.use(authenticate);

// Generate a fresh 4-week roadmap (costs 1 AI credit)
router.post('/generate', checkUsageLimit('aiDietPlans'), generateRoadmap);

// Get current active roadmap
router.get('/active', getActiveRoadmap);

// Get all roadmaps (history)
router.get('/', getAllRoadmaps);

// Get specific week detail
router.get('/:roadmapId/week/:weekNumber', getWeekDetail);

// Mark a week as complete + get AI feedback
router.post('/:roadmapId/week/:weekNumber/complete', completeWeek);

export default router;
