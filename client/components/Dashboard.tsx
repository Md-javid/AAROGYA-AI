
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
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import {
  Utensils, Dumbbell, MessageCircle, Sun, Moon, Droplets, Flame,
  TrendingUp, LayoutDashboard, Zap, Loader2, Flower2 as Lotus,
  Maximize2, Video, Settings as SettingsIcon, ShoppingCart, Mic,
  Wind, ThermometerSun, Sparkles, Camera, Clock, ArrowRight,
  Heart, Activity, Target, Award, Plus, Minus,
  Brain, Coffee, Apple, BedDouble, BarChart3, RefreshCw, Star,
  ChevronRight, Play, Bolt, MapPin, Users, Leaf
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

const Dashboard: React.FC<DashboardProps> = ({ user, onReset, isDarkMode, onToggleDarkMode, onUpdateProfile, elderMode = false, onToggleElderMode }) => {
  // XP / Gamification
  const [xp, setXp] = React.useState(() => parseInt(localStorage.getItem('aarogya_xp') || '0'));
  const [level, setLevel] = React.useState(() => Math.floor(xp / 500) + 1);
  const [showXpPop, setShowXpPop] = React.useState(false);
  const awardXp = (pts: number) => {
    const newXp = xp + pts;
    setXp(newXp); localStorage.setItem('aarogya_xp', String(newXp));
    setLevel(Math.floor(newXp / 500) + 1);
    setShowXpPop(true); setTimeout(() => setShowXpPop(false), 2000);
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
    { id: 'diet', label: 'Nutrition', icon: Leaf, color: '#10B981' },
    { id: 'yoga', label: 'Wellness', icon: Lotus, color: '#8B5CF6' },
    { id: 'chat', label: 'AI Coach', icon: MessageCircle, color: '#A855F7' },
    { id: 'progress', label: 'Progress', icon: TrendingUp, color: '#14B8A6' },
    { id: 'settings', label: 'Profile', icon: SettingsIcon, color: '#64748B' },
  ];


  return (
    <div className="min-h-screen bg-transparent transition-colors relative font-sans">

      {/* ── XP Pop Animation ── */}
      {showXpPop && (
        <div className="fixed top-20 right-6 z-[200] animate-xpPop pointer-events-none">
          <div className="xp-badge text-base font-black px-4 py-2">+XP 🎉</div>
        </div>
      )}

      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] w-full">
        <div style={isDarkMode
          ? { background: 'rgba(8,12,28,0.85)', backdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.10)' }
          : { background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 16px rgba(0,0,0,0.06)' }}
          className="px-4 md:px-6 py-3 flex items-center justify-between gap-3">

          <div className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0" onClick={() => setActiveTab('overview')}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              style={{ background: 'linear-gradient(135deg, #9B6BFF, #FF5FA0)' }}>
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
                    background: `linear-gradient(135deg, ${item.color}30, ${item.color}20)`,
                    border: `1px solid ${item.color}50`,
                    boxShadow: `0 0 16px ${item.color}30`,
                    color: item.color,
                  } : { background: 'transparent' }}
                >
                  <item.icon size={13} style={activeTab === item.id ? { color: item.color } : {}} />
                  <span className="font-black text-[9px] uppercase tracking-widest hidden lg:block">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right side: Controls + Avatar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Elder Mode toggle */}
            {onToggleElderMode && (
              <button onClick={onToggleElderMode} title="Elder Mode (Large Text)"
                className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold transition-all ${elderMode ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                style={elderMode ? { background: 'rgba(255,95,160,0.25)', border: '1px solid rgba(255,95,160,0.4)' } : {}}>
                ♿ <span className="hidden md:inline">Elder</span>
              </button>
            )}
            {/* Theme toggle */}
            <button onClick={onToggleDarkMode}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-black/10 ${isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl overflow-hidden cursor-pointer hover:scale-110 transition-transform flex-shrink-0 border border-white/20"
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
      </nav>

      <main className="min-h-screen pt-20 pb-24">

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
                  <div className={`lg:col-span-2 relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 shadow-2xl border group ${isDarkMode
                    ? 'bg-gradient-to-br from-obsidian-950 via-slate-900 to-indigo-950 text-white border-white/5'
                    : 'bg-gradient-to-br from-violet-50 via-white to-indigo-50 text-slate-900 border-slate-200/80'}`}>
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

                {/* ── EXPLORE ── */}
                <div className="glass-card rounded-[2.5rem] p-7 border border-white/20">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-4"><MapPin size={11} /> Explore</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'gym', label: 'Find Gyms', desc: 'Locate nearby gyms & studios', icon: MapPin, color: '#818cf8' },
                      { id: 'trainers', label: 'Trainers', desc: 'Book certified personal trainers', icon: Users, color: '#a78bfa' },
                      { id: 'marketplace', label: 'Healthy Market', desc: 'Order fresh meals from home chefs', icon: ShoppingCart, color: '#34d399' },
                    ].map(item => (
                      <button key={item.id} onClick={() => setActiveTab(item.id as any)}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 hover:border-white/20 hover:scale-[1.02] transition-all group text-left"
                        style={{ background: `${item.color}10` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}20` }}>
                          <item.icon size={16} style={{ color: item.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 dark:text-white">{item.label}</p>
                          <p className="text-[9px] text-slate-400 leading-tight mt-0.5 truncate">{item.desc}</p>
                        </div>
                        <ChevronRight size={13} className="text-slate-400 ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SECONDARY TABS (kept accessible) ── */}
            {activeTab === 'movement' && <MovementTracker elderMode={elderMode} onXpEarned={awardXp} />}
            {activeTab === 'food' && <FoodTracker elderMode={elderMode} onXpEarned={awardXp} onOpenMealVision={() => setIsVisionOpen(true)} />}
            {activeTab === 'rituals' && <RitualsView user={user} isDarkMode={isDarkMode} />}

            {/* ── PRIMARY TABS ── */}
            {activeTab === 'gym' && <GymLocatorView />}
            {activeTab === 'trainers' && <TrainerConnectView />}
            {activeTab === 'marketplace' && <FoodMarketplaceView />}
            {activeTab === 'roadmap' && <RoadmapView user={user} />}
            {activeTab === 'rituals' && <RitualsView user={user} isDarkMode={isDarkMode} />}
            {activeTab === 'movement' && <MovementTracker elderMode={elderMode} onXpEarned={awardXp} />}
            {activeTab === 'food' && <FoodTracker elderMode={elderMode} onXpEarned={awardXp} onOpenMealVision={() => setIsVisionOpen(true)} />}
            {activeTab === 'diet' && (
              <div className="space-y-8 animate-slide-up">
                <div className="bg-obsidian-950 dark:bg-white rounded-[3rem] p-10 md:p-12 text-white dark:text-obsidian-950 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><Utensils size={200} /></div>
                  <div className="text-center md:text-left space-y-3 relative z-10">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight italic">Your Nutrition Plan</h3>
                    <p className="text-obsidian-400 dark:text-obsidian-500 font-medium max-w-md">Balanced meals tailored to your body type, region, and health goals.</p>
                  </div>
                  <button onClick={() => setIsVisionOpen(true)} className="relative z-10 px-8 py-4 bg-saffron-500 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl glow-saffron group">
                    <Camera size={18} className="group-hover:rotate-12 transition-transform" /> Scan Food
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading ? (
                    <div className="col-span-2 flex flex-col items-center py-24 gap-6">
                      <Loader2 className="animate-spin text-saffron-500" size={48} />
                      <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px]">Building your nutrition plan...</p>
                    </div>
                  ) : dietPlan && ['breakfast', 'lunch', 'snack', 'dinner'].map((m, idx) => (
                    <div key={m} className="glass-card p-8 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-emerald-500/30" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className="space-y-2 flex-1">
                        <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{m}</span>
                        <h4 className="text-xl font-black text-obsidian-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{(dietPlan as any)[m].dishName}</h4>
                        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-1"><Flame size={10} className="text-orange-500" /> {(dietPlan as any)[m].calories} Kcal</span>
                          <span className="flex items-center gap-1"><Zap size={10} className="text-indigo-500" /> {(dietPlan as any)[m].protein || 'Balanced'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent((dietPlan as any)[m].dishName + ' recipe')}`} target="_blank" className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl text-slate-400 hover:text-red-500 transition-all hover:scale-110 border border-white/10"><Video size={20} /></a>
                        <button onClick={() => setSelectedMeal({ meal: (dietPlan as any)[m], type: m })} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl text-slate-400 hover:text-saffron-500 transition-all hover:scale-110 border border-white/10"><Maximize2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'workout' && (
              <div className="space-y-8 animate-slide-up">
                {loading ? (
                  <div className="flex flex-col items-center py-24 gap-6">
                    <Loader2 className="animate-spin text-saffron-500" size={48} />
                    <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px]">Building your workout plan...</p>
                  </div>
                ) : workoutPlan && (
                  <>
                    <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 rounded-[3rem] p-10 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl border border-white/5 relative overflow-hidden">
                      <div className="relative z-10 text-center md:text-left space-y-3">
                        <h3 className="text-3xl md:text-4xl font-black italic tracking-tight">Your Workout Plan</h3>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                          <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">Focus: {workoutPlan.yogaPose}</span>
                          <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">Level: {workoutPlan.difficulty}</span>
                        </div>
                      </div>
                      <button onClick={() => setIsWorkoutVisionOpen(true)} className="relative z-10 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl backdrop-blur-md group mt-6 md:mt-0 border border-white/10">
                        <Camera size={18} className="group-hover:rotate-12 transition-transform" /> Scan Form
                      </button>
                      <div className="absolute -left-10 -bottom-10 opacity-5"><Dumbbell size={300} /></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {['warmup', 'mainWorkout', 'cooldown'].map((section, sIdx) => (
                        <div key={section} className="space-y-4">
                          <div className="flex items-center gap-3 pl-2">
                            <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-700" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{section === 'mainWorkout' ? 'Main Workout' : section}</h4>
                          </div>
                          {(workoutPlan as any)[section].map((ex: any, idx: number) => (
                            <div key={idx} className="glass-card p-6 rounded-[2rem] group hover:border-indigo-500/30 transition-all">
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-black text-base text-obsidian-950 dark:text-white italic pr-3">{ex.name}</h5>
                                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise tutorial')}`} target="_blank" className="p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-slate-400 hover:text-red-500 transition-all hover:scale-110 border border-white/10 flex-shrink-0"><Video size={14} /></a>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic mb-4">"{ex.instruction}"</p>
                              <div className="inline-block px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase rounded-xl tracking-widest">{ex.sets} Sets · {ex.reps} Reps</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            {activeTab === 'yoga' && <DhyanaView user={user} isDarkMode={isDarkMode} />}
            {activeTab === 'chat' && <Chat user={user} />}
            {activeTab === 'progress' && <ProgressView user={user} isDarkMode={isDarkMode} />}
            {activeTab === 'settings' && <SettingsView user={user} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} onReset={onReset} onUpdateProfile={onUpdateProfile} />}
          </div>
        </div>
      </main>

      {/* ── FLOATING QUICK ACTION BAR ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90]">
        <div className="glass rounded-full shadow-2xl px-4 py-3 flex items-center gap-2 border border-white/20">
          {[
            { icon: Camera, label: 'Scan', action: () => setIsVisionOpen(true), color: 'text-saffron-500' },
            { icon: Mic, label: 'Voice', action: () => setIsVoiceLogOpen(true), color: 'text-violet-500' },
            { icon: Dumbbell, label: 'Workout', action: () => { setLogType('workout'); setIsLogModalOpen(true); }, color: 'text-orange-500' },
            { icon: Utensils, label: 'Meal', action: () => { setLogType('meal'); setIsLogModalOpen(true); }, color: 'text-emerald-500' },
            { icon: isDarkMode ? Sun : Moon, label: isDarkMode ? 'Light' : 'Dark', action: onToggleDarkMode, color: 'text-indigo-500' },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} title={btn.label}
              className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 transition-all hover:scale-110 active:scale-95 ${btn.color}`}>
              <btn.icon size={18} />
            </button>
          ))}
        </div>
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

