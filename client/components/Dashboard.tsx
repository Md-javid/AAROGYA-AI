
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, DietPlan, WorkoutPlan, MealItem, DashboardTab, DailyStats } from '../types';
import { generateDietPlan, generateWorkoutPlan, getAarogyaNews } from '../services/geminiService';
import { saveWorkoutLog, saveMealLog, saveSleepLog, saveWaterLog, getWorkoutLogs, getMealLogs, getSleepLogs, getWaterLogs, getDailyStats, getStreak } from '../services/storageService';
import { checkAchievements } from '../services/achievementService';
import Chat from './Chat';
import ProgressView from './ProgressView';
import LogModal from './LogModal';
import RecipeModal from './RecipeModal';
import SettingsView from './SettingsView';
import ShoppingView from './ShoppingView';
import DhyanaView from './DhyanaView';
import RitualsView from './RitualsView';
import VoiceLogModal from './VoiceLogModal';
import MealVisionModal from './MealVisionModal';
import WorkoutVisionModal from './WorkoutVisionModal';
import GymLocatorView from './GymLocatorView';
import TrainerConnectView from './TrainerConnectView';
import FoodMarketplaceView from './FoodMarketplaceView';
import MovementTracker from './MovementTracker';
import FoodTracker from './FoodTracker';
import RoadmapView from './RoadmapView';
import WearablesView from './WearablesView';
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import {
  Utensils, Dumbbell, MessageCircle, Sun, Moon, Droplets, Flame,
  TrendingUp, LayoutDashboard, Zap, Loader2, Flower2 as Lotus,
  Maximize2, Video, Settings as SettingsIcon, ShoppingCart, Mic,
  Wind, ThermometerSun, Sparkles, Camera, Clock, ArrowRight,
  Heart, Activity, Target, Award, Plus, Minus,
  Brain, Coffee, Apple, BedDouble, BarChart3, RefreshCw, Star,
  ChevronRight, Play, Bolt, MapPin, Users, Leaf, Watch
} from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  onReset: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateProfile: (p: Partial<UserProfile>) => void;
  elderMode?: boolean;
  onToggleElderMode?: () => void;
}

