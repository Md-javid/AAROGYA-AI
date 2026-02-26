
import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

/* ─────────────────────────────────────────────
   iOS 19 Liquid-Glass Aurora Background
───────────────────────────────────────────── */
const AuroraBackground: React.FC = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
    <div className="absolute inset-0" style={{
      background: 'linear-gradient(160deg, #050812 0%, #0D0B1E 40%, #080E1F 70%, #050812 100%)'
    }} />
    <div className="absolute top-[-15%] left-[-10%] w-[65vw] h-[65vw] rounded-full animate-blob"
      style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.22) 0%, transparent 70%)', filter: 'blur(60px)' }} />
    <div className="absolute top-[-5%] right-[-10%] w-[55vw] h-[55vw] rounded-full animate-blob animation-delay-2000"
      style={{ background: 'radial-gradient(circle, rgba(155,107,255,0.20) 0%, transparent 70%)', filter: 'blur(70px)' }} />
    <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full animate-blob animation-delay-4000"
      style={{ background: 'radial-gradient(circle, rgba(255,95,160,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
    <div className="absolute bottom-[10%] right-[5%] w-[40vw] h-[40vw] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(34,229,181,0.10) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'blob 14s infinite 6s' }} />
    <div className="absolute inset-0 opacity-[0.03]"
      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
    <div className="absolute inset-x-0 top-0 h-px"
      style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(155,107,255,0.6) 30%,rgba(79,142,247,0.6) 60%,transparent 100%)' }} />
  </div>
);

/* ─────────────────────────────────────────────
   Animated Loading Screen
───────────────────────────────────────────── */
const LoadingScreen: React.FC = () => {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const iv = setInterval(() => setDots(d => (d % 3) + 1), 500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AuroraBackground />
      <div className="text-center animate-fadeIn relative z-10">
        <div className="relative mx-auto mb-8 w-28 h-28">
          <div className="absolute inset-0 rounded-full animate-liquidPulse glow-purple"
            style={{ background: 'linear-gradient(135deg,rgba(155,107,255,0.35),rgba(255,95,160,0.25))', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255,255,255,0.25)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl select-none" role="img" aria-label="fitness">🏃</span>
          </div>
          <div className="absolute -inset-3 rounded-full border border-dashed border-purple-500/30 animate-spin"
            style={{ animationDuration: '8s' }} />
        </div>
        <h1 className="text-4xl font-black mb-2 gradient-text tracking-tight">Aarogya AI</h1>
        <p className="text-white/50 font-medium text-lg mb-8">Your Intelligent Fitness Coach</p>
        <div className="w-64 mx-auto xp-bar mb-4">
          <div className="xp-fill animate-shimmer" style={{ width: '65%' }} />
        </div>
        <p className="text-white/40 text-sm">Initializing{'.'.repeat(dots)}</p>
        <div className="flex gap-2 justify-center mt-6 flex-wrap px-4">
          {['🤖 AI Coach','🥗 Food Vision','💪 Movement Track','🔥 Streaks'].map((f,i) => (
            <span key={f} className="glass-pill px-3 py-1 text-xs text-white/70 animate-fadeIn"
              style={{ animationDelay: `${i * 150 + 200}ms`, animationFillMode: 'both' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ─────────────────────────────────────────────
   Root App
───────────────────────────────────────────── */
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile]         = useState<UserProfile | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [isDarkMode, setIsDarkMode]           = useState(true);
  const [elderMode, setElderMode]             = useState(() => localStorage.getItem('aarogya_elder') === 'true');

  useEffect(() => {
    const check = async () => {
      const token     = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('aarogya_user');
      if (token && savedUser) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUserProfile(data.user.profile);
            setIsAuthenticated(true);
          } else {
            ['accessToken','refreshToken','aarogya_user'].forEach(k => localStorage.removeItem(k));
          }
        } catch {
          ['accessToken','refreshToken','aarogya_user'].forEach(k => localStorage.removeItem(k));
        }
      }
      setLoading(false);
    };
    check();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('aarogya_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-elder', String(elderMode));
    localStorage.setItem('aarogya_elder', String(elderMode));
  }, [elderMode]);

  const handleAuthSuccess = (user: any, _token: string) => {
    setUserProfile(user.profile);
    setIsAuthenticated(true);
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updates }),
      }).catch(() => {});
    }
  };

  const handleLogout = () => {
    ['accessToken','refreshToken','aarogya_user'].forEach(k => localStorage.removeItem(k));
    setUserProfile(null);
    setIsAuthenticated(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="antialiased min-h-screen relative" style={{ color: '#F0F4FF' }}>
      <AuroraBackground />
      {!isAuthenticated ? (
        <Auth
          onAuthSuccess={handleAuthSuccess}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(d => !d)}
        />
      ) : (
        <Dashboard
          user={userProfile!}
          onReset={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(d => !d)}
          onUpdateProfile={handleUpdateProfile}
          elderMode={elderMode}
          onToggleElderMode={() => setElderMode(e => !e)}
        />
      )}
    </div>
  );
};

export default App;
