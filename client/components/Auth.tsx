import React, { useState } from 'react';
import { Mail, Lock, User, Calendar, Weight, Ruler, MapPin, Utensils, Target, Activity, Heart, Shield, CheckCircle, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
    onAuthSuccess: (user: any, token: string) => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ── Reusable liquid glass input ── */
const GlassInput: React.FC<{
    label: string;
    icon: React.ReactNode;
    type?: string;
    value: string | number;
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
    min?: string; max?: string;
    elderMode?: boolean;
}> = ({ label, icon, type = 'text', value, onChange, placeholder, required, min, max, elderMode }) => {
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';
    return (
        <div>
            <label className={`block font-bold mb-2 text-white/80 ${elderMode ? 'text-lg' : 'text-sm'}`}>{label}</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">{icon}</span>
                <input
                    type={isPassword ? (show ? 'text' : 'password') : type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    min={min} max={max}
                    className={`glass-input w-full pl-12 pr-12 ${elderMode ? 'py-4 text-lg' : 'py-3'}`}
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14, color: '#F0F4FF' }}
                />
                {isPassword && (
                    <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

/* ── Select input ── */
const GlassSelect: React.FC<{label:string;icon:React.ReactNode;value:string;onChange:(v:string)=>void;options:string[];elderMode?:boolean}> =
({ label, icon, value, onChange, options, elderMode }) => (
    <div>
        <label className={`block font-bold mb-2 text-white/80 ${elderMode ? 'text-lg' : 'text-sm'}`}>{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">{icon}</span>
            <select value={value} onChange={e => onChange(e.target.value)}
                className={`w-full pl-12 pr-4 ${elderMode ? 'py-4 text-lg' : 'py-3'} appearance-none`}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14, color: '#F0F4FF', outline: 'none' }}>
                {options.map(o => <option key={o} value={o} style={{ background: '#0D0B1E' }}>{o}</option>)}
            </select>
        </div>
    </div>
);

/* ── Alert box ── */
const Alert: React.FC<{type:'error'|'success';msg:string}> = ({ type, msg }) => (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium"
        style={{
            background: type === 'error' ? 'rgba(255,59,48,0.15)' : 'rgba(52,199,89,0.15)',
            border: `1.5px solid ${type === 'error' ? 'rgba(255,59,48,0.35)' : 'rgba(52,199,89,0.35)'}`,
            color: type === 'error' ? '#FF8080' : '#7AE28C'
        }}>
        {type === 'success' ? <CheckCircle size={16}/> : '⚠️'}
        {msg}
    </div>
);

/* ──────────────────────────────────────────
   Main Auth Component
────────────────────────────────────────── */
const Auth: React.FC<AuthProps> = ({ onAuthSuccess, isDarkMode, onToggleDarkMode }) => {
    const [mode, setMode]   = useState<'login'|'signup'|'verify'>('login');
    const [step, setStep]   = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const [elderMode]           = useState(() => localStorage.getItem('aarogya_elder') === 'true');

    const [email, setEmail]                   = useState('');
    const [password, setPassword]             = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp]                       = useState('');

    const [profile, setProfile] = useState({
        name: '', age: 25,
        gender: 'Male' as 'Male'|'Female'|'Other',
        weight: 70, height: 170, region: 'India',
        dietaryPreference: 'Vegetarian', language: 'English',
        goal: 'Weight Loss', activityLevel: 'Moderate',
        fitnessLevel: 'Beginner' as 'Beginner'|'Intermediate'|'Advanced',
        hasInjuries: false, injuries: '', medicalConditions: '',
        dosha: 'Unset' as 'Vata'|'Pitta'|'Kapha'|'Unset',
    });

    const upd = (k: string, v: any) => setProfile(p => ({ ...p, [k]: v }));

    /* ── Login ── */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const res  = await fetch(`${API_URL}/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
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

    /* ── Send OTP ── */
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true);
        if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be ≥ 6 characters'); setLoading(false); return; }
        try {
            const res  = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
            setSuccess(`OTP sent to ${email}!`);
            setMode('verify');
            if (data.otp) { console.log('🔐 OTP:', data.otp); alert(`Dev OTP: ${data.otp}`); }
        } catch (err: any) { setError(err.message || 'Failed to send OTP'); }
        finally { setLoading(false); }
    };

    /* ── Register ── */
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const res  = await fetch(`${API_URL}/auth/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, otp, profile }),
            });
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

    /* ─────────────────── FEATURE HIGHLIGHTS SIDE PANEL ─────────────────── */
    const FeaturePanel = () => (
        <div className="hidden lg:flex flex-col justify-between p-10 rounded-3xl h-full"
            style={{ background: 'linear-gradient(160deg, rgba(155,107,255,0.18), rgba(255,95,160,0.12))', backdropFilter: 'blur(24px)', border: '1.5px solid rgba(255,255,255,0.12)' }}>
            <div>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                        style={{ background: 'linear-gradient(135deg, #9B6BFF, #FF5FA0)' }}>🏃</div>
                    <div>
                        <div className="font-black text-xl text-white">Aarogya AI</div>
                        <div className="text-white/50 text-xs">Personal Fitness Coach</div>
                    </div>
                </div>

                <div className={`font-black text-white mb-3 ${elderMode ? 'text-4xl' : 'text-3xl'}`}>
                    Your Health,<br/>
                    <span className="gradient-text">Supercharged</span>
                </div>
                <p className={`text-white/60 mb-8 ${elderMode ? 'text-lg' : 'text-sm'}`}>
                    AI-powered coaching, movement tracking, nutrition vision — everything you need to thrive.
                </p>

                <div className="space-y-4">
                    {[
                        { emoji: '🤖', title: 'AI Fitness Coach', desc: 'Personalized plans powered by Gemini AI', color: '#9B6BFF' },
                        { emoji: '📸', title: 'Meal Vision', desc: 'Scan food to instantly track nutrition', color: '#FF5FA0' },
                        { emoji: '💪', title: 'Movement Tracker', desc: 'Real-time exercise recording & analysis', color: '#22E5B5' },
                        { emoji: '🔥', title: 'Daily Streaks', desc: 'Duolingo-style gamification & rewards', color: '#FFB547' },
                        { emoji: '🧠', title: 'Agentic AI', desc: 'LangGraph-powered smart health agent', color: '#4F8EF7' },
                        { emoji: '♿', title: 'Elder Friendly', desc: 'Large text, simple navigation for all ages', color: '#FF6B6B' },
                    ].map(f => (
                        <div key={f.title} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 transition-transform group-hover:scale-110"
                                style={{ background: `${f.color}25`, border: `1px solid ${f.color}40` }}>
                                {f.emoji}
                            </div>
                            <div>
                                <div className={`font-bold text-white ${elderMode ? 'text-base' : 'text-sm'}`}>{f.title}</div>
                                <div className={`text-white/50 ${elderMode ? 'text-sm' : 'text-xs'}`}>{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social proof */}
            <div className="mt-8 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex gap-1 mb-1">{'⭐'.repeat(5)}</div>
                <p className={`text-white/70 italic mb-2 ${elderMode ? 'text-base' : 'text-sm'}`}>
                    "Transformed my health in 3 months. The AI coaching is incredible!"
                </p>
                <div className="text-white/40 text-xs">— Priya S., Mumbai</div>
            </div>
        </div>
    );

    /* ─────────────────── LOGIN FORM ─────────────────── */
    const renderLogin = () => (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`font-black text-white ${elderMode ? 'text-4xl' : 'text-3xl'}`}>Welcome back</span>
                    <span className="text-3xl">👋</span>
                </div>
                <p className={`text-white/50 ${elderMode ? 'text-lg' : 'text-sm'}`}>
                    Login to continue your fitness journey
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <GlassInput label="Email" icon={<Mail size={18}/>} type="email" value={email}
                    onChange={setEmail} placeholder="your@email.com" required elderMode={elderMode} />
                <GlassInput label="Password" icon={<Lock size={18}/>} type="password" value={password}
                    onChange={setPassword} placeholder="••••••••" required elderMode={elderMode} />

                {error   && <Alert type="error"   msg={error} />}
                {success && <Alert type="success" msg={success} />}

                <button type="submit" disabled={loading}
                    className={`btn-primary btn-ripple w-full flex items-center justify-center gap-2 disabled:opacity-50 ${elderMode ? 'py-5 text-lg' : 'py-4'}`}>
                    {loading ? <><Loader2 className="animate-spin" size={20}/> Logging in...</> : <>Login <ArrowRight size={18}/></>}
                </button>
            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <span className="text-white/30 text-xs">OR</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <p className={`text-center text-white/50 ${elderMode ? 'text-lg' : 'text-sm'}`}>
                No account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                    className="font-bold hover:underline" style={{ color: '#9B6BFF' }}>
                    Sign up — it's free!
                </button>
            </p>
        </div>
    );

    /* ─────────────────── SIGNUP STEP 1 ─────────────────── */
    const renderSignupStep1 = () => (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                        {[1,2,3].map(n => (
                            <div key={n} className="h-1.5 w-8 rounded-full transition-all"
                                style={{ background: n === 1 ? 'linear-gradient(90deg,#9B6BFF,#FF5FA0)' : 'rgba(255,255,255,0.15)' }} />
                        ))}
                    </div>
                    <span className="text-white/40 text-xs">Step 1 of 3</span>
                </div>
                <h1 className={`font-black text-white ${elderMode ? 'text-4xl' : 'text-3xl'}`}>Create Account</h1>
                <p className={`text-white/50 mt-1 ${elderMode ? 'text-lg' : 'text-sm'}`}>Set up your email & password</p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-5">
                <GlassInput label="Email" icon={<Mail size={18}/>} type="email" value={email}
                    onChange={setEmail} placeholder="your@email.com" required elderMode={elderMode} />
                <GlassInput label="Password" icon={<Lock size={18}/>} type="password" value={password}
                    onChange={setPassword} placeholder="••••••••" required elderMode={elderMode} />
                <GlassInput label="Confirm Password" icon={<Lock size={18}/>} type="password" value={confirmPassword}
                    onChange={setConfirmPassword} placeholder="••••••••" required elderMode={elderMode} />

                {error   && <Alert type="error"   msg={error} />}
                {success && <Alert type="success" msg={success} />}

                <button type="submit" disabled={loading}
                    className={`btn-primary btn-ripple w-full flex items-center justify-center gap-2 disabled:opacity-50 ${elderMode ? 'py-5 text-lg' : 'py-4'}`}>
                    {loading ? <><Loader2 className="animate-spin" size={20}/>Sending OTP...</> : <>Send Verification Code <ArrowRight size={18}/></>}
                </button>
            </form>

            <p className={`text-center mt-6 text-white/50 ${elderMode ? 'text-lg' : 'text-sm'}`}>
                Have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="font-bold hover:underline" style={{ color: '#9B6BFF' }}>Login</button>
            </p>
        </div>
    );

    /* ─────────────────── OTP VERIFICATION ─────────────────── */
    const renderOTP = () => (
        <div className="animate-fadeIn">
            <div className="mb-8">
                <div className="flex gap-1 mb-4">
                    {[1,2,3].map(n => (
                        <div key={n} className="h-1.5 w-8 rounded-full"
                            style={{ background: n <= 2 ? 'linear-gradient(90deg,#9B6BFF,#FF5FA0)' : 'rgba(255,255,255,0.15)' }} />
                    ))}
                </div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(155,107,255,0.2)', border: '1.5px solid rgba(155,107,255,0.4)' }}>
                    <Shield size={28} style={{ color: '#9B6BFF' }} />
                </div>
                <h1 className={`font-black text-white ${elderMode ? 'text-4xl' : 'text-3xl'}`}>Verify Email</h1>
                <p className={`text-white/50 mt-1 ${elderMode ? 'text-lg' : 'text-sm'}`}>
                    Enter the code sent to <span style={{ color: '#9B6BFF' }}>{email}</span>
                </p>
            </div>

            <form onSubmit={e => { e.preventDefault(); setStep(2); }} className="space-y-5">
                <div>
                    <label className={`block font-bold mb-3 text-white/80 ${elderMode ? 'text-lg' : 'text-sm'}`}>Verification Code</label>
                    <input
                        type="text" value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                        placeholder="000000" maxLength={6} required
                        className={`w-full text-center tracking-[0.5em] font-black ${elderMode ? 'py-5 text-3xl' : 'py-4 text-2xl'}`}
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 16, color: '#F0F4FF', outline: 'none', letterSpacing: '0.4em' }}
                    />
                </div>

                {error && <Alert type="error" msg={error} />}

                <button type="submit" disabled={otp.length !== 6}
                    className={`btn-primary btn-ripple w-full flex items-center justify-center gap-2 disabled:opacity-50 ${elderMode ? 'py-5 text-lg' : 'py-4'}`}>
                    Continue to Profile <ArrowRight size={18}/>
                </button>
                <button type="button" onClick={() => { setMode('signup'); setOtp(''); setError(''); }}
                    className={`btn-glass w-full flex items-center justify-center gap-2 ${elderMode ? 'py-4 text-lg' : 'py-3'}`}>
                    <ArrowLeft size={18}/> Back
                </button>
            </form>
        </div>
    );

    /* ─────────────────── PROFILE SETUP (Step 2) ─────────────────── */
    const renderProfile = () => (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <div className="flex gap-1 mb-4">
                    {[1,2,3].map(n => (
                        <div key={n} className="h-1.5 w-8 rounded-full"
                            style={{ background: n <= 3 ? 'linear-gradient(90deg,#9B6BFF,#FF5FA0)' : 'rgba(255,255,255,0.15)' }} />
                    ))}
                </div>
                <h1 className={`font-black text-white ${elderMode ? 'text-4xl' : 'text-3xl'}`}>Your Profile</h1>
                <p className={`text-white/50 mt-1 ${elderMode ? 'text-lg' : 'text-sm'}`}>Help AI personalize your plans</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <GlassInput label="Full Name" icon={<User size={18}/>} value={profile.name}
                        onChange={v => upd('name',v)} placeholder="Your name" required elderMode={elderMode} />
                    <GlassInput label="Age" icon={<Calendar size={18}/>} type="number" value={profile.age}
                        onChange={v => upd('age', parseInt(v))} min="10" max="100" required elderMode={elderMode} />
                    <GlassSelect label="Gender" icon={<User size={18}/>} value={profile.gender}
                        onChange={v => upd('gender',v)} options={['Male','Female','Other']} elderMode={elderMode} />
                    <GlassInput label="Weight (kg)" icon={<Weight size={18}/>} type="number" value={profile.weight}
                        onChange={v => upd('weight',parseInt(v))} required elderMode={elderMode} />
                    <GlassInput label="Height (cm)" icon={<Ruler size={18}/>} type="number" value={profile.height}
                        onChange={v => upd('height',parseInt(v))} required elderMode={elderMode} />
                    <GlassInput label="Your Region/City" icon={<MapPin size={18}/>} value={profile.region}
                        onChange={v => upd('region',v)} placeholder="e.g. Mumbai" required elderMode={elderMode} />
                    <GlassSelect label="Diet Preference" icon={<Utensils size={18}/>} value={profile.dietaryPreference}
                        onChange={v => upd('dietaryPreference',v)}
                        options={['Vegetarian','Non-Vegetarian','Vegan','Eggetarian']} elderMode={elderMode} />
                    <GlassSelect label="Fitness Goal" icon={<Target size={18}/>} value={profile.goal}
                        onChange={v => upd('goal',v)}
                        options={['Weight Loss','Muscle Gain','Maintain Fitness','Improve Endurance','Senior Wellness']} elderMode={elderMode} />
                    <GlassSelect label="Activity Level" icon={<Activity size={18}/>} value={profile.activityLevel}
                        onChange={v => upd('activityLevel',v)}
                        options={['Sedentary','Light','Moderate','Active','Very Active']} elderMode={elderMode} />
                    <GlassSelect label="Fitness Level" icon={<Heart size={18}/>} value={profile.fitnessLevel}
                        onChange={v => upd('fitnessLevel',v as any)}
                        options={['Beginner','Intermediate','Advanced']} elderMode={elderMode} />
                </div>

                {error   && <Alert type="error"   msg={error} />}
                {success && <Alert type="success" msg={success} />}

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)}
                        className={`btn-glass flex items-center gap-2 px-5 ${elderMode ? 'py-4 text-lg' : 'py-3'}`}>
                        <ArrowLeft size={18}/> Back
                    </button>
                    <button type="submit" disabled={loading}
                        className={`btn-primary btn-ripple flex-1 flex items-center justify-center gap-2 disabled:opacity-50 ${elderMode ? 'py-5 text-lg' : 'py-4'}`}>
                        {loading ? <><Loader2 className="animate-spin" size={20}/>Creating Account...</> : <><CheckCircle size={18}/>Complete Sign Up</>}
                    </button>
                </div>
            </form>
        </div>
    );

    /* ─────────────────── OUTER LAYOUT ─────────────────── */
    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* ── Left feature panel (desktop) ── */}
            <div className="hidden lg:flex w-[420px] flex-shrink-0 p-6 items-stretch">
                <FeaturePanel />
            </div>

            {/* ── Right auth form ── */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
                {/* Top-right controls */}
                <div className="absolute top-6 right-6 flex gap-2">
                    {/* Elder mode toggle */}
                    <button
                        onClick={() => { const e = localStorage.getItem('aarogya_elder') !== 'true'; localStorage.setItem('aarogya_elder', String(e)); window.location.reload(); }}
                        className="glass-pill px-3 py-2 text-xs font-bold flex items-center gap-1.5"
                        title="Accessibility: Large Text Mode">
                        <span>♿</span>
                        <span className="text-white/70">Elder Mode</span>
                    </button>
                    {/* Dark mode toggle */}
                    <button onClick={onToggleDarkMode}
                        className="glass-pill h-10 w-10 flex items-center justify-center text-lg"
                        title="Toggle theme">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>

                {/* Form card */}
                <div className="w-full max-w-md">
                    <div className="glass-card p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {mode === 'login' && renderLogin()}
                        {mode === 'signup' && step === 1 && renderSignupStep1()}
                        {mode === 'verify' && step === 1 && renderOTP()}
                        {step === 2 && renderProfile()}
                    </div>

                    {/* Tagline below card */}
                    <p className="text-center text-white/30 text-xs mt-4">
                        🔒 Your data is encrypted & never sold
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
