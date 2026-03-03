import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Calendar, Weight, Ruler, MapPin, Utensils, Target, Activity, Heart, Shield, CheckCircle, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff, Zap, Sparkles, Brain, Camera, Flame, Trophy } from 'lucide-react';

interface AuthProps {
    onAuthSuccess: (user: any, token: string) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ── Glass Input ── */
const GlassInput: React.FC<{
    label: string; icon: React.ReactNode; type?: string;
    value: string | number; onChange: (v: string) => void;
    placeholder?: string; required?: boolean; min?: string; max?: string;
}> = ({ label, icon, type = 'text', value, onChange, placeholder, required, min, max }) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    return (
        <div>
            <label className="block font-bold mb-1.5 text-white/70 text-xs uppercase tracking-widest">{label}</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35">{icon}</span>
                <input
                    type={isPassword ? (show ? 'text' : 'password') : type}
                    value={value} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} required={required} min={min} max={max}
                    className="w-full pl-11 pr-11 py-3 text-sm"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1.5px solid rgba(255,255,255,0.12)',
                        borderRadius: 14, color: '#F0F4FF', outline: 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'border-color 0.2s ease, background 0.2s ease',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(155,107,255,0.6)'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                />
                {isPassword && (
                    <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
};

/* ── Glass Select ── */
const GlassSelect: React.FC<{ label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void; options: string[] }> = ({ label, icon, value, onChange, options }) => (
    <div>
        <label className="block font-bold mb-1.5 text-white/70 text-xs uppercase tracking-widest">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none">{icon}</span>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm appearance-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#F0F4FF', outline: 'none' }}>
                {options.map(o => <option key={o} value={o} style={{ background: '#0D0B1E' }}>{o}</option>)}
            </select>
        </div>
    </div>
);

/* ── Alert ── */
const Alert: React.FC<{ type: 'error' | 'success'; msg: string }> = ({ type, msg }) => (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium" style={{
        background: type === 'error' ? 'rgba(255,59,48,0.15)' : 'rgba(52,199,89,0.15)',
        border: `1.5px solid ${type === 'error' ? 'rgba(255,59,48,0.35)' : 'rgba(52,199,89,0.35)'}`,
        color: type === 'error' ? '#FF8080' : '#7AE28C'
    }}>
        {type === 'success' ? <CheckCircle size={16} /> : '⚠️'} {msg}
    </div>
);

