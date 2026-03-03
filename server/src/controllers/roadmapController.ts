import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { RoadmapPlan } from '../models/RoadmapPlan.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { MealLog } from '../models/MealLog.js';
import { SleepLog } from '../models/SleepLog.js';
import { WaterLog } from '../models/WaterLog.js';
import * as aiService from '../services/aiService.js';
import mongoose from 'mongoose';

// ─── Gamification config ───────────────────────────────────────
const BADGES = {
    WEEK1_COMPLETE: { id: 'week1_done', name: '🏗️ Foundation Builder', xp: 100 },
    WEEK2_COMPLETE: { id: 'week2_done', name: '💪 Overload Warrior', xp: 150 },
    WEEK3_COMPLETE: { id: 'week3_done', name: '⚡ Optimizer', xp: 200 },
    WEEK4_COMPLETE: { id: 'week4_done', name: '🏆 Peak Performer', xp: 300 },
    ROADMAP_COMPLETE: { id: 'roadmap_done', name: '🎯 4-Week Champion', xp: 500 },
    PERFECT_WEEK: { id: 'perfect_week', name: '⭐ Perfect Week', xp: 200 },
    CONSISTENCY_KING: { id: 'consistency', name: '🔥 Consistency King', xp: 150 },
    SLEEP_CHAMPION: { id: 'sleep_champ', name: '😴 Sleep Champion', xp: 100 },
    HYDRATION_HERO: { id: 'hydration', name: '💧 Hydration Hero', xp: 100 },
};

// ─── Helper: get date range of a specific week ─────────────────
const getWeekDates = (startDateStr: string, weekNumber: number) => {
    const start = new Date(startDateStr);
    start.setDate(start.getDate() + (weekNumber - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
    };
};

// ─── Generate 4-week Roadmap ───────────────────────────────────
export const generateRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!aiService.isApiKeyAvailable()) {
            res.status(503).json({ error: 'AI service unavailable. GEMINI_API_KEY not configured.' });
            return;
        }

        const user = await User.findById(req.userId);
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }

        // Deactivate any existing roadmap
        await RoadmapPlan.updateMany(
            { userId: req.userId, status: 'active' },
            { $set: { status: 'paused' } }
        );

        // Build weak dates
        const todayStr = new Date().toISOString().split('T')[0];
        const weekDates = [1, 2, 3, 4].map(n => getWeekDates(todayStr, n));

        // Call Gemini for full 4-week plan
        const aiPlan = await aiService.generateFourWeekRoadmap(user.profile, weekDates);

        // Persist to MongoDB
        const roadmap = await RoadmapPlan.create({
            userId: req.userId,
            status: 'active',
            currentWeek: 1,
            title: aiPlan.roadmapTitle,
            overview: aiPlan.overview,
            profileSnapshot: {
                fitnessLevel: user.profile.fitnessLevel,
                goal: user.profile.goal,
                dosha: user.profile.dosha,
                activityLevel: user.profile.activityLevel,
                hasInjuries: user.profile.hasInjuries,
                injuries: user.profile.injuries,
                age: user.profile.age,
                weight: user.profile.weight,
                height: user.profile.height,
            },
            weeks: aiPlan.weeks,
            totalScore: 0,
            badgesEarned: [],
            xpEarned: 0,
        });

        res.status(201).json({ roadmap });
    } catch (error: any) {
        console.error('Roadmap generation error:', error);
        res.status(500).json({ error: 'Failed to generate roadmap', message: error.message });
    }
};

// ─── Get active roadmap ────────────────────────────────────────
export const getActiveRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const roadmap = await RoadmapPlan.findOne({ userId: req.userId, status: 'active' });
        if (!roadmap) { res.status(404).json({ error: 'No active roadmap found' }); return; }
        res.json({ roadmap });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch roadmap', message: error.message });
    }
};

// ─── Get all roadmaps (history) ────────────────────────────────
export const getAllRoadmaps = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const roadmaps = await RoadmapPlan
            .find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select('title status currentWeek totalScore badgesEarned xpEarned createdAt');
        res.json({ roadmaps });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch roadmaps', message: error.message });
    }
};

