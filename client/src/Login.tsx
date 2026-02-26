import React, { useState } from 'react';
import { api } from './services/api';

interface LoginProps {
    onLoginSuccess: (user: any) => void;
    onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.login(email, password);
            onLoginSuccess(data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-saffron-50 via-orange-50 to-rose-50 dark:from-obsidian-900 dark:via-obsidian-800 dark:to-obsidian-900 p-4">
            <div className="w-full max-w-md">
                <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-saffron-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <span className="text-4xl">🧘</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-center mb-2 text-obsidian-900 dark:text-white">
                        Welcome Back
                    </h1>
                    <p className="text-center text-obsidian-600 dark:text-obsidian-400 mb-8">
                        Sign in to continue your wellness journey
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                placeholder="you@example.com"
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
                                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-obsidian-900/50 border border-obsidian-200 dark:border-obsidian-700 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-600 text-white font-black uppercase tracking-wider hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-obsidian-600 dark:text-obsidian-400">
                            Don't have an account?{' '}
                            <button
                                onClick={onSwitchToRegister}
                                className="text-saffron-600 dark:text-saffron-400 font-bold hover:underline"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
