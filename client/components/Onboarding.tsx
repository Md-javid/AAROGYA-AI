
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { REGIONS, DIETARY_PREFERENCES, GOALS, ACTIVITY_LEVELS, LANGUAGES, FITNESS_LEVELS, PRESET_AVATARS } from '../constants';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Moon,
  Sun,
  Camera,
  Upload,
  User as UserIcon,
  Mail,
  Lock,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const steps = [
  { id: 'auth', title: 'Welcome' },
  { id: 'basics', title: 'The Basics' },
  { id: 'avatar', title: 'Your Avatar' },
  { id: 'metrics', title: 'Body & Fitness' },
  { id: 'lifestyle', title: 'Lifestyle & Diet' },
  { id: 'goals', title: 'Aarogya Goals' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isDarkMode, onToggleDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [authMethod, setAuthMethod] = useState<'none' | 'email' | 'google' | 'microsoft'>('none');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    hasInjuries: false,
    injuries: '',
    medicalConditions: '',
    gender: 'Male',
    dietaryPreference: 'Vegetarian',
    region: REGIONS[0],
    language: 'English',
    activityLevel: ACTIVITY_LEVELS[1],
    fitnessLevel: 'Beginner',
    goal: GOALS[2],
    avatar: PRESET_AVATARS[0],
    motto: '',
  });

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAuth = (method: 'google' | 'microsoft' | 'email') => {
    setIsAuthenticating(true);
    setAuthMethod(method);

    // Simulated auth delay for "premium" feel
    setTimeout(() => {
      setIsAuthenticating(false);
      if (method === 'google') {
        handleChange('name', 'Aryan Singh');
        handleChange('avatar', PRESET_AVATARS[0]);
      } else if (method === 'microsoft') {
        handleChange('name', 'Priya Sharma');
        handleChange('avatar', PRESET_AVATARS[1]);
      }
      setCurrentStep(1);
    }, 1500);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(formData as UserProfile);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Auth Step
        if (isAuthenticating) {
          return (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-pulse">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="text-orange-500" size={24} />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Securing Connection</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verifying your Aarogya identity via {authMethod}...</p>
              </div>
            </div>
          );
        }

        if (authMethod === 'email') {
          return (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => simulateAuth('email')}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition-all flex items-center justify-center gap-3"
              >
                Sign In <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setAuthMethod('none')}
                className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Back to Social Login
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2 mb-8">
              <p className="text-slate-500 dark:text-slate-400 font-medium italic">"The first step to a balanced life starts with identity."</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => simulateAuth('google')}
                className="w-full flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left font-black text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-widest">Continue with Google</span>
              </button>

              <button
                onClick={() => simulateAuth('microsoft')}
                className="w-full flex items-center gap-4 px-6 py-4 bg-[#2F2F2F] border border-transparent rounded-2xl hover:bg-[#3F3F3F] transition-all group"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-6 h-6 object-contain group-hover:scale-110 transition-transform invert" />
                <span className="flex-1 text-left font-black text-white uppercase text-[10px] tracking-widest">Continue with Microsoft</span>
              </button>

              <button
                onClick={() => setAuthMethod('email')}
                className="w-full flex items-center gap-4 px-6 py-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all group"
              >
                <div className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Mail size={14} />
                </div>
                <span className="flex-1 text-left font-black text-orange-700 dark:text-orange-400 uppercase text-[10px] tracking-widest">Continue with Email</span>
              </button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] bg-white dark:bg-slate-900 px-4">Or</div>
            </div>

            <button
              onClick={() => setCurrentStep(1)}
              className="w-full py-4 border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-orange-600 hover:border-orange-100 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
            >
              Continue as Guest
            </button>
          </div>
        );

      case 1: // Basics
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="e.g. Rahul, Priya"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Personal Motto</label>
              <input
                type="text"
                className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="e.g. Health is Wealth, Just Keep Going..."
                value={formData.motto || ''}
                onChange={(e) => handleChange('motto', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.age || ''}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  {['Male', 'Female', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-orange-500 p-1 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <UserIcon size={64} className="text-slate-300" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 transition-all border-2 border-white dark:border-slate-900"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium italic">"Your digital presence on the path to Aarogya"</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChange('avatar', url)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                    formData.avatar === url ? 'border-orange-500 shadow-md ring-2 ring-orange-200' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx}`} className="w-full h-auto" />
                  {formData.avatar === url && (
                    <div className="absolute top-1 right-1 bg-orange-500 text-white rounded-full p-0.5">
                      <Check size={10} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
               >
                 <Upload size={14} /> Upload Custom Photo
               </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.weight || ''}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.height || ''}
                  onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Fitness Level</label>
              <div className="flex gap-2">
                {FITNESS_LEVELS.map(f => (
                  <button
                    key={f}
                    onClick={() => handleChange('fitnessLevel', f)}
                    className={`flex-1 py-3 rounded-xl border text-sm transition-all ${
                      formData.fitnessLevel === f
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.hasInjuries}
                  onChange={(e) => handleChange('hasInjuries', e.target.checked)}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Injuries or Medical Conditions?</span>
              </label>
            </div>
            {formData.hasInjuries && (
              <div className="space-y-4 animate-fadeIn">
                <textarea
                  className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  rows={2}
                  value={formData.medicalConditions || ''}
                  onChange={(e) => handleChange('medicalConditions', e.target.value)}
                  placeholder="Describe medical conditions (e.g. Hypertension, Diabetes, Thyroid...)"
                />
                <textarea
                  className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  rows={2}
                  value={formData.injuries || ''}
                  onChange={(e) => handleChange('injuries', e.target.value)}
                  placeholder="Describe physical injuries (e.g. Knee pain, slip disc...)"
                />
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Region (Local Food Preference)</label>
              <select
                className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-3">
                {DIETARY_PREFERENCES.map(d => (
                  <button
                    key={d}
                    onClick={() => handleChange('dietaryPreference', d)}
                    className={`p-3 text-xs rounded-xl border text-left transition-all ${
                      formData.dietaryPreference === d
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Activity Level</label>
              <select
                className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.activityLevel}
                onChange={(e) => handleChange('activityLevel', e.target.value)}
              >
                {ACTIVITY_LEVELS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Your Main Goal</label>
              <select
                className="w-full p-4 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.goal}
                onChange={(e) => handleChange('goal', e.target.value)}
              >
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Coach Language</label>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    onClick={() => handleChange('language', l)}
                    className={`p-3 text-xs rounded-xl border text-center transition-all ${
                      formData.language === l
                        ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/20">
              <p className="text-xs text-orange-800 dark:text-orange-200 font-medium text-center">
                Aarogya AI uses personalized data to curate regional diets and workouts specifically for you.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    if (currentStep === 0) return true; // Auth handled internally
    if (currentStep === 1) return formData.name && formData.age;
    if (currentStep === 2) return formData.avatar;
    if (currentStep === 3) return formData.weight && formData.height;
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors font-sans">
      <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-[2.5rem] shadow-2xl overflow-hidden transition-all border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="bg-orange-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <button
            onClick={onToggleDarkMode}
            className="absolute top-6 right-6 p-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors z-10"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-1 tracking-tighter">AAROGYA AI</h1>
            <p className="text-orange-100 text-[10px] font-black uppercase tracking-[0.4em]">Indian Wisdom • Neural Precision</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 flex">
          <div
            className="h-full bg-orange-500 transition-all duration-700 ease-in-out shadow-[0_0_15px_rgba(249,115,22,0.6)]"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Form Content */}
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-4">
              <span className="flex items-center justify-center w-12 h-12 rounded-[1.2rem] bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xl font-black shadow-inner">
                {currentStep + 1}
              </span>
              {steps[currentStep].title}
            </h2>
          </div>

          <div className="min-h-[380px]">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer Navigation (Only show after auth step) */}
        {currentStep > 0 && !isAuthenticating && (
          <div className="px-10 pb-10 pt-4 flex justify-between gap-4">
            <button
              onClick={prevStep}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800"
            >
              <ChevronLeft size={18} /> Back
            </button>

            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-white transition-all shadow-xl ${
                !isStepValid()
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                  : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200 dark:shadow-none hover:-translate-y-1'
              }`}
            >
              {currentStep === steps.length - 1 ? 'Awaken Aarogya' : 'Continue'}
              {currentStep === steps.length - 1 ? <Check size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
