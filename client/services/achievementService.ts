import { WorkoutLog, MealLog, SleepLog, Badge } from "../types";
import { ALL_BADGES } from "../constants";
import { getEarnedBadges, saveEarnedBadge, getSleepLogs } from "./storageService";

export const checkAchievements = (workouts: WorkoutLog[], meals: MealLog[]): Badge[] => {
  const earnedSoFar = getEarnedBadges();
  const sleepLogs = getSleepLogs();
  const newlyEarned: Badge[] = [];

  const checkAndGrant = (badgeId: string, condition: boolean) => {
    if (condition && !earnedSoFar.some(b => b.id === badgeId)) {
      const badge = ALL_BADGES.find(b => b.id === badgeId);
      if (badge) {
        saveEarnedBadge(badge);
        newlyEarned.push(badge);
      }
    }
  };

  // 1. First Log
  checkAndGrant('first-log', workouts.length > 0 || meals.length > 0 || sleepLogs.length > 0);

  // 2. Consistency Streaks
  const allDates = [...new Set([
    ...workouts.map(w => w.date), 
    ...meals.map(m => m.date),
    ...sleepLogs.map(s => s.date)
  ])].sort();
  
  const calculateStreak = (dates: string[]) => {
    if (dates.length === 0) return 0;
    let maxStreak = 0;
    let currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i-1]);
      const curr = new Date(dates[i]);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    return Math.max(maxStreak, currentStreak);
  };

  const streak = calculateStreak(allDates);
  checkAndGrant('streak-3', streak >= 3);
  checkAndGrant('streak-7', streak >= 7);

  // 3. Yoga Fan
  const yogaCount = workouts.filter(w => w.type === 'Yoga').length;
  checkAndGrant('yoga-fan', yogaCount >= 5);

  // 4. Calorie Milestones
  const totalBurned = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  checkAndGrant('calorie-1k', totalBurned >= 1000);

  // 5. Diet Pro
  checkAndGrant('diet-pro', meals.length >= 10);

  // 6. Heavy Lifter
  const strengthCount = workouts.filter(w => w.type === 'Strength').length;
  checkAndGrant('heavy-lifter', strengthCount >= 10);

  // 7. Sleep Master
  const qualitySleepDays = sleepLogs.filter(s => s.durationHours >= 7 && s.quality >= 3).length;
  checkAndGrant('sleep-master', qualitySleepDays >= 5);

  return newlyEarned;
};