const QUOTES = [
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Health is not about the weight you lose, but the life you gain.", author: "Unknown" },
  { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
  { text: "Your body can do it. It's your mind you need to convince.", author: "Unknown" },
  { text: "A healthy outside starts from the inside.", author: "Robert Urich" },
  { text: "Fitness is not a destination, it's a way of life.", author: "Unknown" },
];

const getSeasonTip = () => {
  const month = new Date().getMonth();
  if (month < 2) return { name: 'Late Winter', label: 'Dec – Jan', tip: 'Warm spices like ginger and turmeric help keep you healthy in the cold.', icon: Wind, color: 'from-blue-900 to-slate-900' };
  if (month < 4) return { name: 'Spring', label: 'Feb – Mar', tip: 'Eat more greens and bitter vegetables to detox your body after winter.', icon: Sun, color: 'from-emerald-900 to-teal-900' };
  if (month < 6) return { name: 'Summer', label: 'Apr – May', tip: 'Stay cool with coconut water, melon, and light meals. Avoid heavy foods.', icon: ThermometerSun, color: 'from-orange-900 to-red-900' };
  if (month < 8) return { name: 'Monsoon', label: 'Jun – Jul', tip: 'Eat freshly cooked, light meals. Avoid raw or heavy foods during rains.', icon: ThermometerSun, color: 'from-indigo-900 to-blue-900' };
  if (month < 10) return { name: 'Autumn', label: 'Aug – Sep', tip: 'Add healthy fats like ghee and nuts to your diet for energy and warmth.', icon: Zap, color: 'from-amber-900 to-orange-900' };
  return { name: 'Early Winter', label: 'Oct – Nov', tip: 'Dates, nuts, and warm soups give you the strength needed for the cold.', icon: Moon, color: 'from-slate-900 to-indigo-950' };
};

// Animated circular ring component
const RingProgress: React.FC<{ value: number; max: number; color: string; size?: number; strokeWidth?: number; label: string; sublabel: string; icon: React.ReactNode }> = ({
  value, max, color, size = 120, strokeWidth = 10, label, sublabel, icon
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-100 dark:text-slate-800" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-slate-500 dark:text-slate-400 mb-0.5">{icon}</div>
          <span className="text-sm font-black text-slate-800 dark:text-white">{value}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">{label}</p>
        <p className="text-[9px] text-slate-400 font-medium">{sublabel}</p>
      </div>
    </div>
  );
};

const STATIC_WORKOUTS = [
  { category: 'Warm Up', color: '#f97316', icon: '🔥',
    exercises: [
      { name: 'Jumping Jacks', sets: '3', reps: '30 sec', yt: 'jumping jacks warmup exercise tutorial' },
      { name: 'Arm Circles', sets: '2', reps: '20 reps', yt: 'arm circles shoulder warmup' },
      { name: 'Hip Rotations', sets: '2', reps: '20 sec each', yt: 'hip rotation warmup exercise' },
      { name: 'Neck Rolls', sets: '1', reps: '30 sec', yt: 'neck roll stretch beginners' },
    ]
  },
  { category: 'Strength', color: '#8b5cf6', icon: '💪',
    exercises: [
      { name: 'Push-ups', sets: '3', reps: '12', yt: 'push ups proper form tutorial' },
      { name: 'Bodyweight Squats', sets: '3', reps: '15', yt: 'bodyweight squat perfect form' },
      { name: 'Plank Hold', sets: '3', reps: '45 sec', yt: 'plank exercise benefits tutorial' },
      { name: 'Lunges', sets: '3', reps: '10 each', yt: 'walking lunges exercise tutorial' },
      { name: 'Glute Bridge', sets: '3', reps: '15', yt: 'glute bridge exercise benefits' },
    ]
  },
  { category: 'Cardio', color: '#ef4444', icon: '🏃',
    exercises: [
      { name: 'Burpees', sets: '3', reps: '10', yt: 'burpees exercise tutorial beginners' },
      { name: 'Mountain Climbers', sets: '3', reps: '30 sec', yt: 'mountain climbers cardio tutorial' },
      { name: 'High Knees', sets: '3', reps: '30 sec', yt: 'high knees cardio workout' },
      { name: 'Jump Rope', sets: '3', reps: '1 min', yt: 'jump rope cardio workout tutorial' },
    ]
  },
  { category: 'Cool Down', color: '#10b981', icon: '🧘',
    exercises: [
      { name: "Child's Pose", sets: '1', reps: '60 sec', yt: "child's pose yoga stretch tutorial" },
      { name: 'Cat-Cow Stretch', sets: '1', reps: '10 reps', yt: 'cat cow stretch yoga tutorial' },
      { name: 'Seated Forward Fold', sets: '1', reps: '30 sec', yt: 'seated forward fold yoga stretch' },
      { name: 'Legs Up the Wall', sets: '1', reps: '2 min', yt: 'legs up the wall yoga recovery' },
    ]
  },
];

const HOW_TO_STEPS = [
  { icon: '🍽️', title: 'Scan Your Food', desc: 'Tap the orange Scan Food button at the bottom to photograph any meal — Gemini AI identifies it instantly.' },
  { icon: '🎙️', title: 'Voice Log', desc: 'Say "I had dal chawal for lunch" and AI will log the meal with macros automatically.' },
  { icon: '💪', title: 'Log Workouts', desc: 'Head to Train to see AI-generated workouts and YouTube tutorials for each exercise.' },
  { icon: '🤖', title: 'Chat with Coach', desc: 'Tap the purple button (bottom-right) to ask your AI coach anything about fitness and nutrition.' },
  { icon: '📈', title: 'Track Progress', desc: 'The Progress tab shows charts, badges, and your weekly health score.' },
  { icon: '🗺️', title: '4-Week Roadmap', desc: 'Get a personalised 4-week programme that builds intensity week by week.' },
];

const Dashboard: React.FC<DashboardProps> = ({ user, onReset, isDarkMode, onToggleDarkMode, onUpdateProfile, elderMode = false, onToggleElderMode }) => {
  // XP / Gamification
  const [xp, setXp] = React.useState(() => parseInt(localStorage.getItem('aarogya_xp') || '0'));
  const [level, setLevel] = React.useState(() => Math.floor(xp / 500) + 1);
  const [showXpPop, setShowXpPop] = React.useState(false);
  const [showLevelUp, setShowLevelUp] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(() => !localStorage.getItem('aarogya_guided'));
  const awardXp = (pts: number) => {
    const newXp = xp + pts;
    const oldLevel = Math.floor(xp / 500) + 1;
    const newLevel = Math.floor(newXp / 500) + 1;
    setXp(newXp); localStorage.setItem('aarogya_xp', String(newXp));
    setLevel(newLevel);
    setShowXpPop(true); setTimeout(() => setShowXpPop(false), 2000);
    if (newLevel > oldLevel) { setShowLevelUp(true); setTimeout(() => setShowLevelUp(false), 4000); }
  };
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isVoiceLogOpen, setIsVoiceLogOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [isWorkoutVisionOpen, setIsWorkoutVisionOpen] = useState(false);
  const [logType, setLogType] = useState<'workout' | 'meal' | 'sleep' | 'water'>('workout');
  const [selectedMeal, setSelectedMeal] = useState<{ meal: MealItem; type: string } | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [news, setNews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DailyStats>(getDailyStats(new Date().toISOString().split('T')[0]));
  const [streak, setStreak] = useState(getStreak());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  const season = getSeasonTip();

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Quote rotator with fade
  useEffect(() => {
    const t = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 500);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const dp = await generateDietPlan(user);
      const wp = await generateWorkoutPlan(user);
      const aarogyaNews = await getAarogyaNews(user);
      setDietPlan(dp);
      setWorkoutPlan(wp);
      setNews(aarogyaNews);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user.goal, user.fitnessLevel]);

  useEffect(() => { fetchPlans(); }, [user.goal, user.fitnessLevel]);

  const refreshDashboard = () => {
    const today = new Date().toISOString().split('T')[0];
    setStats(getDailyStats(today));
    setStreak(getStreak());
  };

  const bmi = (user.weight / ((user.height / 100) ** 2));
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi < 18.5 ? '#60a5fa' : bmi < 25 ? '#34d399' : bmi < 30 ? '#fbbf24' : '#f87171';

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const navItems = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard, color: '#9B6BFF' },
    { id: 'workout', label: 'Train', icon: Dumbbell, color: '#FF5FA0' },
    { id: 'roadmap', label: 'Roadmap', icon: Target, color: '#F59E0B' },
    { id: 'food', label: 'Food Log', icon: Utensils, color: '#10B981' },
    { id: 'yoga', label: 'Wellness', icon: Lotus, color: '#8B5CF6' },
    { id: 'progress', label: 'Progress', icon: TrendingUp, color: '#14B8A6' },
    { id: 'settings', label: 'Profile', icon: SettingsIcon, color: '#64748B' },
  ];

  const featureButtons = [
    { id: 'gym', label: 'Find Gyms', icon: MapPin, color: '#818cf8', glow: 'rgba(129,140,248,0.3)' },
    { id: 'trainers', label: 'Trainers', icon: Users, color: '#a78bfa', glow: 'rgba(167,139,250,0.3)' },
    { id: 'marketplace', label: 'Healthy Market', icon: ShoppingCart, color: '#34d399', glow: 'rgba(52,211,153,0.3)' },
    { id: 'roadmap', label: '4-Week Plan', icon: Target, color: '#F59E0B', glow: 'rgba(245,158,11,0.3)' },
    { id: 'yoga', label: 'Meditation', icon: Lotus, color: '#8B5CF6', glow: 'rgba(139,92,246,0.3)' },
    { id: 'movement', label: 'Movement', icon: Activity, color: '#22d3ee', glow: 'rgba(34,211,238,0.3)' },
    { id: 'wearables', label: 'Wearables', icon: Watch, color: '#A78BFA', glow: 'rgba(167,139,250,0.3)' },
  ];


  return (
    <div className="min-h-screen transition-colors relative font-sans" style={{ background: isDarkMode ? '#06000F' : '#F2F4F8' }}>

      {/* ── PLASMA AURORA BACKGROUND (matching login page) ── */}
      {isDarkMode && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg,#08001A 0%,#0D0528 50%,#06001A 100%)' }} />
          <div className="absolute w-[60%] h-[60%] top-[-15%] left-[-10%] rounded-full" style={{ background: 'radial-gradient(circle,rgba(160,60,255,0.18) 0%,rgba(100,0,200,0.08) 50%,transparent 75%)', filter: 'blur(60px)', animation: 'float 12s ease-in-out infinite' }} />
          <div className="absolute w-[50%] h-[50%] top-[20%] right-[-10%] rounded-full" style={{ background: 'radial-gradient(circle,rgba(200,80,255,0.14) 0%,rgba(130,30,220,0.06) 55%,transparent 75%)', filter: 'blur(60px)', animation: 'float 16s ease-in-out infinite reverse' }} />
          <div className="absolute w-[45%] h-[45%] bottom-[-10%] left-[25%] rounded-full" style={{ background: 'radial-gradient(circle,rgba(120,40,240,0.12) 0%,rgba(80,10,180,0.06) 55%,transparent 75%)', filter: 'blur(60px)', animation: 'float 10s ease-in-out infinite' }} />
        </div>
      )}

      {/* ── XP Pop Animation ── */}
      {showXpPop && (
        <div className="fixed top-20 right-6 z-[200] animate-xpPop pointer-events-none">
          <div className="xp-badge text-base font-black px-4 py-2">+XP 🎉</div>
        </div>
      )}

      {/* ── LEVEL UP CELEBRATION ── */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
          <div className="animate-fadeIn text-center px-10 py-8 rounded-[2.5rem]"
            style={{ background: 'rgba(8,12,28,0.92)', backdropFilter: 'blur(32px)', border: '1.5px solid rgba(155,107,255,0.4)', boxShadow: '0 0 60px rgba(155,107,255,0.4)' }}>
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-3xl font-black text-white mb-1">Level {level}!</h2>
            <p className="text-white/60 font-bold">You leveled up — keep going!</p>
            <div className="mt-3 flex justify-center gap-2">
              {['🥇','⭐','🎯','🔥','💎'].map((e, i) => <span key={i} className="text-2xl">{e}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* ── HOW TO USE GUIDE (first-time) ── */}
      {showGuide && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}>
          <div className="w-full max-w-lg rounded-[2.5rem] overflow-hidden"
            style={{ background: 'rgba(8,12,28,0.97)', border: '1.5px solid rgba(255,255,255,0.12)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#9B6BFF,#FF5FA0)' }}>
                  <Sparkles size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Welcome to Aarogya AI 👋</h2>
                <p className="text-white/50 text-sm">Here's a quick guide to get you started</p>
              </div>
              <div className="space-y-3 mb-6">
                {HOW_TO_STEPS.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-2xl flex-shrink-0">{s.icon}</span>
                    <div>
                      <p className="text-white font-black text-sm">{s.title}</p>
                      <p className="text-white/50 text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setShowGuide(false); localStorage.setItem('aarogya_guided', '1'); }}
                className="w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#9B6BFF,#FF5FA0)' }}>
                Let's Go! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP NAV (glass) ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] w-full">
        <div style={isDarkMode
          ? { background: 'rgba(8,12,28,0.70)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }
          : { background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 16px rgba(0,0,0,0.04)' }}
          className="px-4 md:px-6 py-3 flex items-center justify-between gap-3">

          <div className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0" onClick={() => setActiveTab('overview')}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              style={{ background: 'linear-gradient(135deg, #9B6BFF, #FF5FA0)', boxShadow: '0 0 20px rgba(155,107,255,0.4)' }}>
              <Zap size={16} className="text-white fill-white" />
            </div>
            <div>
              <span className={`font-black text-base tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Aarogya</span>
              <span className="ml-2 level-badge text-xs px-2 py-0.5">Lv{level}</span>
            </div>
          </div>

          {/* XP bar */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-[200px]">
            <div className="xp-bar flex-1">
              <div className="xp-fill" style={{ width: `${((xp % 500) / 500) * 100}%` }} />
            </div>
            <span className={`text-xs font-bold whitespace-nowrap ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{xp % 500}/500</span>
          </div>

          {/* Streak */}
          <div className="streak-badge flex items-center gap-1 text-sm hidden sm:flex">
            🔥 {streak}d
          </div>

          {/* Nav Pills */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 min-w-max mx-auto justify-center">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as DashboardTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap relative group ${activeTab === item.id
                    ? 'shadow-lg'
                    : isDarkMode ? 'text-white/50 hover:text-white/80' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  style={activeTab === item.id ? {
                    background: isDarkMode ? `rgba(255,255,255,0.08)` : `${item.color}15`,
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : item.color + '40'}`,
                    boxShadow: `0 0 16px ${item.color}25`,
                    color: item.color,
                    backdropFilter: 'blur(12px)',
                  } : { background: 'transparent' }}
                >
                  <item.icon size={13} style={activeTab === item.id ? { color: item.color } : {}} />
                  <span className="font-black text-[9px] uppercase tracking-widest hidden lg:block">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side: Avatar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
              style={{ border: '1.5px solid rgba(255,255,255,0.2)' }}
              onClick={() => setActiveTab('settings')}>
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-white text-xs"
                  style={{ background: 'linear-gradient(135deg, #9B6BFF, #FF5FA0)' }}>
                  {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ FEATURE QUICK-ACCESS BAR ═══ */}
        <div style={isDarkMode
          ? { background: 'rgba(8,12,28,0.50)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }
          : { background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
          className="px-4 md:px-6 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max mx-auto justify-center">
            {featureButtons.map(fb => (
              <button key={fb.id}
                onClick={() => setActiveTab(fb.id as DashboardTab)}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 group"
                style={activeTab === fb.id ? {
                  background: isDarkMode ? `rgba(255,255,255,0.10)` : `${fb.color}15`,
                  border: `1.5px solid ${fb.color}60`,
                  boxShadow: `0 0 20px ${fb.glow}`,
                  backdropFilter: 'blur(12px)',
                } : {
                  background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: `1.5px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                }}>
                <fb.icon size={13} style={{ color: fb.color }} />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: activeTab === fb.id ? fb.color : isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>{fb.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="min-h-screen pt-[7.5rem] pb-24 relative z-10">

        {/* ── NEWS TICKER ── */}
        {news.length > 0 && (
          <div className="bg-white/40 dark:bg-obsidian-950/40 backdrop-blur-md h-10 flex items-center mb-6 mx-4 md:mx-12 rounded-2xl border border-white/20 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 bg-saffron-500 px-4 flex items-center gap-2 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping absolute" />
              <span className="w-1.5 h-1.5 rounded-full bg-white relative" />
              <span className="text-white text-[9px] font-black uppercase tracking-widest ml-3">Live</span>
            </div>
            <div className="w-full overflow-hidden flex items-center">
              <div className="animate-marquee whitespace-nowrap pl-24">
                {news.map((item, i) => <span key={i} className="mx-6 text-[11px] font-medium text-obsidian-700 dark:text-obsidian-200 italic">/ {item}</span>)}
              </div>
            </div>
          </div>
        )}

        <div className="px-4 md:px-12 max-w-[1600px] mx-auto">
          <div key={activeTab} className="animate-slide-up">

            {/* ══════════════════════════════════════════════
                OVERVIEW TAB — BENTO GRID
            ══════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* ── HERO GREETING ROW ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Hero Greeting card */}
                  <div className={`lg:col-span-2 relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 shadow-2xl group`}
                    style={isDarkMode ? {
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
                      border: '1.5px solid rgba(255,255,255,0.12)',
                      boxShadow: '0 8px 40px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.1) inset',
                      color: 'white',
                    } : {
                      background: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                      border: '1.5px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                      color: '#0F1117',
                    }}>
                    {/* Ambient blobs */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-saffron-500 rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 rounded-full blur-3xl" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{greetingEmoji}</span>
                        <span className="text-saffron-500 text-[10px] font-black uppercase tracking-[0.4em]">{greeting}</span>
                      </div>
                      <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
                        Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-500 to-orange-400">{user.name.split(' ')[0]}</span> 👋
                      </h1>
                      <p className={`text-sm font-medium mb-6 italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user.motto || 'Striving for balance every day.'}</p>

                      {/* Animated Quote */}
                      <div className={`transition-all duration-500 ${quoteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        <div className={`rounded-2xl p-4 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-slate-200'}`}>
                          <p className={`text-sm italic leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>"{QUOTES[quoteIdx].text}"</p>
                          <p className="text-[10px] text-saffron-500 font-black uppercase tracking-widest mt-2">— {QUOTES[quoteIdx].author}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6">
                        <button onClick={() => setIsVisionOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-lg glow-saffron">
                          <Camera size={14} /> Scan Food
                        </button>
                        <button onClick={() => setIsVoiceLogOpen(true)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 border ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/10' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'}`}>
                          <Mic size={14} /> Voice Log
                        </button>
                        <button onClick={fetchPlans} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 border ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/10' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'}`}>
                          <RefreshCw size={14} /> Refresh Plans
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Clock + Date card */}
                  <div className="glass-card h-full rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-saffron-500/5 to-orange-500/5" />
                    <div className="relative z-10">
                      <div className="text-4xl md:text-5xl font-black text-obsidian-950 dark:text-white tracking-tighter font-mono mb-1">
                        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                      <div className="text-[10px] font-black text-saffron-500 uppercase tracking-widest mb-4">
                        {currentTime.toLocaleTimeString('en-US', { second: '2-digit' }).split(':')[2]} sec
                      </div>
                      <div className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-6">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                        <br />
                        {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${streak > 0 ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Flame size={12} className={streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : ''} />
                        {streak} Day Streak 🔥
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── STATS RINGS ROW ── */}
                <div className="glass-card rounded-[2.5rem] p-8 border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><BarChart3 size={14} /> Today's Activity</h3>
                    <span className="text-[10px] font-black text-saffron-500 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
                    <RingProgress value={stats.caloriesBurned} max={500} color="#f97316" size={110} strokeWidth={9} label="Calories" sublabel="/ 500 kcal" icon={<Flame size={16} />} />
                    <RingProgress value={stats.waterIntake} max={8} color="#38bdf8" size={110} strokeWidth={9} label="Water" sublabel="/ 8 glasses" icon={<Droplets size={16} />} />
                    <RingProgress value={stats.workoutMinutes} max={60} color="#a78bfa" size={110} strokeWidth={9} label="Workout" sublabel="/ 60 min" icon={<Dumbbell size={16} />} />
                    <RingProgress value={Math.round(stats.sleepHours)} max={8} color="#34d399" size={110} strokeWidth={9} label="Sleep" sublabel="/ 8 hrs" icon={<BedDouble size={16} />} />
                  </div>
                </div>

                {/* ── HEALTH SNAPSHOT ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  {/* BMI Card */}
                  <div className="glass-card rounded-[2rem] p-6 border border-white/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ background: bmiColor }} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Activity size={10} /> BMI Index</p>
                    <div className="flex items-end gap-3 mb-2">
                      <span className="text-4xl font-black text-obsidian-950 dark:text-white">{bmi.toFixed(1)}</span>
                      <span className="text-sm font-black mb-1 pb-0.5" style={{ color: bmiColor }}>{bmiLabel}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((bmi / 40) * 100, 100)}%`, background: bmiColor }} />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">{user.weight}kg · {user.height}cm</p>
                  </div>

                  {/* Health Score */}
                  <div className="glass-card rounded-[2rem] p-6 border border-white/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-saffron-500/5 to-orange-500/5" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Star size={10} className="text-saffron-500" /> Health Score</p>
                    <div className="relative w-20 h-20 mb-2">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
                          strokeDasharray={213.6} strokeDashoffset={213.6 * (1 - stats.score / 100)}
                          strokeLinecap="round" className="transition-all duration-1000" />
                        <defs>
                          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#ea580c" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-black text-obsidian-950 dark:text-white">{stats.score}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Excellent</span>
                  </div>

                  {/* Water Quick Tracker */}
                  <div className="glass-card rounded-[2rem] p-6 border border-white/20">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1"><Droplets size={10} className="text-blue-500" /> Water Today</p>
                    <div className="flex items-center gap-3 mb-3">
                      <button onClick={() => setWaterGlasses(w => Math.max(0, w - 1))} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                        <Minus size={14} />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-black text-blue-500">{waterGlasses}</span>
                        <span className="text-slate-400 text-sm font-bold"> / 8</span>
                      </div>
                      <button onClick={() => setWaterGlasses(w => Math.min(8, w + 1))} className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-all">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} onClick={() => setWaterGlasses(i + 1)} className={`flex-1 h-2 rounded-full cursor-pointer transition-all ${i < waterGlasses ? 'bg-blue-400' : 'bg-slate-100 dark:bg-slate-800'}`} />
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2">{waterGlasses >= 8 ? '🎉 Goal reached!' : `${8 - waterGlasses} more to go`}</p>
                  </div>

                </div>

                {/* ── QUICK LOG ── */}
                <div className="glass-card rounded-[2.5rem] p-6 border border-white/20">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-4"><Plus size={11} /> Quick Log</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'workout', label: 'Workout', icon: Dumbbell, color: '#f97316' },
                      { id: 'meal', label: 'Meal', icon: Utensils, color: '#34d399' },
                      { id: 'sleep', label: 'Sleep', icon: BedDouble, color: '#818cf8' },
                      { id: 'water', label: 'Water', icon: Droplets, color: '#38bdf8' },
                    ].map(log => (
                      <button key={log.id}
                        onClick={() => { setLogType(log.id as any); setIsLogModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 hover:scale-105 transition-all"
                        style={{ background: `${log.color}15` }}>
                        <log.icon size={13} style={{ color: log.color }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: log.color }}>{log.label}</span>
                      </button>
                    ))}
                    <button onClick={() => setIsVoiceLogOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-violet-500/20 bg-violet-500/10 hover:scale-105 transition-all">
                      <Mic size={13} className="text-violet-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">Voice</span>
                    </button>
                    <button onClick={() => setIsVisionOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-saffron-500/20 bg-saffron-500/10 hover:scale-105 transition-all">
                      <Camera size={13} className="text-saffron-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-saffron-400">Scan Food</span>
                    </button>
                    <button onClick={() => setActiveTab('movement')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 hover:scale-105 transition-all">
                      <Activity size={13} className="text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Move</span>
                    </button>
                    <button onClick={() => setActiveTab('food')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 hover:scale-105 transition-all">
                      <Utensils size={13} className="text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Food Log</span>
                    </button>
                  </div>
                </div>

                {/* ── SEASON TIP ── */}
                <div className={`rounded-[2.5rem] p-7 bg-gradient-to-br ${season.color} text-white border border-white/5 relative overflow-hidden group`}>
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><season.icon size={80} /></div>
                  <div className="relative z-10 flex items-center justify-between gap-6">
                    <div>
                      <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1 flex items-center gap-1"><Sparkles size={10} /> Seasonal Tip · {season.label}</p>
                      <h4 className="text-lg font-black mb-1">{season.name}</h4>
                      <p className="text-sm text-white/80 leading-relaxed italic max-w-xl">{season.tip}</p>
                    </div>
                    <button onClick={() => setActiveTab('rituals')}
                      className="flex-shrink-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-saffron-300 hover:text-white transition-colors">
                      Habits <ArrowRight size={10} />
                    </button>
                  </div>
                </div>

                {/* ── TODAY'S PLANS ── */}
                {(dietPlan || workoutPlan || loading) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Diet Preview */}
                    <div className="glass-card rounded-[2.5rem] p-7 border border-white/20">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Apple size={12} /> Today's Meals</h3>
                        <button onClick={() => setActiveTab('diet')} className="text-[10px] font-black text-saffron-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Full plan <ArrowRight size={10} /></button>
                      </div>
                      {loading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-saffron-500" size={24} /></div>
                      ) : dietPlan ? (
                        <div className="space-y-1">
                          {['breakfast', 'lunch', 'snack', 'dinner'].map(m => (
                            <div key={m} onClick={() => setSelectedMeal({ meal: (dietPlan as any)[m], type: m })}
                              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 w-14">{m}</span>
                                <p className="text-xs font-black text-slate-800 dark:text-white group-hover:text-saffron-500 transition-colors line-clamp-1">{(dietPlan as any)[m].dishName}</p>
                              </div>
                              <span className="text-[9px] text-slate-400 flex items-center gap-0.5 flex-shrink-0"><Flame size={9} className="text-orange-400" />{(dietPlan as any)[m].calories}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* Workout Preview */}
                    <div className="glass-card rounded-[2.5rem] p-7 border border-white/20">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Dumbbell size={12} /> Today's Workout</h3>
                        <button onClick={() => setActiveTab('workout')} className="text-[10px] font-black text-saffron-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Full plan <ArrowRight size={10} /></button>
                      </div>
                      {loading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-saffron-500" size={24} /></div>
                      ) : workoutPlan ? (
                        <div className="space-y-1">
                          {workoutPlan.mainWorkout.slice(0, 5).map((ex: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-[8px] font-black text-indigo-600">{i + 1}</span>
                              </div>
                              <p className="text-xs font-black text-slate-800 dark:text-white flex-1 line-clamp-1">{ex.name}</p>
                              <span className="text-[9px] text-slate-400 flex-shrink-0">{ex.sets}×{ex.reps}</span>
                            </div>
                          ))}
                          {workoutPlan.mainWorkout.length > 5 && (
                            <p className="text-[9px] text-slate-400 text-center pt-1">+{workoutPlan.mainWorkout.length - 5} more</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Explore section is now in the top Feature Quick-Access Bar */}
              </div>
            )}

            {/* ── ALL ADDITIONAL TABS ── */}
            {activeTab === 'movement' && <MovementTracker elderMode={elderMode} onXpEarned={awardXp} />}
            {activeTab === 'food' && <FoodTracker elderMode={elderMode} onXpEarned={awardXp} onOpenMealVision={() => setIsVisionOpen(true)} />}
            {activeTab === 'rituals' && <RitualsView user={user} isDarkMode={isDarkMode} />}
            {activeTab === 'gym' && <GymLocatorView />}
            {activeTab === 'trainers' && <TrainerConnectView />}
            {activeTab === 'marketplace' && <FoodMarketplaceView />}
            {activeTab === 'roadmap' && <RoadmapView user={user} />}
            {activeTab === 'wearables' && <WearablesView />}
            {activeTab === 'chat' && <Chat user={user} />}
            {activeTab === 'workout' && (
              <div className="space-y-8 animate-slide-up">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 text-white"
                  style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.85),rgba(139,92,246,0.85))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 24px 60px rgba(99,102,241,0.3)' }}>
                  <div className="absolute inset-0 opacity-5"><Dumbbell className="absolute -right-6 -bottom-6" size={240} /></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60 mb-1 flex items-center gap-2"><Zap size={10} /> Today's Training</p>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Train Hard. Move Smart.</h2>
                      <p className="text-white/70 text-sm">AI plan loads below · Scroll for workout library + YouTube guides</p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      <button onClick={() => setIsWorkoutVisionOpen(true)}
                        className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                        <Camera size={14} /> Scan Form
                      </button>
                      <button onClick={fetchPlans}
                        className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                        <RefreshCw size={14} /> Generate AI Plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Plan */}
                {loading ? (
                  <div className="flex flex-col items-center py-16 gap-4">
                    <Loader2 className="animate-spin text-indigo-400" size={40} />
                    <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-[9px]">Generating your AI plan...</p>
                  </div>
                ) : workoutPlan ? (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Sparkles size={12} className="text-indigo-400" /> AI Plan · {workoutPlan.difficulty}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {['warmup', 'mainWorkout', 'cooldown'].map((section) => (
                        <div key={section} className="space-y-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">{section === 'mainWorkout' ? 'Main Workout' : section}</p>
                          {(workoutPlan as any)[section].map((ex: any, idx: number) => (
                            <div key={idx} className="glass-card p-5 rounded-[1.5rem] flex items-start gap-3 hover:border-indigo-500/30 transition-all">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-black text-sm text-slate-800 dark:text-white">{ex.name}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">{ex.sets} × {ex.reps || ex.duration}</p>
                              </div>
                              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' tutorial')}`} target="_blank" rel="noreferrer"
                                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-950/30 text-red-400 hover:text-red-500 hover:scale-110 transition-all">
                                <Play size={12} fill="currentColor" />
                              </a>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card rounded-[2rem] p-6 border border-indigo-500/20 text-center">
                    <p className="text-slate-400 text-sm">Tap <strong className="text-indigo-400">Generate AI Plan</strong> above for a personalised workout.</p>
                  </div>
                )}

                {/* Static Workout Library */}
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-4"><Play size={12} className="text-red-400" /> Workout Library + YouTube Guides</h3>
                  <div className="space-y-6">
                    {STATIC_WORKOUTS.map(cat => (
                      <div key={cat.category}>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2" style={{ color: cat.color }}>
                          {cat.icon} {cat.category}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {cat.exercises.map(ex => (
                            <div key={ex.name} className="glass-card p-4 rounded-[1.5rem] flex items-center gap-3 hover:scale-[1.02] transition-all"
                              style={{ borderColor: `${cat.color}22` }}>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-sm text-slate-800 dark:text-white truncate">{ex.name}</p>
                                <p className="text-[10px] text-slate-400">{ex.sets} × {ex.reps}</p>
                              </div>
                              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.yt)}`} target="_blank" rel="noreferrer"
                                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center hover:scale-110 transition-all"
                                style={{ background: `${cat.color}22`, color: cat.color }}>
                                <Play size={13} fill="currentColor" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'yoga' && <DhyanaView user={user} isDarkMode={isDarkMode} />}
            {activeTab === 'progress' && <ProgressView user={user} isDarkMode={isDarkMode} />}
            {activeTab === 'settings' && <SettingsView user={user} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} onReset={onReset} onUpdateProfile={onUpdateProfile} />}
          </div>
        </div>
      </main>

      {/* ── FLOATING SCAN FOOD BUTTON (bottom-centre) ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90]">
        <button onClick={() => setIsVisionOpen(true)}
          className="flex items-center gap-2.5 px-6 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
          style={{ background: 'rgba(249,115,22,0.18)', backdropFilter: 'blur(24px)', border: '1.5px solid rgba(249,115,22,0.45)', boxShadow: '0 0 32px rgba(249,115,22,0.25)' }}>
          <Camera size={18} className="text-orange-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Scan Food</span>
        </button>
      </div>

      {/* ── FLOATING AI COACH BUTTON (bottom-right) ── */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <button onClick={() => setActiveTab('chat')} title="AI Coach"
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg,#9B6BFF,#FF5FA0)', boxShadow: '0 0 36px rgba(155,107,255,0.5)' }}>
          <MessageCircle size={22} className="text-white" />
        </button>
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; animation: marquee 50s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* ── MODALS ── */}
      {isVisionOpen && (
        <MealVisionModal onClose={() => setIsVisionOpen(false)} onLogged={(res) => {
          saveMealLog({ date: new Date().toISOString().split('T')[0], mealType: 'Lunch', items: res.dishName, calories: res.calories });
          refreshDashboard(); setIsVisionOpen(false);
        }} />
      )}
      {isWorkoutVisionOpen && <WorkoutVisionModal onClose={() => setIsWorkoutVisionOpen(false)} />}
      {isVoiceLogOpen && <VoiceLogModal onClose={() => setIsVoiceLogOpen(false)} onLogged={refreshDashboard} />}
      {isLogModalOpen && <LogModal type={logType} onClose={() => setIsLogModalOpen(false)}
        onSaveWorkout={l => { saveWorkoutLog(l); checkAchievements(getWorkoutLogs(), getMealLogs()); refreshDashboard(); }}
        onSaveMeal={l => { saveMealLog(l); checkAchievements(getWorkoutLogs(), getMealLogs()); refreshDashboard(); }}
        onSaveSleep={l => { saveSleepLog(l); checkAchievements(getWorkoutLogs(), getMealLogs()); refreshDashboard(); }}
        onSaveWater={l => { saveWaterLog(l); checkAchievements(getWorkoutLogs(), getMealLogs()); refreshDashboard(); }} />}
      {selectedMeal && <RecipeModal meal={selectedMeal.meal} type={selectedMeal.type} onClose={() => setSelectedMeal(null)} />}
    </div>
  );
};

export default Dashboard;

