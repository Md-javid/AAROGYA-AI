import mongoose, { Schema, Document } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────

export interface IExercise {
    name: string;
    sets: string;
    reps: string;
    duration?: string;
    rest: string;
    instruction: string;
    coachNote?: string;
}

export interface IDaySchedule {
    day: string;         // Monday, Tuesday…
    type: 'Strength' | 'Cardio' | 'Yoga' | 'HIIT' | 'Rest' | 'Active Recovery';
    sessionName: string;
    durationMinutes: number;
    estimatedCaloriesBurn: number;
    exercises: IExercise[];
    restActivity?: string;  // for rest days
}

export interface IWeeklyTargets {
    minWorkoutDays: number;
    targetSleepHours: number;
    waterTargetLiters: number;
    calorieTarget: number;
    proteinTarget: string;
}

export interface IDietGuidelines {
    strategy: string;
    calorieTarget: number;
    proteinTarget: string;
    focusFoods: string[];
    avoidFoods: string[];
    mealTiming: string;
    hydrationTip: string;
    sampleMeal: string;
}

export interface IWeekPerformance {
    completedWorkoutDays: number;
    avgSleepHours: number;
    avgDailyCalories: number;
    avgWaterLiters: number;
    score: number;           // 0–100
    aiFeedback: string;      // AI-generated paragraph
    badgesEarned: string[];
    progressedToNextWeek: boolean;
    completedAt: Date;
}

export interface IRoadmapWeek {
    weekNumber: 1 | 2 | 3 | 4;
    theme: string;           // Foundation / Progressive Overload / Optimization / Peak
    philosophy: string;
    startDate: string;       // YYYY-MM-DD
    endDate: string;
    weeklyTargets: IWeeklyTargets;
    workoutSchedule: IDaySchedule[];
    dietGuidelines: IDietGuidelines;
    weeklyChallenge: string;
    successCriteria: string;
    performance?: IWeekPerformance;   // filled after week ends
}

export interface IRoadmapPlan extends Document {
    userId: mongoose.Types.ObjectId;
    status: 'active' | 'completed' | 'paused';
    currentWeek: 1 | 2 | 3 | 4;
    title: string;
    overview: string;

    // Snapshot of user profile at creation time
    profileSnapshot: {
        fitnessLevel: string;
        goal: string;
        dosha: string;
        activityLevel: string;
        hasInjuries: boolean;
        injuries?: string;
        age: number;
        weight: number;
        height: number;
    };

    weeks: IRoadmapWeek[];

    // Gamification
    totalScore: number;
    badgesEarned: string[];
    xpEarned: number;

    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────

const ExerciseSchema = new Schema({
    name: { type: String, required: true },
    sets: { type: String },
    reps: { type: String },
    duration: { type: String },
    rest: { type: String, default: '60s' },
    instruction: { type: String, required: true },
    coachNote: { type: String },
}, { _id: false });

const DayScheduleSchema = new Schema({
    day: { type: String, required: true },
    type: { type: String, required: true },
    sessionName: { type: String },
    durationMinutes: { type: Number, default: 0 },
    estimatedCaloriesBurn: { type: Number, default: 0 },
    exercises: [ExerciseSchema],
    restActivity: { type: String },
}, { _id: false });

const WeekPerformanceSchema = new Schema({
    completedWorkoutDays: { type: Number, default: 0 },
    avgSleepHours: { type: Number, default: 0 },
    avgDailyCalories: { type: Number, default: 0 },
    avgWaterLiters: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    aiFeedback: { type: String },
    badgesEarned: [String],
    progressedToNextWeek: { type: Boolean, default: false },
    completedAt: { type: Date },
}, { _id: false });

const RoadmapWeekSchema = new Schema({
    weekNumber: { type: Number, enum: [1, 2, 3, 4], required: true },
    theme: { type: String, required: true },
    philosophy: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    weeklyTargets: {
        minWorkoutDays: { type: Number },
        targetSleepHours: { type: Number },
        waterTargetLiters: { type: Number },
        calorieTarget: { type: Number },
        proteinTarget: { type: String },
    },
    workoutSchedule: [DayScheduleSchema],
    dietGuidelines: {
        strategy: { type: String },
        calorieTarget: { type: Number },
        proteinTarget: { type: String },
        focusFoods: [String],
        avoidFoods: [String],
        mealTiming: { type: String },
        hydrationTip: { type: String },
        sampleMeal: { type: String },
    },
    weeklyChallenge: { type: String },
    successCriteria: { type: String },
    performance: WeekPerformanceSchema,
}, { _id: false });

const RoadmapPlanSchema = new Schema<IRoadmapPlan>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
        currentWeek: { type: Number, enum: [1, 2, 3, 4], default: 1 },
        title: { type: String, required: true },
        overview: { type: String },
        profileSnapshot: {
            fitnessLevel: { type: String },
            goal: { type: String },
            dosha: { type: String },
            activityLevel: { type: String },
            hasInjuries: { type: Boolean },
            injuries: { type: String },
            age: { type: Number },
            weight: { type: Number },
            height: { type: Number },
        },
        weeks: [RoadmapWeekSchema],
        totalScore: { type: Number, default: 0 },
        badgesEarned: [String],
        xpEarned: { type: Number, default: 0 },
    },
    { timestamps: true }
);

RoadmapPlanSchema.index({ userId: 1, status: 1 });

export const RoadmapPlan = mongoose.model<IRoadmapPlan>('RoadmapPlan', RoadmapPlanSchema);