/* ══════════════════════════════════════════════════════
   ANIMATED PLASMA / LIQUID WAVE BACKGROUND  (CSS only)
══════════════════════════════════════════════════════ */
const PlasmaBackground: React.FC = () => (
    <>
        <style>{`
            @keyframes plasma1 {
                0%,100% { transform: translate(0%,0%) scale(1); }
                25%      { transform: translate(8%,-12%) scale(1.15); }
                50%      { transform: translate(-6%, 10%) scale(0.92); }
                75%      { transform: translate(12%,  6%) scale(1.08); }
            }
            @keyframes plasma2 {
                0%,100% { transform: translate(0%,0%) scale(1); }
                33%      { transform: translate(-10%, 8%) scale(1.12); }
                66%      { transform: translate(7%,-10%) scale(0.95); }
            }
            @keyframes plasma3 {
                0%,100% { transform: translate(0%,0%) scale(1); }
                40%      { transform: translate(6%,14%) scale(1.1); }
                80%      { transform: translate(-8%,-8%) scale(0.93); }
            }
            @keyframes plasma4 {
                0%,100% { transform: translate(0%,0%) scale(1); }
                50%      { transform: translate(-5%, 12%) scale(1.18); }
            }
            @keyframes liquidWave {
                0%        { border-radius:60% 40% 30% 70%/60% 30% 70% 40%; }
                33%       { border-radius:30% 60% 70% 40%/50% 60% 30% 60%; }
                66%       { border-radius:70% 30% 50% 30%/30% 50% 70% 70%; }
                100%      { border-radius:60% 40% 30% 70%/60% 30% 70% 40%; }
            }
            .plasma-blob {
                position: absolute;
                border-radius: 60% 40% 30% 70%/60% 30% 70% 40%;
                filter: blur(55px);
                mix-blend-mode: screen;
            }
            .p1 { animation: plasma1 9s ease-in-out infinite, liquidWave 8s ease-in-out infinite; }
            .p2 { animation: plasma2 12s ease-in-out infinite, liquidWave 10s ease-in-out infinite reverse; }
            .p3 { animation: plasma3 7s ease-in-out infinite, liquidWave 12s ease-in-out infinite; }
            .p4 { animation: plasma4 14s ease-in-out infinite, liquidWave 9s ease-in-out infinite reverse; }
        `}</style>

        {/* Deep base */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg,#08001A 0%,#0D0528 50%,#06001A 100%)' }} />

        {/* Plasma blobs */}
        <div className="plasma-blob p1" style={{ width: '65%', height: '65%', top: '-15%', left: '-10%', background: 'radial-gradient(circle,rgba(160,60,255,0.75) 0%,rgba(100,0,200,0.40) 50%,transparent 75%)' }} />
        <div className="plasma-blob p2" style={{ width: '55%', height: '55%', top: '20%', right: '-15%', background: 'radial-gradient(circle,rgba(200,80,255,0.60) 0%,rgba(130,30,220,0.30) 55%,transparent 75%)' }} />
        <div className="plasma-blob p3" style={{ width: '50%', height: '50%', bottom: '-10%', left: '20%', background: 'radial-gradient(circle,rgba(120,40,240,0.65) 0%,rgba(80,10,180,0.35) 55%,transparent 75%)' }} />
        <div className="plasma-blob p4" style={{ width: '40%', height: '40%', top: '40%', left: '30%', background: 'radial-gradient(circle,rgba(220,120,255,0.45) 0%,rgba(160,60,255,0.20) 55%,transparent 75%)' }} />

        {/* Bright neon highlight streaks */}
        <div className="absolute" style={{ width: '25%', height: '2px', top: '25%', left: '10%', background: 'linear-gradient(90deg,transparent,rgba(220,140,255,0.8),transparent)', filter: 'blur(2px)', transform: 'rotate(-15deg)' }} />
        <div className="absolute" style={{ width: '20%', height: '2px', top: '60%', right: '15%', background: 'linear-gradient(90deg,transparent,rgba(200,100,255,0.7),transparent)', filter: 'blur(2px)', transform: 'rotate(10deg)' }} />
        <div className="absolute" style={{ width: '30%', height: '1.5px', top: '45%', left: '25%', background: 'linear-gradient(90deg,transparent,rgba(255,180,255,0.5),transparent)', filter: 'blur(1.5px)', transform: 'rotate(-5deg)' }} />

        {/* Grain noise overlay */}
        <div className="absolute inset-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")', opacity: 0.04 }} />

        {/* Subtle vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 85% 85% at 50% 50%,transparent 40%,rgba(0,0,10,0.55) 100%)' }} />
    </>
);

/* ══════════════════════════════════════════════════════
   LEFT PANEL — FULL APP INTRO
══════════════════════════════════════════════════════ */
const IntroPanel: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState(0);
    const features = [
        { icon: Brain, color: '#9B6BFF', label: 'Context-Aware AI Coach', desc: 'Analyzes your last 7 days — sleep, meals, workouts — and adapts guidance in real time.' },
        { icon: Camera, color: '#FF5FA0', label: 'Instant Food Vision', desc: 'Point camera at any meal and get instant calories, macros, and personalized advice.' },
        { icon: Flame, color: '#FFB547', label: 'Streak & XP Gamification', desc: 'Daily streaks, XP badges, and level-ups keep you showing up like Duolingo does for language.' },
        { icon: Sparkles, color: '#22E5B5', label: '4-Week Roadmap', desc: 'Foundation → Overload → Optimization → Peak Conditioning. AI tracks each week.' },
        { icon: Trophy, color: '#4F8EF7', label: 'Gym + Trainer + Market', desc: 'Find gyms, book trainers, and order healthy meals — all without leaving the app.' },
    ];

    useEffect(() => {
        const t = setInterval(() => setActiveFeature(f => (f + 1) % features.length), 3200);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="hidden lg:flex flex-col justify-between h-full px-12 pt-10 pb-8 relative z-10 select-none">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl"
                    style={{ background: 'linear-gradient(135deg,#9B6BFF,#FF5FA0)', boxShadow: '0 0 30px rgba(155,107,255,0.5)' }}>
                    <Zap size={20} className="text-white fill-white" />
                </div>
                <div>
                    <div className="font-black text-xl text-white tracking-tight">Aarogya AI</div>
                    <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Intelligent Fitness Coach</div>
                </div>
            </div>

            {/* Hero headline + features + social proof */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                    style={{ background: 'rgba(155,107,255,0.15)', border: '1px solid rgba(155,107,255,0.3)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-violet-300 text-[10px] font-black uppercase tracking-widest">AI-Powered · India-First</span>
                </div>

                <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.08] tracking-tight mb-4">
                    Your health,<br />
                    <span style={{ background: 'linear-gradient(135deg,#C084FC,#FF5FA0,#FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        transformed.
                    </span>
                </h1>
                <p className="text-white/55 text-sm leading-relaxed max-w-sm mb-5">
                    Not just a diet app. A living AI coach that watches your habits, adapts every plan, and celebrates every win — so you actually stick to it.
                </p>

                {/* Auto-cycling Feature cards */}
                <div className="space-y-2">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        const isActive = i === activeFeature;
                        return (
                            <div key={f.label}
                                onClick={() => setActiveFeature(i)}
                                className="flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-500"
                                style={{
                                    background: isActive ? `${f.color}18` : 'rgba(255,255,255,0.03)',
                                    border: `1.5px solid ${isActive ? `${f.color}45` : 'rgba(255,255,255,0.05)'}`,
                                    transform: isActive ? 'translateX(5px)' : 'translateX(0)',
                                }}>
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: isActive ? `${f.color}30` : 'rgba(255,255,255,0.06)', border: `1px solid ${isActive ? `${f.color}50` : 'rgba(255,255,255,0.08)'}` }}>
                                    <Icon size={14} style={{ color: isActive ? f.color : 'rgba(255,255,255,0.4)' }} />
                                </div>
                                <div>
                                    <div className="font-bold text-[13px] mb-0.5"
                                        style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>{f.label}</div>
                                    {isActive && (
                                        <div className="text-[11px] leading-relaxed animate-fadeIn" style={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-6">
                <div className="flex -space-x-2">
                    {['🧑‍💼', '👩', '🧔', '👩‍🦱', '🧑'].map((e, i) => (
                        <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white/10"
                            style={{ background: `hsl(${220 + i * 30},60%,25%)` }}>{e}</div>
                    ))}
                </div>
                <div>
                    <div className="flex items-center gap-1 mb-0.5">{'⭐'.repeat(5)}<span className="text-white/60 text-xs ml-1">4.9</span></div>
                    <div className="text-white/40 text-[11px]">Trusted by <span className="text-white/70 font-bold">2,400+</span> users across India</div>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   MAIN AUTH COMPONENT
══════════════════════════════════════════════════════ */
const Auth: React.FC<AuthProps> = ({ onAuthSuccess, isDarkMode, onToggleDarkMode }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');

    const [profile, setProfile] = useState({
        name: '', age: 25,
        gender: 'Male' as 'Male' | 'Female' | 'Other',
        weight: 70, height: 170, region: 'India',
        dietaryPreference: 'Vegetarian', language: 'English',
        goal: 'Weight Loss', activityLevel: 'Moderate',
        fitnessLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
        hasInjuries: false, injuries: '', medicalConditions: '',
        dosha: 'Unset' as 'Vata' | 'Pitta' | 'Kapha' | 'Unset',
    });
    const upd = (k: string, v: any) => setProfile(p => ({ ...p, [k]: v }));

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('aarogya_user', JSON.stringify(data.user));
            setSuccess('Welcome back! 🎉');
            setTimeout(() => onAuthSuccess(data.user, data.accessToken), 900);
        } catch (err: any) { setError(err.message || 'Login failed. Try again.'); }
        finally { setLoading(false); }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true);
        if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be ≥ 6 characters'); setLoading(false); return; }
        try {
            const res = await fetch(`${API_URL}/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
            setSuccess(`OTP sent to ${email}!`);
            setMode('verify');
            if (data.otp) { console.log('🔐 OTP:', data.otp); alert(`Dev OTP: ${data.otp}`); }
        } catch (err: any) { setError(err.message || 'Failed to send OTP'); }
        finally { setLoading(false); }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, otp, profile }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('aarogya_user', JSON.stringify(data.user));
            setSuccess('Account created! Welcome to Aarogya AI! 🚀');
            setTimeout(() => onAuthSuccess(data.user, data.accessToken), 1500);
        } catch (err: any) { setError(err.message || 'Registration failed. Try again.'); }
        finally { setLoading(false); }
    };

    /* ── Form renderers ── */
    const renderLogin = () => (
        <div className="animate-fadeIn">
            <div className="mb-7">
                <h2 className="text-2xl font-black text-white mb-1">Welcome back 👋</h2>
                <p className="text-white/45 text-sm">Continue your transformation journey</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
                <GlassInput label="Email" icon={<Mail size={16} />} type="email" value={email} onChange={setEmail} placeholder="your@email.com" required />
                <GlassInput label="Password" icon={<Lock size={16} />} type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
                {error && <Alert type="error" msg={error} />}
                {success && <Alert type="success" msg={success} />}
                <button type="submit" disabled={loading}
                    className="btn-primary btn-ripple w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 mt-2">
                    {loading ? <><Loader2 className="animate-spin" size={18} /> Logging in...</> : <>Login <ArrowRight size={16} /></>}
                </button>
            </form>
            <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <span className="text-white/25 text-xs">OR</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>
            <p className="text-center text-white/40 text-sm">
                No account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                    className="font-bold hover:underline transition-colors" style={{ color: '#C084FC' }}>
                    Sign up free
                </button>
            </p>
        </div>
    );

    const renderSignupStep1 = () => (
        <div className="animate-fadeIn">
            <div className="flex gap-1.5 mb-6">
                {[1, 2, 3].map(n => (
                    <div key={n} className="h-1 flex-1 rounded-full transition-all duration-500"
                        style={{ background: n === 1 ? 'linear-gradient(90deg,#9B6BFF,#FF5FA0)' : 'rgba(255,255,255,0.12)' }} />
                ))}
            </div>
            <div className="mb-6">
                <h2 className="text-2xl font-black text-white mb-1">Create Account</h2>
                <p className="text-white/45 text-sm">Step 1 of 3 — your credentials</p>
            </div>
            <form onSubmit={handleSendOTP} className="space-y-4">
                <GlassInput label="Email" icon={<Mail size={16} />} type="email" value={email} onChange={setEmail} placeholder="your@email.com" required />
                <GlassInput label="Password" icon={<Lock size={16} />} type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
                <GlassInput label="Confirm Password" icon={<Lock size={16} />} type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" required />
                {error && <Alert type="error" msg={error} />}
                {success && <Alert type="success" msg={success} />}
                <button type="submit" disabled={loading}
                    className="btn-primary btn-ripple w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
                    {loading ? <><Loader2 className="animate-spin" size={18} />Sending OTP...</> : <>Send Verification Code <ArrowRight size={16} /></>}
                </button>
            </form>
            <p className="text-center mt-5 text-white/40 text-sm">
                Have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="font-bold hover:underline" style={{ color: '#C084FC' }}>Login</button>
            </p>
        </div>
    );

    const renderOTP = () => (
        <div className="animate-fadeIn">
            <div className="flex gap-1.5 mb-6">
                {[1, 2, 3].map(n => (
                    <div key={n} className="h-1 flex-1 rounded-full"
                        style={{ background: n <= 2 ? 'linear-gradient(90deg,#9B6BFF,#FF5FA0)' : 'rgba(255,255,255,0.12)' }} />
                ))}
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(155,107,255,0.18)', border: '1.5px solid rgba(155,107,255,0.4)' }}>
                <Shield size={26} style={{ color: '#9B6BFF' }} />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Verify Email</h2>
            <p className="text-white/45 text-sm mb-6">Code sent to <span style={{ color: '#C084FC' }}>{email}</span></p>
            <form onSubmit={e => { e.preventDefault(); setStep(2); }} className="space-y-4">
                <div>
                    <label className="block font-bold mb-1.5 text-white/70 text-xs uppercase tracking-widest">Verification Code</label>
                    <input type="text" value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000" maxLength={6} required
                        className="w-full text-center py-4 text-2xl font-black"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 16, color: '#F0F4FF', outline: 'none', letterSpacing: '0.5em' }} />
                </div>
                {error && <Alert type="error" msg={error} />}
                <button type="submit" disabled={otp.length !== 6}
                    className="btn-primary btn-ripple w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
                    Continue to Profile <ArrowRight size={16} />
                </button>
                <button type="button" onClick={() => { setMode('signup'); setOtp(''); setError(''); }}
                    className="btn-glass w-full flex items-center justify-center gap-2 py-3">
                    <ArrowLeft size={16} /> Back
                </button>
            </form>
        </div>
    );

    const renderProfile = () => (
        <div className="animate-fadeIn">
            <div className="flex gap-1.5 mb-5">
                {[1, 2, 3].map(n => (
                    <div key={n} className="h-1 flex-1 rounded-full"
                        style={{ background: 'linear-gradient(90deg,#9B6BFF,#FF5FA0)' }} />
                ))}
            </div>
            <h2 className="text-xl font-black text-white mb-1">Your Profile</h2>
            <p className="text-white/45 text-sm mb-5">Help AI personalize your experience</p>
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <GlassInput label="Full Name" icon={<User size={15} />} value={profile.name} onChange={v => upd('name', v)} placeholder="Your name" required />
                    <GlassInput label="Age" icon={<Calendar size={15} />} type="number" value={profile.age} onChange={v => upd('age', parseInt(v))} min="10" max="100" required />
                    <GlassSelect label="Gender" icon={<User size={15} />} value={profile.gender} onChange={v => upd('gender', v)} options={['Male', 'Female', 'Other']} />
                    <GlassInput label="Weight (kg)" icon={<Weight size={15} />} type="number" value={profile.weight} onChange={v => upd('weight', parseInt(v))} required />
                    <GlassInput label="Height (cm)" icon={<Ruler size={15} />} type="number" value={profile.height} onChange={v => upd('height', parseInt(v))} required />
                    <GlassInput label="City / Region" icon={<MapPin size={15} />} value={profile.region} onChange={v => upd('region', v)} placeholder="e.g. Mumbai" required />
                    <GlassSelect label="Diet" icon={<Utensils size={15} />} value={profile.dietaryPreference} onChange={v => upd('dietaryPreference', v)}
                        options={['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian']} />
                    <GlassSelect label="Goal" icon={<Target size={15} />} value={profile.goal} onChange={v => upd('goal', v)}
                        options={['Weight Loss', 'Muscle Gain', 'Maintain Fitness', 'Improve Endurance', 'Senior Wellness']} />
                    <GlassSelect label="Activity" icon={<Activity size={15} />} value={profile.activityLevel} onChange={v => upd('activityLevel', v)}
                        options={['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active']} />
                    <GlassSelect label="Fitness Level" icon={<Heart size={15} />} value={profile.fitnessLevel} onChange={v => upd('fitnessLevel', v as any)}
                        options={['Beginner', 'Intermediate', 'Advanced']} />
                </div>
                {error && <Alert type="error" msg={error} />}
                {success && <Alert type="success" msg={success} />}
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setStep(1)}
                        className="btn-glass flex items-center gap-2 px-5 py-3"><ArrowLeft size={16} /> Back</button>
                    <button type="submit" disabled={loading}
                        className="btn-primary btn-ripple flex-1 flex items-center justify-center gap-2 py-3.5 disabled:opacity-50">
                        {loading ? <><Loader2 className="animate-spin" size={18} />Creating...</> : <><CheckCircle size={16} />Complete Sign Up</>}
                    </button>
                </div>
            </form>
        </div>
    );

    /* ─────────────── OUTER LAYOUT ─────────────── */
    return (
        <div className="min-h-screen flex relative overflow-hidden">

            {/* ═══ ANIMATED PLASMA BACKGROUND (full page) ═══ */}
            <div className="absolute inset-0 z-0"><PlasmaBackground /></div>

            {/* ═══ LEFT — App Intro Panel (desktop) ═══ */}
            <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-shrink-0 relative z-10">
                {/* Frosted glass divider on the right edge */}
                <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg,transparent,rgba(255,255,255,0.12) 30%,rgba(255,255,255,0.12) 70%,transparent)' }} />
                <IntroPanel />
            </div>

            {/* ═══ RIGHT — Auth Form ═══ */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative z-10">

                {/* Small logo badge — no light toggle on login */}
                <div className="absolute top-5 right-5">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <div className="w-5 h-5 rounded-md flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#9B6BFF,#FF5FA0)' }}>
                            <Zap size={10} className="text-white fill-white" />
                        </div>
                        <span className="text-white/50 text-[10px] font-bold">Aarogya AI</span>
                    </div>
                </div>

                {/* Mobile logo */}
                <div className="lg:hidden absolute top-5 left-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#9B6BFF,#FF5FA0)' }}>
                        <Zap size={14} className="text-white fill-white" />
                    </div>
                    <span className="font-black text-white text-sm">Aarogya AI</span>
                </div>

                {/* Form glass card */}
                <div className="w-full max-w-[420px]">
                    {/* Glow ring behind card */}
                    <div className="absolute pointer-events-none"
                        style={{ width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle,rgba(155,107,255,0.18) 0%,transparent 65%)', transform: 'translate(-50%,-50%)', top: '50%', left: '50%', filter: 'blur(30px)' }} />

                    <div className="relative rounded-[2rem] overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.07)',
                            backdropFilter: 'blur(40px)',
                            WebkitBackdropFilter: 'blur(40px)',
                            border: '1.5px solid rgba(255,255,255,0.14)',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.15) inset',
                        }}>

                        {/* Sheen highlight */}
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)' }} />

                        <div className="p-8 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                            {mode === 'login' && renderLogin()}
                            {mode === 'signup' && step === 1 && renderSignupStep1()}
                            {mode === 'verify' && step === 1 && renderOTP()}
                            {step === 2 && renderProfile()}
                        </div>
                    </div>

                    <p className="text-center mt-4 text-white/25 text-xs">
                        🔒 End-to-end encrypted · Your data is never sold
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
