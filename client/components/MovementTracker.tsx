/**
 * MovementTracker.tsx
 * Real-time workout recording & movement analysis
 * iOS 19 Liquid Glass + Duolingo-style gamification
 */
import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Plus, Flame, Clock, Zap, Award, ChevronRight, BarChart3, Activity, RefreshCw, CheckCircle, Timer } from 'lucide-react';

interface MovementSession {
  id: string;
  exerciseName: string;
  sets: SetRecord[];
  startTime: number;
  endTime?: number;
  totalCalories: number;
  xpEarned: number;
}

interface SetRecord {
  setNumber: number;
  reps: number;
  weight: number;
  durationSec?: number;
  completedAt: number;
}

interface MovementTrackerProps {
  elderMode?: boolean;
  onXpEarned?: (xp: number) => void;
}

/* ── MET values for calorie estimates ── */
const EXERCISE_MET: Record<string, number> = {
  'Push-ups': 3.8, 'Pull-ups': 8.0, 'Squats': 5.0, 'Deadlifts': 6.0,
  'Bench Press': 6.0, 'Running': 9.8, 'Walking': 3.5, 'Cycling': 7.5,
  'Plank': 3.5, 'Burpees': 10.0, 'Jumping Jacks': 8.0, 'Lunges': 4.5,
  'Shoulder Press': 5.5, 'Bicep Curls': 3.0, 'Tricep Dips': 3.5,
  'Mountain Climbers': 8.0, 'Jump Rope': 12.0, 'Swimming': 7.0,
  'Yoga Flow': 3.0, 'Pilates': 3.0, 'HIIT Circuit': 10.5,
};

const PRESET_EXERCISES = Object.keys(EXERCISE_MET);

const ACHIEVEMENT_MILESTONES = [
  { sessions: 1,  badge: '🌱', title: 'First Steps', xp: 50  },
  { sessions: 5,  badge: '⚡', title: 'Momentum',   xp: 100 },
  { sessions: 10, badge: '🔥', title: 'On Fire',    xp: 200 },
  { sessions: 25, badge: '💎', title: 'Diamond',    xp: 500 },
];

/* ── Stopwatch hook ── */
const useStopwatch = (running: boolean) => {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);
  const savedRef = useRef<number>(0);
  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - savedRef.current;
      const id = setInterval(() => setElapsed(Date.now() - startRef.current), 1000);
      return () => clearInterval(id);
    } else {
      savedRef.current = elapsed;
    }
  }, [running]);
  const reset = () => { setElapsed(0); savedRef.current = 0; };
  return { elapsed, reset };
};

