
import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile, WorkoutLog, MealLog, SleepLog, WaterLog, EarnedBadge } from '../types';
import { getWorkoutLogs, getMealLogs, getSleepLogs, getWaterLogs, getEarnedBadges, getDailyStats } from '../services/storageService';
import { generateProgressAnalysis } from '../services/geminiService';
import { ALL_BADGES } from '../constants';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Zap, 
  Loader2, 
  Flame, 
  Utensils, 
  Flag, 
  Dumbbell, 
  Flower2 as Lotus, 
  Moon, 
  CheckCircle, 
  Droplets, 
  BatteryCharging, 
  RefreshCcw, 
  Target,
  Sparkles
} from 'lucide-react';

interface ProgressViewProps {
  user: UserProfile;
  isDarkMode?: boolean;
}

const IconMap: Record<string, any> = {
  Flag,
  Zap,
  Lotus,
  Flame,
  Utensils,
  Dumbbell,
  Moon
};

const getLocalDateString = (d: Date) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const CircularProgress = ({ 
  percentage, 
  color, 
  gradient,
  icon: Icon, 
  label, 
  sublabel, 
  isDarkMode 
}: { 
  percentage: number; 
  color: string; 
  gradient: string;
  icon: any; 
  label: string; 
  sublabel: string;
  isDarkMode: boolean;
}) => {
  const radius = 95;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;
  const isComplete = percentage >= 100;

  return (
    <div className="flex flex-col items-center group">
      <div className="relative flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-full blur-[40px] opacity-0 group-hover:opacity-10 transition-all duration-1000"
          style={{ backgroundColor: color }}
        />
        
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 transition-transform duration-1000 group-hover:scale-105"
        >
          <defs>
             <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={gradient} />
             </linearGradient>
          </defs>
          <circle
            stroke={isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={`url(#grad-${label})`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`p-3 rounded-2xl mb-2 transition-all duration-1000 ${isComplete ? 'scale-110 text-saffron-500' : 'text-obsidian-300 dark:text-obsidian-700'}`}>
            <Icon size={28} strokeWidth={1.5} />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-4xl font-display font-black text-obsidian-950 dark:text-white tracking-tighter">
              {Math.round(percentage)}
            </span>
            <span className="text-[10px] font-black text-obsidian-400 dark:text-obsidian-600 uppercase tracking-widest">%</span>
          </div>
        </div>
      </div>
      <div className="mt-10 text-center space-y-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-obsidian-400 dark:text-obsidian-600">{label}</h4>
        <p className="text-sm font-bold text-obsidian-800 dark:text-obsidian-200 tracking-tight">{sublabel}</p>
      </div>
    </div>
  );
};

const ProgressView: React.FC<ProgressViewProps> = ({ user, isDarkMode = false }) => {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const loadData = () => {
    const wLogs = getWorkoutLogs();
    const mLogs = getMealLogs();
    const sLogs = getSleepLogs();
    const wtLogs = getWaterLogs();
    const badges = getEarnedBadges();
    
    setWorkoutLogs(wLogs);
    setMealLogs(mLogs);
    setSleepLogs(sLogs);
    setWaterLogs(wtLogs);
    setEarnedBadges(badges);

    if (wLogs.length > 0 || mLogs.length > 0 || sLogs.length > 0 || wtLogs.length > 0) {
      setLoadingAnalysis(true);
      generateProgressAnalysis(user, wLogs, mLogs, sLogs)
        .then(setAnalysis)
        .catch(console.error)
        .finally(() => setLoadingAnalysis(false));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const dailyProgress = useMemo(() => {
    const today = getLocalDateString(new Date());
    const dayWorkouts = workoutLogs.filter(l => l.date === today);
    const dayMeals = mealLogs.filter(l => l.date === today);
    const daySleep = sleepLogs.find(l => l.date === today);
    const dayWater = waterLogs.filter(l => l.date === today);

    const caloriesBurned = dayWorkouts.reduce((sum, log) => sum + (Number(log.caloriesBurned) || 0), 0);
    const caloriesConsumed = dayMeals.reduce((sum, log) => sum + (Number(log.calories) || 0), 0);
    const sleepHours = Number(daySleep?.durationHours) || 0;
    const waterAmount = dayWater.reduce((sum, log) => sum + (Number(log.amount) || 0), 0);

    const burnedGoal = 600; 
    const consumedGoal = 2200;
    const waterGoal = 10;
    const sleepGoal = 8;

    return {
      averageCompletion: Math.round(((caloriesBurned / burnedGoal) + (caloriesConsumed / consumedGoal) + (waterAmount / waterGoal) + (sleepHours / sleepGoal)) * 25),
      burned: { percentage: (caloriesBurned / burnedGoal) * 100, label: `${caloriesBurned} / ${burnedGoal} Kcal` },
      consumed: { percentage: (caloriesConsumed / consumedGoal) * 100, label: `${caloriesConsumed} / ${consumedGoal} Kcal` },
      water: { percentage: (waterAmount / waterGoal) * 100, label: `${waterAmount} / ${waterGoal} Units` },
      sleep: { percentage: (sleepHours / sleepGoal) * 100, label: `${sleepHours} / ${sleepGoal} Hours` }
    };
  }, [workoutLogs, mealLogs, sleepLogs, waterLogs]);

  // Fix: Convert labels to uppercase in the data array because textTransform is not valid in SVG tick styles.
  const weeklyTrendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stats = getDailyStats(dateStr);
      data.push({
        name: date.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
        score: stats.score,
        date: dateStr
      });
    }
    return data;
  }, [workoutLogs, mealLogs, sleepLogs, waterLogs]);

  return (
    <div className="space-y-16 animate-fadeIn pb-40">
      {/* AI Insights & Main Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 relative overflow-hidden bg-obsidian-950 rounded-[4rem] p-12 text-white shadow-3xl border border-white/5 group">
           <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-[2000ms]"><Lotus size={240} /></div>
           <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="p-8 bg-gradient-to-br from-saffron-500 to-orange-600 rounded-3xl shadow-2xl glow-saffron ring-8 ring-white/5">
                <BatteryCharging size={48} className="text-white" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-4">
                <h3 className="text-[10px] font-black text-saffron-400 uppercase tracking-[0.5em] flex items-center justify-center md:justify-start gap-4">
                  <Sparkles size={18} /> Neural Analysis
                </h3>
                {loadingAnalysis ? (
                  <div className="flex items-center gap-6 text-obsidian-500 font-bold italic text-2xl animate-pulse">
                    <Loader2 className="animate-spin" size={28} /> Synthesizing metrics...
                  </div>
                ) : (
                  <p className="text-2xl md:text-3xl font-display font-black italic text-obsidian-100 leading-tight">"{analysis || 'Your vital rhythms are reaching a point of deep coherence. The Ojas flows freely.'}"</p>
                )}
              </div>
           </div>
        </div>

        <div className="glass-card rounded-[4rem] p-12 flex flex-col items-center justify-center text-center">
            <h3 className="text-[10px] font-black text-obsidian-400 dark:text-obsidian-600 uppercase tracking-[0.4em] mb-12">Total Mastery</h3>
            <div className="relative mb-8">
               <span className="text-8xl font-display font-black text-obsidian-950 dark:text-white tracking-tighter">{dailyProgress.averageCompletion}</span>
               <span className="text-3xl font-black gradient-text absolute -top-2 -right-10">%</span>
            </div>
            <p className="text-[10px] font-black text-obsidian-400 dark:text-obsidian-600 uppercase tracking-widest">Protocol Fulfillment</p>
        </div>
      </div>

      {/* Weekly Vitality Chart Section */}
      <section className="glass-card p-12 md:p-16 rounded-[5rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-20">
          <div className="flex items-center gap-8">
            <div className="p-6 bg-obsidian-950 dark:bg-white rounded-[2.5rem] text-white dark:text-obsidian-950 shadow-2xl"><TrendingUp size={36} strokeWidth={2.5}/></div>
            <div>
              <h3 className="font-display font-black text-obsidian-950 dark:text-white text-4xl tracking-tight uppercase italic">Vitality History</h3>
              <p className="text-[10px] font-black text-obsidian-400 dark:text-obsidian-600 uppercase tracking-[0.3em] mt-2">Circadian Progress Mapping</p>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrendData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="4 4" 
                vertical={false} 
                stroke={isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 
              />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                // Fix: Removed invalid textTransform from tick object. Labels are already converted to uppercase in weeklyTrendData.
                tick={{ fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 11, fontWeight: 900 }} 
                dy={20}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 11, fontWeight: 900 }} 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? 'rgba(8, 10, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '32px',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                  backdropFilter: 'blur(30px)',
                  boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
                  padding: '20px 28px'
                }}
                itemStyle={{
                  color: '#f97316',
                  fontWeight: 900,
                  fontSize: '16px',
                  textTransform: 'uppercase'
                }}
                labelStyle={{
                  color: isDarkMode ? '#cbd5e1' : '#1e293b',
                  fontWeight: 800,
                  marginBottom: '6px',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase'
                }}
                cursor={{ stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '6 6' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#f97316" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Daily Progress Rings Section */}
      <section className="glass-card p-16 rounded-[5rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-24">
          <div className="flex items-center gap-8">
            <div className="p-6 bg-saffron-50 dark:bg-saffron-950/20 rounded-[2.5rem]"><Target size={36} className="text-saffron-500" strokeWidth={2.5}/></div>
            <div>
              <h3 className="font-display font-black text-obsidian-950 dark:text-white text-4xl tracking-tight uppercase italic">Vital Orbits</h3>
              <p className="text-[10px] font-black text-obsidian-400 dark:text-obsidian-600 uppercase tracking-[0.4em] mt-2">Holistic balance in High-Def</p>
            </div>
          </div>
          <button onClick={loadData} className="px-10 py-5 bg-obsidian-100 dark:bg-obsidian-900/50 hover:bg-saffron-500 hover:text-white rounded-3xl transition-all flex items-center gap-4 text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-saffron-400 shadow-sm">
             <RefreshCcw size={20} /> Sync Metrics
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-20 lg:gap-12">
          <CircularProgress percentage={dailyProgress.burned.percentage} color="#ef4444" gradient="#991b1b" icon={Flame} label="Metabolism" sublabel={dailyProgress.burned.label} isDarkMode={isDarkMode} />
          <CircularProgress percentage={dailyProgress.consumed.percentage} color="#f97316" gradient="#ea580c" icon={Utensils} label="Nourish" sublabel={dailyProgress.consumed.label} isDarkMode={isDarkMode} />
          <CircularProgress percentage={dailyProgress.water.percentage} color="#3b82f6" gradient="#1d4ed8" icon={Droplets} label="Hydrate" sublabel={dailyProgress.water.label} isDarkMode={isDarkMode} />
          <CircularProgress percentage={dailyProgress.sleep.percentage} color="#6366f1" gradient="#4338ca" icon={Moon} label="Rest" sublabel={dailyProgress.sleep.label} isDarkMode={isDarkMode} />
        </div>
      </section>

      {/* Badges Collection Section */}
      <div className="glass-card p-16 rounded-[5rem]">
         <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-24">
            <div className="flex items-center gap-8">
               <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2.5rem] text-emerald-600"><Award size={40} strokeWidth={2.5}/></div>
               <div>
                 <h3 className="font-display font-black text-obsidian-950 dark:text-white text-4xl tracking-tight uppercase italic">Aarogya Hall</h3>
                 <p className="text-[10px] font-black text-obsidian-400 dark:text-obsidian-600 uppercase tracking-[0.4em] mt-2">Evidence of your internal discipline</p>
               </div>
            </div>
            <div className="px-12 py-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-full text-[11px] font-black text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 uppercase tracking-[0.3em]">
               {earnedBadges.length} / {ALL_BADGES.length} Mastery Tokens
            </div>
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-16 md:gap-12">
            {ALL_BADGES.map(badge => {
              const earned = earnedBadges.find(b => b.id === badge.id);
              const Icon = IconMap[badge.icon] || Award;
              return (
                <div key={badge.id} className="flex flex-col items-center gap-8 group">
                  <div className={`w-28 h-28 rounded-[3rem] flex items-center justify-center transition-all duration-1000 relative ${
                    earned 
                      ? 'bg-gradient-to-br from-saffron-400 to-saffron-600 text-white shadow-2xl glow-saffron' 
                      : 'bg-obsidian-50 dark:bg-obsidian-900/40 text-obsidian-200 dark:text-obsidian-800 grayscale opacity-40'
                  }`}>
                    <Icon size={44} strokeWidth={1.5} />
                    {earned && (
                      <div className="absolute -top-3 -right-3 bg-white dark:bg-obsidian-950 rounded-full p-2.5 text-emerald-500 shadow-2xl border-4 border-emerald-50 dark:border-emerald-900 animate-slideUp">
                        <CheckCircle size={18} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase text-center max-w-[120px] leading-tight tracking-[0.1em] transition-colors ${
                    earned ? 'text-obsidian-800 dark:text-obsidian-100' : 'text-obsidian-300 dark:text-obsidian-800'
                  }`}>
                    {badge.name}
                  </span>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};

export default ProgressView;
