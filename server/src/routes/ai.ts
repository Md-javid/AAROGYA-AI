import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { checkUsageLimit } from '../middleware/subscription.js';
import {
    generateDietPlan,
    generateWorkoutPlan,
    analyzeMeal,
    chat,
    processVoice,
} from '../controllers/aiController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// AI features with usage limits
router.post('/diet-plan', checkUsageLimit('aiDietPlans'), generateDietPlan);
router.post('/workout-plan', checkUsageLimit('aiWorkoutPlans'), generateWorkoutPlan);
router.post('/analyze-meal', analyzeMeal);
router.post('/chat', checkUsageLimit('aiChats'), chat);
router.post('/voice-log', processVoice);

export default router;
