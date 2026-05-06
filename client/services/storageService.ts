
import { WorkoutLog, MealLog, SleepLog, WaterLog, EarnedBadge, Badge, DailyStats } from "../types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WORKOUT_STORAGE_KEY = 'aarogya_workout_logs';
const MEAL_STORAGE_KEY = 'aarogya_meal_logs';
const SLEEP_STORAGE_KEY = 'aarogya_sleep_logs';
const WATER_STORAGE_KEY = 'aarogya_water_logs';
const BADGE_STORAGE_KEY = 'aarogya_earned_badges';
const THEME_KEY = 'aarogya_theme';

// ── Auth helper ──
const getAuthHeaders = (): HeadersInit => {
  const token = sessionStorage.getItem('accessToken');
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
};

const isAuthenticated = () => !!sessionStorage.getItem('accessToken');

// ── Generic API caller with sessionStorage fallback ──
const apiPost = async <T>(endpoint: string, body: any): Promise<T | null> => {
  if (!isAuthenticated()) return null;
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.log ?? data;
  } catch {
    return null;
  }
};

const apiGet = async <T>(endpoint: string): Promise<T[] | null> => {
  if (!isAuthenticated()) return null;
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.logs ?? data;
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════
// WORKOUT LOGS — syncs to backend + sessionStorage cache
// ═══════════════════════════════════════════
export const getWorkoutLogs = (): WorkoutLog[] => {
  try {
    const data = sessionStorage.getItem(WORKOUT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load workout logs", e);
    return [];
  }
};

export const saveWorkoutLog = (log: Omit<WorkoutLog, 'id'>): WorkoutLog => {
  const logs = getWorkoutLogs();
  const newLog: WorkoutLog = { ...log, id: Date.now().toString() };
  const updatedLogs = [...logs, newLog];
  sessionStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(updatedLogs));

  // Sync to backend (fire-and-forget)
  apiPost('/logs/workout', log).catch(() => {});
  return newLog;
};

// ═══════════════════════════════════════════
// MEAL LOGS
// ═══════════════════════════════════════════
export const getMealLogs = (): MealLog[] => {
  try {
    const data = sessionStorage.getItem(MEAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load meal logs", e);
    return [];
  }
};

export const saveMealLog = (log: Omit<MealLog, 'id'>): MealLog => {
  const logs = getMealLogs();
  const newLog: MealLog = { ...log, id: Date.now().toString() };
  const updatedLogs = [...logs, newLog];
  sessionStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(updatedLogs));

  apiPost('/logs/meal', log).catch(() => {});
  return newLog;
};

// ═══════════════════════════════════════════
// SLEEP LOGS
// ═══════════════════════════════════════════
export const getSleepLogs = (): SleepLog[] => {
  try {
    const data = sessionStorage.getItem(SLEEP_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load sleep logs", e);
    return [];
  }
};

export const saveSleepLog = (log: Omit<SleepLog, 'id'>): SleepLog => {
  const logs = getSleepLogs();
  const newLog: SleepLog = { ...log, id: Date.now().toString() };
  const updatedLogs = [...logs, newLog];
  sessionStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(updatedLogs));

  apiPost('/logs/sleep', log).catch(() => {});
  return newLog;
};

// ═══════════════════════════════════════════
// WATER LOGS
// ═══════════════════════════════════════════
export const getWaterLogs = (): WaterLog[] => {
  try {
    const data = sessionStorage.getItem(WATER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load water logs", e);
    return [];
  }
};

export const saveWaterLog = (log: Omit<WaterLog, 'id'>): WaterLog => {
  const logs = getWaterLogs();
  const newLog: WaterLog = { ...log, id: Date.now().toString() };
  const updatedLogs = [...logs, newLog];
  sessionStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(updatedLogs));

  apiPost('/logs/water', log).catch(() => {});
  return newLog;
};

// ═══════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════
export const getEarnedBadges = (): EarnedBadge[] => {
  try {
    const data = sessionStorage.getItem(BADGE_STORAGE_KEY);
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
  sessionStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(updatedBadges));
  return newEarnedBadge;
};

// ═══════════════════════════════════════════
// DAILY STATS — computed from local logs
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// STREAK
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// SYNC — Pull data from backend to sessionStorage
// ═══════════════════════════════════════════
export const syncFromBackend = async (): Promise<void> => {
  if (!isAuthenticated()) return;

  try {
    const [workouts, meals, sleeps, waters] = await Promise.all([
      apiGet<WorkoutLog>('/logs/workout'),
      apiGet<MealLog>('/logs/meal'),
      apiGet<SleepLog>('/logs/sleep'),
      apiGet<WaterLog>('/logs/water'),
    ]);

    if (workouts) sessionStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(workouts));
    if (meals) sessionStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(meals));
    if (sleeps) sessionStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(sleeps));
    if (waters) sessionStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(waters));
  } catch (err) {
    console.warn('Backend sync failed, using cached data:', err);
  }
};

// ═══════════════════════════════════════════
// CLEAR
// ═══════════════════════════════════════════
export const clearLogs = () => {
  sessionStorage.removeItem(WORKOUT_STORAGE_KEY);
  sessionStorage.removeItem(MEAL_STORAGE_KEY);
  sessionStorage.removeItem(SLEEP_STORAGE_KEY);
  sessionStorage.removeItem(WATER_STORAGE_KEY);
  sessionStorage.removeItem(BADGE_STORAGE_KEY);
};

export const clearAllData = () => {
  clearLogs();
  sessionStorage.removeItem(THEME_KEY);
};
