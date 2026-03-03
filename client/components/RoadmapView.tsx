
import React, { useState, useEffect } from 'react';
import {
    Trophy, Target, Zap, ChevronRight, ChevronDown, ChevronUp,
    Dumbbell, Utensils, BedDouble, Droplets, Star, Award,
    Play, CheckCircle, Lock, Loader2, AlertCircle, RefreshCw,
    Calendar, Flame, TrendingUp, Shield
} from 'lucide-react';
import { UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('accessToken');

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.message || err.error || 'Request failed');
    }
    return response.json();
};

// ─── Theme per week ───────────────────────────────────────────

const WEEK_THEMES = [
    { label: 'Foundation', color: '#38bdf8', glow: 'rgba(56,189,248,0.2)', icon: Shield, bg: 'from-sky-950 to-slate-950' },
    { label: 'Progressive Overload', color: '#a78bfa', glow: 'rgba(167,139,250,0.2)', icon: TrendingUp, bg: 'from-violet-950 to-slate-950' },
    { label: 'Optimization', color: '#f97316', glow: 'rgba(249,115,22,0.2)', icon: Zap, bg: 'from-orange-950 to-slate-950' },
    { label: 'Peak Conditioning', color: '#f43f5e', glow: 'rgba(244,63,94,0.2)', icon: Trophy, bg: 'from-rose-950 to-slate-950' },
];

const SESSION_TYPE_COLORS: Record<string, string> = {
    Strength: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Cardio: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    Yoga: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    HIIT: 'bg-red-500/20 text-red-400 border-red-500/30',
    Rest: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    'Active Recovery': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

// ─── Sub-components ───────────────────────────────────────────

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - score / 100);
    const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#f43f5e';

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    className="transition-all duration-1000" />
            </svg>
            <span className="absolute text-lg font-black text-white">{score}</span>
        </div>
    );
};

const StatRow: React.FC<{ icon: React.ReactNode; label: string; actual: string; target: string; met: boolean }> = ({
    icon, label, actual, target, met
}) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-2">
            <span className="text-slate-400">{icon}</span>
            <span className="text-xs text-slate-400 font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white">{actual}</span>
            <span className="text-xs text-slate-600">/ {target}</span>
            {met
                ? <CheckCircle size={12} className="text-emerald-400" />
                : <AlertCircle size={12} className="text-amber-400" />}
        </div>
    </div>
);

// ─── Week Card ────────────────────────────────────────────────

