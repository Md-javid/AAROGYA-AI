import { Badge } from './types';

export const REGIONS = [
  'North India (Punjab, Delhi, Haryana)',
  'South India (Tamil Nadu, Kerala, Karnataka, Andhra)',
  'West India (Maharashtra, Gujarat, Rajasthan)',
  'East India (Bengal, Odisha, Bihar)',
  'North East India',
  'Central India',
];

export const DIETARY_PREFERENCES = [
  'Vegetarian',
  'Non-Vegetarian',
  'Eggetarian',
  'Vegan',
  'Jain (No Onion/Garlic)',
  'Gluten-Free',
];

export const LANGUAGES = [
  'English',
  'Hindi',
  'Hinglish',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Kannada',
  'Gujarati',
  'Punjabi',
];

export const GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'Maintenance / General Fitness',
  'Flexibility & Yoga Focus',
  'Post-Pregnancy Recovery',
  'Athletic Performance',
];

export const ACTIVITY_LEVELS = [
  'Sedentary (Desk job, little movement)',
  'Lightly Active (Walking, light yoga)',
  'Moderately Active (Gym/Sports 3-4x/week)',
  'Very Active (Heavy exercise daily)',
];

export const FITNESS_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

export const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Abby',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Simba',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
];

export const ALL_BADGES: Badge[] = [
  {
    id: 'first-log',
    name: 'Aarogya Pioneer',
    description: 'Logged your very first activity or meal.',
    icon: 'Flag',
    category: 'Milestone'
  },
  {
    id: 'streak-3',
    name: 'Consistent Soul',
    description: 'Logged for 3 consecutive days.',
    icon: 'Zap',
    category: 'Consistency'
  },
  {
    id: 'streak-7',
    name: 'Weekly Warrior',
    description: 'Logged for 7 consecutive days.',
    icon: 'Trophy',
    category: 'Consistency'
  },
  {
    id: 'yoga-fan',
    name: 'Aspiring Yogi',
    description: 'Completed 5 yoga sessions.',
    icon: 'Lotus',
    category: 'Workout'
  },
  {
    id: 'calorie-1k',
    name: 'Calorie Crusher',
    description: 'Burned a total of 1000 calories through workouts.',
    icon: 'Flame',
    category: 'Milestone'
  },
  {
    id: 'diet-pro',
    name: 'Mindful Eater',
    description: 'Logged 10 different meals.',
    icon: 'Utensils',
    category: 'Diet'
  },
  {
    id: 'heavy-lifter',
    name: 'Power House',
    description: 'Completed 10 strength training sessions.',
    icon: 'Dumbbell',
    category: 'Workout'
  },
  {
    id: 'sleep-master',
    name: 'Sleep Master',
    description: 'Logged 5 days of 7+ hours of quality sleep.',
    icon: 'Moon',
    category: 'Consistency'
  }
];
