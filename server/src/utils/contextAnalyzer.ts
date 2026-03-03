import mongoose from 'mongoose';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { MealLog } from '../models/MealLog.js';
import { SleepLog } from '../models/SleepLog.js';
import { WaterLog } from '../models/WaterLog.js';

// ─── Types ────────────────────────────────────────────────────

export type CoachTone =
    | 'encouraging'   // user is doing well — positive reinforcement
    | 'corrective'    // specific issues to fix — calm, direct
    | 'motivating'    // user is slumping — push them back up
    | 'celebratory';  // on a great streak — celebrate it

export interface UserContext {
    // Raw 7-day summaries
    workoutDaysCount: number;   // days with at least one workout
    missedDays: number;   // days in 7 with zero workout
    currentStreak: number;   // consecutive days worked out (ending today)
    avgSleepHours: number;
    avgSleepQuality: number;   // 1–5 scale
    avgDailyCalories: number;
    avgWaterLiters: number;
    totalWorkoutMins: number;

    // Flags
    hasStreakRisk: boolean;  // missed last 2+ days
    hasPoorSleep: boolean;  // avg sleep < 6 hrs or quality ≤ 2
    hasLowProtein: boolean;  // calories < 1200 on majority of days (proxy)
    hasLowWater: boolean;  // avg water < 1.5 L/day
    hasHighStress: boolean;  // sleep quality ≤ 2 AND missed workouts

    // Derived tone for AI
    tone: CoachTone;

    // Human-readable summary injected into prompts
    summary: string;

    // Specific issues list for targeted advice
    issues: string[];

    // Positive highlights for praise
    highlights: string[];
}

// ─── Main Analyzer ────────────────────────────────────────────