// ─── Complete a week + generate AI feedback ────────────────────
export const completeWeek = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roadmapId, weekNumber } = req.params;
        const wk = parseInt(weekNumber);
        if (![1, 2, 3, 4].includes(wk)) {
            res.status(400).json({ error: 'weekNumber must be 1–4' }); return;
        }

        const roadmap = await RoadmapPlan.findOne({ _id: roadmapId, userId: req.userId });
        if (!roadmap) { res.status(404).json({ error: 'Roadmap not found' }); return; }

        const week = roadmap.weeks.find(w => w.weekNumber === wk);
        if (!week) { res.status(404).json({ error: 'Week not found in roadmap' }); return; }
        if (week.performance?.completedAt) {
            res.status(400).json({ error: 'Week already completed' }); return;
        }

        const uid = new mongoose.Types.ObjectId(req.userId!);
        const startDate = week.startDate;
        const endDate = week.endDate;

        // Query actual logs for the week
        const [workouts, meals, sleeps, waters] = await Promise.all([
            WorkoutLog.find({ userId: uid, date: { $gte: startDate, $lte: endDate } }).lean(),
            MealLog.find({ userId: uid, date: { $gte: startDate, $lte: endDate } }).lean(),
            SleepLog.find({ userId: uid, date: { $gte: startDate, $lte: endDate } }).lean(),
            WaterLog.find({ userId: uid, date: { $gte: startDate, $lte: endDate } }).lean(),
        ]);

        // ── Calculate real performance ───────────────────────
        const workoutDays = new Set(workouts.map(w => w.date)).size;

        const avgSleepHours = sleeps.length
            ? sleeps.reduce((s, sl) => s + sl.durationHours, 0) / sleeps.length : 0;

        const mealByDay: Record<string, number> = {};
        meals.forEach(m => { mealByDay[m.date] = (mealByDay[m.date] || 0) + m.calories; });
        const avgCalories = Object.values(mealByDay).length
            ? Object.values(mealByDay).reduce((s, c) => s + c, 0) / Object.values(mealByDay).length : 0;

        const waterByDay: Record<string, number> = {};
        waters.forEach(w => {
            const liters = w.unit === 'Glasses' ? w.amount * 0.25 : w.amount;
            waterByDay[w.date] = (waterByDay[w.date] || 0) + liters;
        });
        const avgWater = Object.values(waterByDay).length
            ? Object.values(waterByDay).reduce((s, v) => s + v, 0) / Object.values(waterByDay).length : 0;

        // ── Score calculation ────────────────────────────────
        const targets = week.weeklyTargets;
        const workoutScore = Math.min(100, (workoutDays / targets.minWorkoutDays) * 100) * 0.35;
        const sleepScore = Math.min(100, (avgSleepHours / targets.targetSleepHours) * 100) * 0.25;
        const waterScore = Math.min(100, (avgWater / targets.waterTargetLiters) * 100) * 0.20;
        const calGap = Math.abs(avgCalories - targets.calorieTarget);
        const calScore = Math.max(0, 100 - (calGap / targets.calorieTarget) * 100) * 0.20;
        const weekScore = Math.round(workoutScore + sleepScore + waterScore + calScore);

        // ── Badge evaluation ─────────────────────────────────
        const badgesEarned: string[] = [];
        const weekBadgeMap: Record<number, typeof BADGES[keyof typeof BADGES]> = {
            1: BADGES.WEEK1_COMPLETE, 2: BADGES.WEEK2_COMPLETE,
            3: BADGES.WEEK3_COMPLETE, 4: BADGES.WEEK4_COMPLETE,
        };
        badgesEarned.push(weekBadgeMap[wk].name);

        if (weekScore >= 90) badgesEarned.push(BADGES.PERFECT_WEEK.name);
        if (workoutDays >= targets.minWorkoutDays) badgesEarned.push(BADGES.CONSISTENCY_KING.name);
        if (avgSleepHours >= targets.targetSleepHours) badgesEarned.push(BADGES.SLEEP_CHAMPION.name);
        if (avgWater >= targets.waterTargetLiters) badgesEarned.push(BADGES.HYDRATION_HERO.name);

        const xpEarned = weekBadgeMap[wk].xp
            + (weekScore >= 90 ? BADGES.PERFECT_WEEK.xp : 0)
            + (workoutDays >= targets.minWorkoutDays ? BADGES.CONSISTENCY_KING.xp : 0);

        // ── Generate AI feedback ─────────────────────────────
        const aiFeedback = await aiService.generateWeeklyFeedback({
            weekNumber: wk,
            theme: week.theme,
            targets,
            actual: { workoutDays, avgSleepHours, avgCalories, avgWater },
            score: weekScore,
            badgesEarned,
            userProfile: { fitnessLevel: roadmap.profileSnapshot.fitnessLevel, goal: roadmap.profileSnapshot.goal },
        });

        const progressedToNextWeek = wk < 4;
        const performance = {
            completedWorkoutDays: workoutDays,
            avgSleepHours: parseFloat(avgSleepHours.toFixed(1)),
            avgDailyCalories: Math.round(avgCalories),
            avgWaterLiters: parseFloat(avgWater.toFixed(1)),
            score: weekScore,
            aiFeedback,
            badgesEarned,
            progressedToNextWeek,
            completedAt: new Date(),
        };

        // ── Update roadmap in DB ─────────────────────────────
        const weekIdx = roadmap.weeks.findIndex(w => w.weekNumber === wk);
        roadmap.weeks[weekIdx].performance = performance as any;
        roadmap.currentWeek = Math.min(4, wk + 1) as any;
        roadmap.totalScore += weekScore;
        badgesEarned.forEach(b => { if (!roadmap.badgesEarned.includes(b)) roadmap.badgesEarned.push(b); });
        roadmap.xpEarned += xpEarned;

        if (wk === 4) {
            roadmap.status = 'completed';
            if (!roadmap.badgesEarned.includes(BADGES.ROADMAP_COMPLETE.name)) {
                roadmap.badgesEarned.push(BADGES.ROADMAP_COMPLETE.name);
                roadmap.xpEarned += BADGES.ROADMAP_COMPLETE.xp;
            }
        }

        await roadmap.save();

        res.json({
            performance,
            weekScore,
            xpEarned,
            badgesEarned,
            nextWeek: progressedToNextWeek ? roadmap.weeks.find(w => w.weekNumber === wk + 1) : null,
            roadmapCompleted: wk === 4,
        });
    } catch (error: any) {
        console.error('Week completion error:', error);
        res.status(500).json({ error: 'Failed to complete week', message: error.message });
    }
};

// ─── Get week detail ───────────────────────────────────────────
export const getWeekDetail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { roadmapId, weekNumber } = req.params;
        const roadmap = await RoadmapPlan.findOne({ _id: roadmapId, userId: req.userId });
        if (!roadmap) { res.status(404).json({ error: 'Roadmap not found' }); return; }

        const week = roadmap.weeks.find(w => w.weekNumber === parseInt(weekNumber));
        if (!week) { res.status(404).json({ error: 'Week not found' }); return; }

        res.json({ week, roadmapId, currentWeek: roadmap.currentWeek });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch week', message: error.message });
    }
};
