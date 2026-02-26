
import { WorkoutLog, MealLog, SleepLog, WaterLog, EarnedBadge, Badge, DailyStats } from "../types";

const WORKOUT_STORAGE_KEY = 'aarogya_workout_logs';
const MEAL_STORAGE_KEY = 'aarogya_meal_logs';
const SLEEP_STORAGE_KEY = 'aarogya_sleep_logs';
const WATER_STORAGE_KEY = 'aarogya_water_logs';
const BADGE_STORAGE_KEY = 'aarogya_earned_badges';
const THEME_KEY = 'aarogya_theme';

export const getWorkoutLogs = (): WorkoutLog[] => {
  try {
    const data = localStorage.getItem(WORKOUT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load workout logs", e);
    return [];
  }
};

export const saveWorkoutLog = (log: Omit<WorkoutLog, 'id'>): WorkoutLog => {
  const logs = getWorkoutLogs();
  const newLog: WorkoutLog = {
    ...log,
    id: Date.now().toString(),
  };
  const updatedLogs = [...logs, newLog];
  localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(updatedLogs));
  return newLog;
};

export const getMealLogs = (): MealLog[] => {
  try {
    const data = localStorage.getItem(MEAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load meal logs", e);
    return [];
  }
};

export const saveMealLog = (log: Omit<MealLog, 'id'>): MealLog => {
  const logs = getMealLogs();
  const newLog: MealLog = {
    ...log,
    id: Date.now().toString(),
  };
  const updatedLogs = [...logs, newLog];
  localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(updatedLogs));
  return newLog;
};

export const getSleepLogs = (): SleepLog[] => {
  try {
    const data = localStorage.getItem(SLEEP_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load sleep logs", e);
    return [];
  }
};

export const saveSleepLog = (log: Omit<SleepLog, 'id'>): SleepLog => {
  const logs = getSleepLogs();
  const newLog: SleepLog = {
    ...log,
    id: Date.now().toString(),
  };
  const updatedLogs = [...logs, newLog];
  localStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(updatedLogs));
  return newLog;
};

export const getWaterLogs = (): WaterLog[] => {
  try {
    const data = localStorage.getItem(WATER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load water logs", e);
    return [];
  }
};

export const saveWaterLog = (log: Omit<WaterLog, 'id'>): WaterLog => {
  const logs = getWaterLogs();
  const newLog: WaterLog = {
    ...log,
    id: Date.now().toString(),
  };
  const updatedLogs = [...logs, newLog];
  localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(updatedLogs));
  return newLog;
};

export const getEarnedBadges = (): EarnedBadge[] => {
  try {
    const data = localStorage.getItem(BADGE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load badges", e);
    return [];
  }
};

export const saveEarnedBadge = (badge: Badge): EarnedBadge => {
  const badges = getEarnedBadges();
  const alreadyEarned = badges.find(b => b.id === badge.id);
  if (alreadyEarned) return alreadyEarned;

  const newEarnedBadge: EarnedBadge = {
    ...badge,
    earnedAt: new Date().toISOString(),
  };
  const updatedBadges = [...badges, newEarnedBadge];
  localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(updatedBadges));
  return newEarnedBadge;
};

export const getDailyStats = (date: string): DailyStats => {
  const workouts = getWorkoutLogs().filter(l => l.date === date);
  const meals = getMealLogs().filter(l => l.date === date);
  const sleep = getSleepLogs().find(l => l.date === date);
  const water = getWaterLogs().filter(l => l.date === date);

  const caloriesBurned = workouts.reduce((sum, l) => sum + l.caloriesBurned, 0);
  const workoutMinutes = workouts.reduce((sum, l) => sum + l.durationMinutes, 0);
  const caloriesConsumed = meals.reduce((sum, l) => sum + l.calories, 0);
  const waterIntake = water.reduce((sum, l) => sum + l.amount, 0);
  const sleepHours = sleep?.durationHours || 0;

  // Simple Score Algorithm (0-100)
  // 30% Diet, 30% Workout, 20% Water, 20% Sleep
  const dietScore = Math.min(30, (meals.length / 3) * 30);
  const workoutScore = Math.min(30, (workoutMinutes / 45) * 30);
  const waterScore = Math.min(20, (waterIntake / 8) * 20);
  const sleepScore = Math.min(20, (sleepHours / 7) * 20);

  return {
    caloriesBurned,
    caloriesConsumed,
    waterIntake,
    sleepHours,
    workoutMinutes,
    score: Math.round(dietScore + workoutScore + waterScore + sleepScore)
  };
};

export const getStreak = (): number => {
  const workoutDates = getWorkoutLogs().map(l => l.date);
  const mealDates = getMealLogs().map(l => l.date);
  const sleepDates = getSleepLogs().map(l => l.date);
  const waterDates = getWaterLogs().map(l => l.date);
  
  const allDates = [...new Set([...workoutDates, ...mealDates, ...sleepDates, ...waterDates])].sort().reverse();
  
  if (allDates.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < allDates.length; i++) {
    const logDate = new Date(allDates[i]);
    const diffTime = Math.abs(currentDate.getTime() - logDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= streak + 1) {
       streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const clearLogs = () => {
  localStorage.removeItem(WORKOUT_STORAGE_KEY);
  localStorage.removeItem(MEAL_STORAGE_KEY);
  localStorage.removeItem(SLEEP_STORAGE_KEY);
  localStorage.removeItem(WATER_STORAGE_KEY);
  localStorage.removeItem(BADGE_STORAGE_KEY);
};

export const clearAllData = () => {
  clearLogs();
  localStorage.removeItem(THEME_KEY);
  // Optional: clear user profile if you want a complete factory reset
};