export const analyzeUserContext = async (userId: string): Promise<UserContext> => {
    const uid = new mongoose.Types.ObjectId(userId);

    // Build last-7-days date strings (YYYY-MM-DD)
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    const since = dates[dates.length - 1]; // 7 days ago

    // Parallel DB queries
    const [workouts, meals, sleeps, waters] = await Promise.all([
        WorkoutLog.find({ userId: uid, date: { $gte: since } }).lean(),
        MealLog.find({ userId: uid, date: { $gte: since } }).lean(),
        SleepLog.find({ userId: uid, date: { $gte: since } }).lean(),
        WaterLog.find({ userId: uid, date: { $gte: since } }).lean(),
    ]);

    // ── Workout analysis ──────────────────────────────────────
    const workoutDates = new Set(workouts.map(w => w.date));
    const workoutDaysCount = workoutDates.size;
    const missedDays = 7 - workoutDaysCount;
    const totalWorkoutMins = workouts.reduce((s, w) => s + w.durationMinutes, 0);

    // Current streak: count consecutive days from today backwards
    let currentStreak = 0;
    for (const d of dates) {
        if (workoutDates.has(d)) currentStreak++;
        else break;
    }

    // ── Sleep analysis ────────────────────────────────────────
    const avgSleepHours = sleeps.length
        ? sleeps.reduce((s, sl) => s + sl.durationHours, 0) / sleeps.length
        : 0;
    const avgSleepQuality = sleeps.length
        ? sleeps.reduce((s, sl) => s + sl.quality, 0) / sleeps.length
        : 0;

    // ── Nutrition analysis ────────────────────────────────────
    const mealDayMap: Record<string, number> = {};
    for (const m of meals) {
        mealDayMap[m.date] = (mealDayMap[m.date] || 0) + m.calories;
    }
    const dailyCalorieValues = Object.values(mealDayMap);
    const avgDailyCalories = dailyCalorieValues.length
        ? dailyCalorieValues.reduce((s, c) => s + c, 0) / dailyCalorieValues.length
        : 0;

    // ── Water analysis ────────────────────────────────────────
    const waterByDay: Record<string, number> = {};
    for (const w of waters) {
        const liters = w.unit === 'Glasses' ? w.amount * 0.25 : w.amount;
        waterByDay[w.date] = (waterByDay[w.date] || 0) + liters;
    }
    const avgWaterLiters = Object.values(waterByDay).length
        ? Object.values(waterByDay).reduce((s, v) => s + v, 0) / Object.values(waterByDay).length
        : 0;

    // ── Flag calculation ──────────────────────────────────────
    const hasStreakRisk = missedDays >= 2;
    const hasPoorSleep = avgSleepHours < 6 || avgSleepQuality <= 2;
    const hasLowProtein = avgDailyCalories > 0 && avgDailyCalories < 1300;
    const hasLowWater = avgWaterLiters < 1.5;
    const hasHighStress = avgSleepQuality <= 2 && missedDays >= 2;

    // ── Issues and highlights ──────────────────────────────────
    const issues: string[] = [];
    const highlights: string[] = [];

    if (hasHighStress)
        issues.push(`High stress signals detected — poor sleep (avg ${avgSleepHours.toFixed(1)}h, quality ${avgSleepQuality.toFixed(1)}/5) combined with ${missedDays} missed workout days`);
    else if (hasPoorSleep)
        issues.push(`Sleep is below optimal — averaging ${avgSleepHours.toFixed(1)} hours with quality score ${avgSleepQuality.toFixed(1)}/5 (target: 7–8h, quality 4+)`);

    if (hasStreakRisk && !hasHighStress)
        issues.push(`Workout consistency dropping — only ${workoutDaysCount}/7 days active, ${missedDays} days missed`);

    if (hasLowProtein)
        issues.push(`Calorie intake is low (avg ${Math.round(avgDailyCalories)} kcal/day) — likely under-eating protein, which hurts recovery`);

    if (hasLowWater)
        issues.push(`Hydration is insufficient — averaging ${avgWaterLiters.toFixed(1)}L/day (target: 2–3L)`);

    if (currentStreak >= 3)
        highlights.push(`🔥 Amazing! ${currentStreak}-day workout streak — keep this momentum going`);

    if (workoutDaysCount >= 5)
        highlights.push(`Crushed ${workoutDaysCount} workout days this week — top-tier consistency`);

    if (avgSleepHours >= 7.5)
        highlights.push(`Sleep is on point — averaging ${avgSleepHours.toFixed(1)} hours. Recovery is maximized`);

    if (avgWaterLiters >= 2.5)
        highlights.push(`Hydration is excellent — ${avgWaterLiters.toFixed(1)}L/day is keeping your system firing`);

    if (avgDailyCalories >= 1600 && avgDailyCalories <= 2400)
        highlights.push(`Nutrition is well-balanced — averaging ${Math.round(avgDailyCalories)} kcal/day`);

    // ── Tone selection ────────────────────────────────────────
    let tone: CoachTone;
    const issueCount = issues.length;

    if (currentStreak >= 5 && issueCount === 0) {
        tone = 'celebratory';
    } else if (issueCount === 0 || highlights.length > issueCount) {
        tone = 'encouraging';
    } else if (hasHighStress || (hasStreakRisk && hasPoorSleep)) {
        tone = 'motivating';
    } else {
        tone = 'corrective';
    }

    // ── Human-readable summary ────────────────────────────────
    const summary = buildSummary({
        workoutDaysCount, missedDays, currentStreak,
        avgSleepHours, avgSleepQuality,
        avgDailyCalories, avgWaterLiters,
        totalWorkoutMins, tone,
    });

    return {
        workoutDaysCount, missedDays, currentStreak,
        avgSleepHours: parseFloat(avgSleepHours.toFixed(1)),
        avgSleepQuality: parseFloat(avgSleepQuality.toFixed(1)),
        avgDailyCalories: Math.round(avgDailyCalories),
        avgWaterLiters: parseFloat(avgWaterLiters.toFixed(1)),
        totalWorkoutMins,
        hasStreakRisk, hasPoorSleep, hasLowProtein, hasLowWater, hasHighStress,
        tone, summary, issues, highlights,
    };
};

// ─── Summary Builder ──────────────────────────────────────────

function buildSummary(data: {
    workoutDaysCount: number; missedDays: number; currentStreak: number;
    avgSleepHours: number; avgSleepQuality: number;
    avgDailyCalories: number; avgWaterLiters: number;
    totalWorkoutMins: number; tone: CoachTone;
}): string {
    return `
LAST 7 DAYS ACTIVITY CONTEXT:
- Workout days: ${data.workoutDaysCount}/7 (${data.missedDays} missed) | Total active minutes: ${data.totalWorkoutMins} min
- Current streak: ${data.currentStreak} consecutive days
- Avg sleep: ${data.avgSleepHours.toFixed(1)} hours/night | Sleep quality: ${data.avgSleepQuality.toFixed(1)}/5
- Avg daily calorie intake: ${data.avgDailyCalories} kcal
- Avg water intake: ${data.avgWaterLiters.toFixed(1)} L/day
- Overall coaching tone this session: ${data.tone.toUpperCase()}
`.trim();
}