const WeekCard: React.FC<{
    week: any;
    index: number;
    isActive: boolean;
    isCompleted: boolean;
    isLocked: boolean;
    roadmapId: string;
    onCompleted: () => void;
}> = ({ week, index, isActive, isCompleted, isLocked, roadmapId, onCompleted }) => {
    const [expanded, setExpanded] = useState(isActive);
    const [completing, setCompleting] = useState(false);
    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    const theme = WEEK_THEMES[index];
    const Icon = theme.icon;

    const handleCompleteWeek = async () => {
        setCompleting(true);
        try {
            await apiCall(`/roadmap/${roadmapId}/week/${week.weekNumber}/complete`, { method: 'POST' });
            onCompleted();
        } catch (e: any) {
            alert(`Could not complete week: ${e.message}`);
        } finally {
            setCompleting(false);
        }
    };

    const workoutDays = week.workoutSchedule?.filter((d: any) => d.type !== 'Rest') ?? [];
    const restDays = week.workoutSchedule?.filter((d: any) => d.type === 'Rest' || d.type === 'Active Recovery') ?? [];

    return (
        <div
            className={`rounded-[2.5rem] border transition-all overflow-hidden ${isLocked ? 'border-white/5 opacity-50' :
                    isCompleted ? 'border-emerald-500/30' :
                        isActive ? 'border-white/20' : 'border-white/10'
                }`}
            style={isActive ? { boxShadow: `0 0 40px ${theme.glow}` } : {}}
        >
            {/* ── Header ── */}
            <div
                className={`bg-gradient-to-r ${theme.bg} p-6 cursor-pointer`}
                onClick={() => !isLocked && setExpanded(e => !e)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${theme.color}20`, border: `1px solid ${theme.color}40` }}>
                            {isLocked
                                ? <Lock size={20} style={{ color: theme.color }} />
                                : isCompleted
                                    ? <CheckCircle size={20} className="text-emerald-400" />
                                    : <Icon size={20} style={{ color: theme.color }} />}
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: theme.color }}>
                                Week {week.weekNumber}
                            </p>
                            <h3 className="text-lg font-black text-white">{week.theme}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{week.startDate} → {week.endDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isCompleted && week.performance && (
                            <ScoreRing score={week.performance.score} size={60} />
                        )}
                        {isActive && (
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                                style={{ color: theme.color, borderColor: `${theme.color}50`, background: `${theme.color}15` }}>
                                Active
                            </span>
                        )}
                        {!isLocked && (expanded
                            ? <ChevronUp size={18} className="text-slate-400" />
                            : <ChevronRight size={18} className="text-slate-400" />)}
                    </div>
                </div>

                {/* Quick stats strip */}
                <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Dumbbell size={11} style={{ color: theme.color }} />
                        {week.weeklyTargets?.minWorkoutDays} workout days
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Flame size={11} className="text-orange-400" />
                        {week.weeklyTargets?.calorieTarget} kcal/day
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <BedDouble size={11} className="text-violet-400" />
                        {week.weeklyTargets?.targetSleepHours}h sleep
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Droplets size={11} className="text-sky-400" />
                        {week.weeklyTargets?.waterTargetLiters}L water
                    </div>
                </div>
            </div>

            {/* ── Expanded Body ── */}
            {expanded && !isLocked && (
                <div className="bg-slate-950/80 divide-y divide-white/5">

                    {/* Philosophy */}
                    <div className="p-6">
                        <p className="text-sm text-slate-300 italic leading-relaxed">"{week.philosophy}"</p>
                    </div>

                    {/* Weekly Challenge */}
                    <div className="p-6">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: theme.color }}>
                            🎯 This Week's Challenge
                        </p>
                        <p className="text-sm font-bold text-white">{week.weeklyChallenge}</p>
                    </div>

                    {/* Workout Schedule */}
                    <div className="p-6 space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Dumbbell size={11} /> Workout Schedule ({workoutDays.length} training days)
                        </p>
                        {week.workoutSchedule?.map((day: any, di: number) => (
                            <div key={di} className="rounded-2xl border border-white/5 overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-400 w-20 text-left">{day.day}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${SESSION_TYPE_COLORS[day.type] || SESSION_TYPE_COLORS.Rest}`}>
                                            {day.type}
                                        </span>
                                        <span className="text-xs text-slate-300 font-medium">{day.sessionName}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {day.durationMinutes > 0 && (
                                            <span className="text-[9px] text-slate-500">{day.durationMinutes}min</span>
                                        )}
                                        {day.exercises?.length > 0
                                            ? (expandedDay === day.day ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />)
                                            : null}
                                    </div>
                                </button>

                                {expandedDay === day.day && day.exercises?.length > 0 && (
                                    <div className="border-t border-white/5 px-4 pb-4 pt-3 space-y-3">
                                        {day.exercises.map((ex: any, ei: number) => (
                                            <div key={ei} className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                                    style={{ background: `${theme.color}20` }}>
                                                    <span className="text-[9px] font-black" style={{ color: theme.color }}>{ei + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-white">{ex.name}
                                                        {ex.sets && <span className="ml-2 text-slate-500 font-normal">{ex.sets}×{ex.reps} · rest {ex.rest}</span>}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{ex.instruction}</p>
                                                    {ex.coachNote && (
                                                        <p className="text-[10px] mt-1 italic" style={{ color: theme.color }}>💬 {ex.coachNote}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {expandedDay === day.day && day.restActivity && (
                                    <div className="border-t border-white/5 px-4 pb-4 pt-3">
                                        <p className="text-xs text-emerald-400">🧘 {day.restActivity}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Diet Guidelines */}
                    <div className="p-6">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                            <Utensils size={11} /> Diet Strategy
                        </p>
                        <div className="space-y-3">
                            <p className="text-sm text-slate-300 leading-relaxed">{week.dietGuidelines?.strategy}</p>
                            <div className="flex flex-wrap gap-2">
                                {week.dietGuidelines?.focusFoods?.map((f: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-lg border border-emerald-500/20">
                                        ✓ {f}
                                    </span>
                                ))}
                                {week.dietGuidelines?.avoidFoods?.map((f: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 text-[9px] font-black rounded-lg border border-red-500/20">
                                        ✗ {f}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 italic">💧 {week.dietGuidelines?.hydrationTip}</p>
                            <p className="text-xs text-slate-400">⏰ {week.dietGuidelines?.mealTiming}</p>
                            <p className="text-xs text-slate-300 font-medium">Sample day: {week.dietGuidelines?.sampleMeal}</p>
                        </div>
                    </div>

                    {/* Completed Week — Performance Review */}
                    {isCompleted && week.performance && (
                        <div className="p-6 space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                <Trophy size={11} /> Week Complete — Performance Review
                            </p>
                            <div className="flex items-center gap-6">
                                <ScoreRing score={week.performance.score} size={80} />
                                <div className="flex-1 space-y-1">
                                    <StatRow icon={<Dumbbell size={11} />} label="Workout Days"
                                        actual={`${week.performance.completedWorkoutDays} days`}
                                        target={`${week.weeklyTargets?.minWorkoutDays} days`}
                                        met={week.performance.completedWorkoutDays >= week.weeklyTargets?.minWorkoutDays} />
                                    <StatRow icon={<BedDouble size={11} />} label="Avg Sleep"
                                        actual={`${week.performance.avgSleepHours}h`}
                                        target={`${week.weeklyTargets?.targetSleepHours}h`}
                                        met={week.performance.avgSleepHours >= week.weeklyTargets?.targetSleepHours} />
                                    <StatRow icon={<Droplets size={11} />} label="Avg Water"
                                        actual={`${week.performance.avgWaterLiters}L`}
                                        target={`${week.weeklyTargets?.waterTargetLiters}L`}
                                        met={week.performance.avgWaterLiters >= week.weeklyTargets?.waterTargetLiters} />
                                    <StatRow icon={<Flame size={11} />} label="Avg Calories"
                                        actual={`${week.performance.avgDailyCalories} kcal`}
                                        target={`${week.weeklyTargets?.calorieTarget} kcal`}
                                        met={Math.abs(week.performance.avgDailyCalories - week.weeklyTargets?.calorieTarget) < 300} />
                                </div>
                            </div>
                            {week.performance.aiFeedback && (
                                <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/20">
                                    <p className="text-xs text-slate-300 leading-relaxed italic">
                                        🤖 {week.performance.aiFeedback}
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {week.performance.badgesEarned?.map((b: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black rounded-full">
                                        {b}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Complete Week CTA */}
                    {isActive && !isCompleted && (
                        <div className="p-6">
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3 font-black">
                                ✓ Success criteria: {week.successCriteria}
                            </p>
                            <button
                                onClick={handleCompleteWeek}
                                disabled={completing}
                                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-100"
                                style={{ background: `linear-gradient(135deg, ${theme.color}cc, ${theme.color}88)`, boxShadow: `0 8px 32px ${theme.glow}` }}
                            >
                                {completing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                {completing ? 'Analyzing your week...' : 'Mark Week as Complete'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────

interface RoadmapViewProps {
    user: UserProfile;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ user }) => {
    const [roadmap, setRoadmap] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoadmap = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiCall('/roadmap/active');
            setRoadmap(data.roadmap);
        } catch (e: any) {
            if (e.message?.includes('404') || e.message?.includes('No active')) {
                setRoadmap(null);
            } else {
                setError(e.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        try {
            const data = await apiCall('/roadmap/generate', { method: 'POST' });
            setRoadmap(data.roadmap);
        } catch (e: any) {
            setError(e.message || 'Failed to generate roadmap');
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => { fetchRoadmap(); }, []);

    const totalXp = roadmap?.xpEarned ?? 0;
    const totalScore = roadmap?.totalScore ?? 0;
    const completedWeeks = roadmap?.weeks?.filter((w: any) => !!w.performance?.completedAt).length ?? 0;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="relative">
                <Loader2 size={48} className="animate-spin text-violet-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy size={16} className="text-violet-500/50" />
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Loading your roadmap...
            </p>
        </div>
    );

    // ── No roadmap yet ────────────────────────────────────────────
    if (!roadmap) return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="relative overflow-hidden rounded-[3rem] p-12 text-white text-center border border-white/10"
                style={{ background: 'linear-gradient(135deg, #3730a3, #1e1b4b, #0f172a)' }}>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/2 w-64 h-64 bg-violet-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-rose-500 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto">
                        <Trophy size={36} className="text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight mb-2">4-Week Transformation</h2>
                        <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
                            Generate a personalised roadmap built on your fitness level, goals, and wellness personality.
                            Each week progressively builds on the last.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {WEEK_THEMES.map((t, i) => {
                            const Icon = t.icon;
                            return (
                                <div key={i} className="p-3 rounded-2xl border border-white/10 bg-white/5">
                                    <Icon size={18} style={{ color: t.color }} className="mb-1" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Week {i + 1}</p>
                                    <p className="text-xs font-black text-white">{t.label}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-2xl font-black text-white">28</p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Days</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-2xl font-black text-amber-400">1250+</p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">XP to earn</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-2xl font-black text-emerald-400">9</p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Badges</p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}
                    >
                        {generating ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                        {generating ? 'AI is building your roadmap...' : 'Generate My 4-Week Roadmap'}
                    </button>
                    <p className="text-[10px] text-slate-600">Takes 15–25 seconds · Powered by Gemini AI</p>
                </div>
            </div>
        </div>
    );

    // ── Active / Completed Roadmap ────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div className="glass-card rounded-[3rem] p-8 border border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-violet-400 mb-1">
                            {roadmap.status === 'completed' ? '✅ Completed' : '🔥 In Progress'}
                        </p>
                        <h2 className="text-2xl font-black text-white">{roadmap.title}</h2>
                        <p className="text-sm text-slate-400 mt-1 max-w-md leading-relaxed">{roadmap.overview}</p>
                    </div>
                    <div className="flex gap-4 flex-shrink-0">
                        <div className="text-center">
                            <p className="text-2xl font-black text-amber-400">{totalXp}</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">XP</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-black text-emerald-400">{completedWeeks}/4</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Weeks</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-black text-violet-400">{totalScore}</p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Score</p>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="relative mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(completedWeeks / 4) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #f43f5e)' }} />
                </div>
                <p className="text-[9px] text-slate-500 mt-2 font-black uppercase tracking-widest">
                    Week {roadmap.currentWeek} of 4 · {completedWeeks * 7} / 28 days complete
                </p>

                {/* Badges */}
                {roadmap.badgesEarned?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {roadmap.badgesEarned.map((b: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black rounded-full flex items-center gap-1">
                                <Award size={9} /> {b}
                            </span>
                        ))}
                    </div>
                )}

                <button onClick={() => { setRoadmap(null); handleGenerate(); }}
                    className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-violet-400 uppercase tracking-widest transition-colors">
                    <RefreshCw size={11} /> Start New Roadmap
                </button>
            </div>

            {/* Week Cards */}
            {roadmap.weeks?.map((week: any, idx: number) => {
                const isCompleted = !!week.performance?.completedAt;
                const isActive = week.weekNumber === roadmap.currentWeek && !isCompleted;
                const isLocked = week.weekNumber > roadmap.currentWeek;
                return (
                    <WeekCard
                        key={week.weekNumber}
                        week={week}
                        index={idx}
                        isActive={isActive}
                        isCompleted={isCompleted}
                        isLocked={isLocked}
                        roadmapId={roadmap._id}
                        onCompleted={fetchRoadmap}
                    />
                );
            })}
        </div>
    );
};

export default RoadmapView;
