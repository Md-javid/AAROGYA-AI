import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    createWorkoutLog,
    getWorkoutLogs,
    createMealLog,
    getMealLogs,
    createSleepLog,
    getSleepLogs,
    createWaterLog,
    getWaterLogs,
    getDailyStats,
} from '../controllers/logController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Workout logs
router.post('/workout', createWorkoutLog);
router.get('/workout', getWorkoutLogs);

// Meal logs
router.post('/meal', createMealLog);
router.get('/meal', getMealLogs);

// Sleep logs
router.post('/sleep', createSleepLog);
router.get('/sleep', getSleepLogs);

// Water logs
router.post('/water', createWaterLog);
router.get('/water', getWaterLogs);

// Daily stats
router.get('/stats/:date', getDailyStats);

export default router;
