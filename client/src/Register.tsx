import React, { useState } from 'react';
import { api } from './services/api';
import { UserProfile } from './types';

interface RegisterProps {
    onRegisterSuccess: (user: any) => void;
    onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        name: '',
        age: 25,
        gender: 'Male',
        weight: 70,
        height: 170,
        region: 'Mumbai',
        dietaryPreference: 'Vegetarian',
        language: 'English',
        goal: 'Weight Loss',
        activityLevel: 'Moderate',
        fitnessLevel: 'Beginner',
        hasInjuries: false,
        dosha: 'Pitta',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.register(email, password, profile);
            onRegisterSuccess(data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron-50 via-orange-50 to-rose-50 dark:from-obsidian-900 dark:via-obsidian-800 dark:to-obsidian-900 p-4">
            <div className="w-full max-w-2xl">
                <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-saffron-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <span className="text-4xl">🧘</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-center mb-2 text-obsidian-900 dark:text-white">
                        Create Account
                    </h1>
                    <p className="text-center text-obsidian-600 dark:text-obsidian-400 mb-8">
                        Step {step} of 2 - {step === 1 ? 'Account Details' : 'Your Profile'}
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-obsidian-700 dark:text-obsidian-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-obsidian-900/50 border border-obsidian-200 dark:border-obsidian-700 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-obsidian-700 dark:text-obsidian-300 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-obsidian-900/50 border border-obsidian-200 dark:border-obsidian-700 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-obsidian-700 dark:text-obsidian-300 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-obsidian-900/50 border border-obsidian-200 dark:border-obsidian-700 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-600 text-white font-black uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-obsidian-700 dark:text-obsidian-300 mb-2">
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            value={profile.age}
                                            onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-obsidian-900/50 border border-obsidian-200 dark:border-obsidian-700 focus:border-saffron-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-obsidian-700 dark:text-obsidian-300 mb-2">
                                            Gender
                                        </label>
                                        <select
                                            value={profile.gender}
                                            onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-obsidian-900/50 border border-obsidian-200 dark:border-obsidian-700 focus:border-saffron-500 outline-none"
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-obsidian-700 dark:text-obsidian-300 mb-2">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            value={profile.weight}
                                            onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-obsidian-900/50 border border-obsidian-200 dark:border-obsidian-700 focus:border-saffron-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-obsidian-700 dark:text-obsidian-300 mb-2">
                                            Height (cm)
                                        </label>
                                        <input
                                            type="number"
                                            value={profile.height}
                                            onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-obsidian-900/50 border border-obsidian-200 dark:border-obsidian-700 focus:border-saffron-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-obsidian-700 dark:text-obsidian-300 mb-2">
                                        Fitness Goal
                                    </label>
                                    <select
                                        value={profile.goal}
                                        onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-obsidian-900/50 border border-obsidian-200 dark:border-obsidian-700 focus:border-saffron-500 outline-none"
                                    >
                                        <option>Weight Loss</option>
                                        <option>Muscle Gain</option>
                                        <option>General Fitness</option>
                                        <option>Flexibility</option>
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 px-6 rounded-xl bg-obsidian-200 dark:bg-obsidian-700 text-obsidian-900 dark:text-white font-black uppercase tracking-wider hover:shadow-lg transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-600 text-white font-black uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-obsidian-600 dark:text-obsidian-400">
                            Already have an account?{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-saffron-600 dark:text-saffron-400 font-bold hover:underline"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>

                    {/* OAuth Buttons */}
                    {step === 1 && (
                        <>
                            <div className="mt-6 flex items-center">
                                <div className="flex-1 border-t border-obsidian-200 dark:border-obsidian-700"></div>
                                <span className="px-4 text-sm text-obsidian-600 dark:text-obsidian-400">OR</span>
                                <div className="flex-1 border-t border-obsidian-200 dark:border-obsidian-700"></div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={() => window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`}
                                    className="w-full py-3 px-6 rounded-xl bg-white dark:bg-obsidian-800 border-2 border-obsidian-200 dark:border-obsidian-700 text-obsidian-900 dark:text-white font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <button
                                    onClick={() => window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/microsoft`}
                                    className="w-full py-3 px-6 rounded-xl bg-white dark:bg-obsidian-800 border-2 border-obsidian-200 dark:border-obsidian-700 text-obsidian-900 dark:text-white font-bold flex items-center justify-center gap-3 hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                                        <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                                        <path fill="#f35325" d="M1 1h10v10H1z" />
                                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                                    </svg>
                                    Continue with Microsoft
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