const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return h > 0
    ? `${h}:${String(m % 60).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
};

/* ── Main Component ── */
const MovementTracker: React.FC<MovementTrackerProps> = ({ elderMode = false, onXpEarned }) => {
  const [sessions, setSessions]         = useState<MovementSession[]>(() => {
    try { return JSON.parse(localStorage.getItem('aarogya_movement') || '[]'); } catch { return []; }
  });
  const [active, setActive]             = useState<MovementSession | null>(null);
  const [isRunning, setIsRunning]       = useState(false);
  const [selectedEx, setSelectedEx]     = useState('Push-ups');
  const [customEx, setCustomEx]         = useState('');
  const [reps, setReps]                 = useState(10);
  const [weight, setWeight]             = useState(0);
  const [restTimer, setRestTimer]       = useState<number | null>(null);
  const [newBadge, setNewBadge]         = useState<typeof ACHIEVEMENT_MILESTONES[0] | null>(null);
  const [userWeight]                    = useState(70); // kg, should come from profile

  const { elapsed, reset: resetTimer } = useStopwatch(isRunning);

  const exerciseName = customEx.trim() || selectedEx;
  const met   = EXERCISE_MET[exerciseName] || 5.0;

  /* ── Start session ── */
  const startSession = () => {
    const session: MovementSession = {
      id: Date.now().toString(),
      exerciseName,
      sets: [],
      startTime: Date.now(),
      totalCalories: 0,
      xpEarned: 0,
    };
    setActive(session);
    setIsRunning(true);
    resetTimer();
  };

  /* ── Log a set ── */
  const logSet = () => {
    if (!active) return;
    const set: SetRecord = {
      setNumber: active.sets.length + 1,
      reps,
      weight,
      completedAt: Date.now(),
    };
    const updated = { ...active, sets: [...active.sets, set] };
    setActive(updated);
    // Start 90s rest timer
    setRestTimer(90);
    const restIv = setInterval(() => {
      setRestTimer(t => {
        if (t === null || t <= 1) { clearInterval(restIv); return null; }
        return t - 1;
      });
    }, 1000);
  };

  /* ── Finish session ── */
  const finishSession = () => {
    if (!active) return;
    setIsRunning(false);
    const durationMin = elapsed / 60000;
    const calories    = Math.round((met * userWeight * durationMin) / 60 * 1.05);
    const xp          = Math.round(calories / 3 + active.sets.length * 10);
    const finished: MovementSession = {
      ...active,
      endTime: Date.now(),
      totalCalories: calories,
      xpEarned: xp,
    };
    const newSessions = [finished, ...sessions];
    setSessions(newSessions);
    localStorage.setItem('aarogya_movement', JSON.stringify(newSessions));
    setActive(null);
    resetTimer();

    // Award XP
    if (onXpEarned) onXpEarned(xp);

    // Check achievements
    const milestone = ACHIEVEMENT_MILESTONES.find(m => m.sessions === newSessions.length);
    if (milestone) setNewBadge(milestone);
  };

  /* ── Stats ── */
  const totalCalToday = sessions.filter(s => {
    const d = new Date(s.startTime);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  }).reduce((a, s) => a + s.totalCalories, 0);

  const totalXp        = sessions.reduce((a, s) => a + s.xpEarned, 0);
  const totalSessions  = sessions.length;

  const textBase  = elderMode ? 'text-base' : 'text-sm';
  const textLg    = elderMode ? 'text-xl' : 'text-lg';
  const textXl    = elderMode ? 'text-3xl' : 'text-2xl';
  const padBtn    = elderMode ? 'py-4 px-6' : 'py-3 px-5';

  return (
    <div className="space-y-6 pb-24">
      {/* ── Achievement pop ── */}
      {newBadge && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none">
          <div className="text-center animate-xpPop glass-card p-8 rounded-3xl pointer-events-auto"
            style={{ background: 'rgba(20,10,40,0.9)', border: '2px solid rgba(155,107,255,0.5)', boxShadow: '0 0 60px rgba(155,107,255,0.4)' }}>
            <div className="text-6xl mb-3">{newBadge.badge}</div>
            <div className={`font-black text-white ${textXl} mb-1`}>{newBadge.title}</div>
            <div className={`text-white/60 ${textBase} mb-4`}>Achievement Unlocked!</div>
            <div className="xp-badge text-lg px-4 py-2 mb-4">+{newBadge.xp} XP</div>
            <button onClick={() => setNewBadge(null)} className="btn-primary px-6 py-2 text-sm">
              Awesome! 🎉
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="glass-card p-6 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(34,229,181,0.15), rgba(79,142,247,0.10))' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className={`font-black text-white ${elderMode ? 'text-3xl' : 'text-2xl'}`}>💪 Movement Tracker</h2>
            <p className={`text-white/50 mt-1 ${textBase}`}>Record sets, reps & track calories burned</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center glass-pill px-4 py-2">
              <div className={`font-black text-white ${textLg}`}>{totalSessions}</div>
              <div className="text-white/40 text-xs">Sessions</div>
            </div>
            <div className="text-center glass-pill px-4 py-2">
              <div className={`font-black text-white ${textLg}`}>{totalCalToday}</div>
              <div className="text-white/40 text-xs">Cal Today</div>
            </div>
            <div className="text-center glass-pill px-4 py-2">
              <div className="font-black text-white text-lg">⚡{totalXp}</div>
              <div className="text-white/40 text-xs">XP Earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Session ── */}
      {active ? (
        <div className="glass-card p-6 rounded-3xl" style={{ border: '1.5px solid rgba(34,229,181,0.4)', boxShadow: '0 0 30px rgba(34,229,181,0.15)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className={`font-black text-white ${textXl}`}>{active.exerciseName}</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-green-400 font-bold text-sm">
                  <Activity size={14} className="animate-pulse" /> Live
                </div>
                <div className="font-mono text-white/80 font-bold">{fmtTime(elapsed)}</div>
              </div>
            </div>
            <div className="text-center">
              <div className={`font-black ${textXl}`} style={{ color: '#22E5B5' }}>{active.sets.length}</div>
              <div className="text-white/40 text-xs">Sets done</div>
            </div>
          </div>

          {/* Rest timer */}
          {restTimer !== null && (
            <div className="mb-4 glass-pill p-3 flex items-center gap-3">
              <Timer size={16} style={{ color: '#FFB547' }} />
              <div className="flex-1">
                <div className="xp-bar">
                  <div style={{ width: `${(restTimer / 90) * 100}%`, background: 'linear-gradient(90deg, #FFB547, #FF6B6B)', borderRadius: 999, height: '100%', transition: 'width 1s linear' }} />
                </div>
              </div>
              <span className="font-mono font-bold text-sm" style={{ color: '#FFB547' }}>{restTimer}s rest</span>
            </div>
          )}

          {/* Log set form */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={`block text-white/60 font-bold mb-1 ${textBase}`}>Reps</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setReps(r => Math.max(1, r - 1))}
                  className="btn-glass w-10 h-10 rounded-xl text-xl font-black flex items-center justify-center">−</button>
                <span className={`flex-1 text-center font-black text-white ${elderMode ? 'text-2xl' : 'text-xl'}`}>{reps}</span>
                <button onClick={() => setReps(r => r + 1)}
                  className="btn-glass w-10 h-10 rounded-xl text-xl font-black flex items-center justify-center">+</button>
              </div>
            </div>
            <div>
              <label className={`block text-white/60 font-bold mb-1 ${textBase}`}>Weight (kg)</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setWeight(w => Math.max(0, w - 2.5))}
                  className="btn-glass w-10 h-10 rounded-xl text-xl font-black flex items-center justify-center">−</button>
                <span className={`flex-1 text-center font-black text-white ${elderMode ? 'text-2xl' : 'text-xl'}`}>{weight}</span>
                <button onClick={() => setWeight(w => w + 2.5)}
                  className="btn-glass w-10 h-10 rounded-xl text-xl font-black flex items-center justify-center">+</button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={logSet}
              className={`btn-primary btn-ripple flex-1 flex items-center justify-center gap-2 ${padBtn}`}
              style={{ background: 'linear-gradient(135deg, #22E5B5, #4F8EF7)' }}>
              <Plus size={18} /> Log Set {active.sets.length + 1}
            </button>
            <button onClick={finishSession}
              className={`btn-glass flex items-center justify-center gap-2 px-5 ${padBtn}`}
              style={{ border: '1.5px solid rgba(255,59,48,0.4)', color: '#FF8080' }}>
              <Square size={18} /> Finish
            </button>
          </div>

          {/* Set history */}
          {active.sets.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className={`text-white/40 font-bold ${textBase}`}>Set History</div>
              {active.sets.slice().reverse().map((s, i) => (
                <div key={i} className="flex items-center justify-between glass-pill px-4 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: '#22E5B5' }} />
                    <span className={`text-white/80 font-bold ${textBase}`}>Set {s.setNumber}</span>
                  </div>
                  <span className={`font-mono text-white/60 ${textBase}`}>{s.reps} reps × {s.weight}kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── New session setup ── */
        <div className="glass-card p-6 rounded-3xl">
          <h3 className={`font-black text-white mb-4 ${textLg}`}>Start New Session</h3>
          <div className="space-y-4">
            {/* Exercise presets */}
            <div>
              <label className={`block text-white/60 font-bold mb-2 ${textBase}`}>Choose Exercise</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_EXERCISES.slice(0, elderMode ? 8 : 12).map(ex => (
                  <button key={ex} onClick={() => { setSelectedEx(ex); setCustomEx(''); }}
                    className={`glass-pill px-3 py-1.5 text-xs font-bold transition-all ${selectedEx === ex && !customEx ? 'glass-pill-active' : ''}`}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom exercise */}
            <div>
              <label className={`block text-white/60 font-bold mb-2 ${textBase}`}>Or type custom</label>
              <input value={customEx} onChange={e => setCustomEx(e.target.value)}
                className={`glass-input w-full ${elderMode ? 'py-4 text-lg' : 'py-3'} px-4`}
                placeholder="e.g. Cable Flyes, Farmer's Walk..." />
            </div>

            {/* Initial reps */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-white/60 font-bold mb-1 ${textBase}`}>Starting Reps</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setReps(r => Math.max(1, r-1))} className="btn-glass w-10 h-10 rounded-xl font-black flex items-center justify-center">−</button>
                  <span className={`flex-1 text-center font-black text-white ${elderMode ? 'text-2xl' : 'text-xl'}`}>{reps}</span>
                  <button onClick={() => setReps(r => r+1)} className="btn-glass w-10 h-10 rounded-xl font-black flex items-center justify-center">+</button>
                </div>
              </div>
              <div>
                <label className={`block text-white/60 font-bold mb-1 ${textBase}`}>Weight (kg)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWeight(w => Math.max(0, w-2.5))} className="btn-glass w-10 h-10 rounded-xl font-black flex items-center justify-center">−</button>
                  <span className={`flex-1 text-center font-black text-white ${elderMode ? 'text-2xl' : 'text-xl'}`}>{weight}</span>
                  <button onClick={() => setWeight(w => w+2.5)} className="btn-glass w-10 h-10 rounded-xl font-black flex items-center justify-center">+</button>
                </div>
              </div>
            </div>

            <button onClick={startSession}
              className={`btn-primary btn-ripple w-full flex items-center justify-center gap-2 font-black ${padBtn}`}
              style={{ background: 'linear-gradient(135deg, #22E5B5, #4F8EF7)', fontSize: elderMode ? '1.1rem' : '1rem' }}>
              <Play size={20} fill="currentColor" />
              Start {exerciseName} Session
            </button>
          </div>
        </div>
      )}

      {/* ── Weekly movement chart ── */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-black text-white ${textLg}`}>📊 This Week</h3>
          <BarChart3 size={18} className="text-white/40" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const dayStr = d.toDateString();
            const daySessions = sessions.filter(s => new Date(s.startTime).toDateString() === dayStr);
            const maxCal = 500;
            const cal = daySessions.reduce((a, s) => a + s.totalCalories, 0);
            const pct = Math.min((cal / maxCal) * 100, 100);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full rounded-lg overflow-hidden" style={{ height: 60, background: 'rgba(255,255,255,0.06)' }}>
                  <div className="w-full rounded-lg mt-auto transition-all duration-700"
                    style={{
                      height: `${pct}%`, marginTop: `${100 - pct}%`,
                      background: pct > 0 ? 'linear-gradient(0deg, #22E5B5, #4F8EF7)' : 'transparent',
                      boxShadow: pct > 0 ? '0 0 10px rgba(34,229,181,0.3)' : 'none'
                    }} />
                </div>
                <span className="text-white/30 text-[10px] font-bold">
                  {d.toLocaleDateString('en', { weekday: 'short' }).slice(0,1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent sessions ── */}
      {sessions.length > 0 && (
        <div className="glass-card p-6 rounded-3xl">
          <h3 className={`font-black text-white mb-4 ${textLg}`}>📋 Recent Sessions</h3>
          <div className="space-y-3">
            {sessions.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between glass-pill p-3 group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'rgba(34,229,181,0.15)', border: '1px solid rgba(34,229,181,0.3)' }}>💪</div>
                  <div>
                    <div className={`font-bold text-white ${textBase}`}>{s.exerciseName}</div>
                    <div className="text-white/40 text-xs">{s.sets.length} sets · {s.totalCalories} cal · <span style={{ color: '#58CC02' }}>+{s.xpEarned} XP</span></div>
                  </div>
                </div>
                <div className="text-white/30 text-xs">
                  {new Date(s.startTime).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Exercises library ── */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className={`font-black text-white mb-4 ${textLg}`}>🏋️ Exercise Library</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PRESET_EXERCISES.map(ex => (
            <div key={ex} className="glass-pill p-3 cursor-pointer hover:bg-white/10 transition-all group"
              onClick={() => { setSelectedEx(ex); setCustomEx(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <div className={`font-bold text-white group-hover:text-green-400 ${textBase}`}>{ex}</div>
              <div className="text-white/30 text-xs">MET: {EXERCISE_MET[ex]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovementTracker;
