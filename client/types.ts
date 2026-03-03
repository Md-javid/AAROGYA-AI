
export interface UserProfile {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  weight: number;
  height: number;
  region: string;
  dietaryPreference: string;
  language: string;
  goal: string;
  activityLevel: string;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  hasInjuries: boolean;
  injuries?: string;
  medicalConditions?: string;
  motto?: string;
  avatar?: string;
  dosha?: 'Vata' | 'Pitta' | 'Kapha' | 'Unset';
}

export interface MealVisionResult {
  dishName: string;
  calories: number;
  macronutrients: {
    protein: string;
    carbs: string;
    fats: string;
  };
  ayurvedicInsight: string;
  healthScore: number;
}

export interface WorkoutVisionResult {
  identifiedExercise: string;
  formAnalysis: string;
  musclesWorked: string[];
  safetyRating: number; // 0-100
  tip: string;
}

export interface Ritual {
  id: string;
  time: string;
  name: string;
  description: string;
  isCompleted: boolean;
  category: 'Morning' | 'Afternoon' | 'Evening';
}

export interface MealItem {
  dishName: string;
  quantity: string;
  calories: number;
  protein: string;
  prepTime: string;
  ingredients: string[];
  instructions: string[];
  notes: string;
  videoUrl?: string;
}

export interface DietPlan {
  breakfast: MealItem;
  lunch: MealItem;
  snack: MealItem;
  dinner: MealItem;
  hydrationTip: string;
  regionalSpecialty: string;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  duration?: string;
  instruction: string;
  videoUrl?: string;
}

export interface WorkoutPlan {
  warmup: Exercise[];
  mainWorkout: Exercise[];
  cooldown: Exercise[];
  yogaPose?: string;
  difficulty: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  intensity: 'Low' | 'Medium' | 'High';
  caloriesBurned: number;
}

export interface MealLog {
  id: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  items: string;
  calories: number;
}

export interface SleepLog {
  id: string;
  date: string;
  durationHours: number;
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface WaterLog {
  id: string;
  date: string;
  amount: number;
  unit: 'Glasses' | 'Liters';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Consistency' | 'Workout' | 'Diet' | 'Milestone';
}

export interface EarnedBadge extends Badge {
  earnedAt: string;
}

export type DashboardTab = 'overview' | 'diet' | 'workout' | 'rituals' | 'yoga' | 'chat' | 'progress' | 'settings' | 'shopping' | 'gym' | 'trainers' | 'marketplace' | 'roadmap' | 'movement' | 'food';


export interface DailyStats {
  caloriesBurned: number;
  caloriesConsumed: number;
  waterIntake: number;
  sleepHours: number;
  workoutMinutes: number;
  score: number;
}
