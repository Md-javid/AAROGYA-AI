import { Request, Response } from 'express';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { MealLog } from '../models/MealLog.js';
import { SleepLog } from '../models/SleepLog.js';
import { WaterLog } from '../models/WaterLog.js';
import { AuthRequest } from '../middleware/auth.js';

// Workout Logs
export const createWorkoutLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const log = await WorkoutLog.create({
            userId: req.userId,
            ...req.body,
        });
        res.status(201).json({ log });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create workout log' });
    }
};

export const getWorkoutLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const logs = await WorkoutLog.find({ userId: req.userId }).sort({ date: -1 }).limit(100);
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workout logs' });
    }
};

// Meal Logs
export const createMealLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const log = await MealLog.create({
            userId: req.userId,
            ...req.body,
        });
        res.status(201).json({ log });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create meal log' });
    }
};

export const getMealLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const logs = await MealLog.find({ userId: req.userId }).sort({ date: -1 }).limit(100);
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meal logs' });
    }
};

// Sleep Logs
export const createSleepLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const log = await SleepLog.create({
            userId: req.userId,
            ...req.body,
        });
        res.status(201).json({ log });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create sleep log' });
    }
};

export const getSleepLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const logs = await SleepLog.find({ userId: req.userId }).sort({ date: -1 }).limit(100);
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sleep logs' });
    }
};

// Water Logs
export const createWaterLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const log = await WaterLog.create({
            userId: req.userId,
            ...req.body,
        });
        res.status(201).json({ log });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create water log' });
    }
};

export const getWaterLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const logs = await WaterLog.find({ userId: req.userId }).sort({ date: -1 }).limit(100);
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch water logs' });
    }
};

// Get daily stats
export const getDailyStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { date } = req.params;

        const [workouts, meals, sleep, water] = await Promise.all([
            WorkoutLog.find({ userId: req.userId, date }),
            MealLog.find({ userId: req.userId, date }),
            SleepLog.findOne({ userId: req.userId, date }),
            WaterLog.find({ userId: req.userId, date }),
        ]);

        const caloriesBurned = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
        const caloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
        const workoutMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);
        const waterIntake = water.reduce((sum, w) => sum + (w.unit === 'Glasses' ? w.amount * 0.25 : w.amount), 0);
        const sleepHours = sleep?.durationHours || 0;

        const score = Math.min(100, Math.round(
            (workoutMinutes > 0 ? 25 : 0) +
            (caloriesConsumed > 0 ? 25 : 0) +
            (waterIntake >= 2 ? 25 : 0) +
            (sleepHours >= 7 ? 25 : 0)
        ));

        res.json({
            stats: {
                caloriesBurned,
                caloriesConsumed,
                waterIntake,
                sleepHours,
                workoutMinutes,
                score,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily stats' });
    }
};
