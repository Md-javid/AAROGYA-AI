
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import {
  User,
  Settings as SettingsIcon,
  Moon,
  Sun,
  ShieldAlert,
  Trash2,
  Globe,
  Info,
  ChevronRight,
  LogOut,
  Scale,
  Activity,
  Award,
  Download,
  Upload,
  Flower2 as Lotus,
  Zap,
  Wind,
  CheckCircle,
  FileJson,
  RefreshCcw,
  Edit2,
  Camera,
  X
} from 'lucide-react';
import { LANGUAGES } from '../constants';
import {
  getWorkoutLogs,
  getMealLogs,
  getSleepLogs,
  getWaterLogs,
  clearAllData
} from '../services/storageService';

interface SettingsViewProps {
  user: UserProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onReset: () => void;
  onUpdateProfile: (updatedProfile: Partial<UserProfile>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  isDarkMode,
  onToggleDarkMode,
  onReset,
  onUpdateProfile
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempMotto, setTempMotto] = useState(user.motto || '');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB.');
      return;
    }
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpdateProfile({ avatar: base64 });
      setAvatarUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    onUpdateProfile({ avatar: undefined });
  };

  const userInitials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bmi = (user.weight / ((user.height / 100) ** 2)).toFixed(1);

  const handleSaveProfile = () => {
    onUpdateProfile({ name: tempName, motto: tempMotto });
    setEditingName(false);
  };

  const handleExportData = () => {
    const allData = {
      profile: user,
      timestamp: new Date().toISOString(),
      logs: {
        workouts: getWorkoutLogs(),
        meals: getMealLogs(),
        sleep: getSleepLogs(),
        water: getWaterLogs(),
      }
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aarogya-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (!data.profile || !data.logs) throw new Error("Invalid file format");
          onUpdateProfile(data.profile);
          if (data.logs.workouts) localStorage.setItem('aarogya_workout_logs', JSON.stringify(data.logs.workouts));
          if (data.logs.meals) localStorage.setItem('aarogya_meal_logs', JSON.stringify(data.logs.meals));
          if (data.logs.sleep) localStorage.setItem('aarogya_sleep_logs', JSON.stringify(data.logs.sleep));
          if (data.logs.water) localStorage.setItem('aarogya_water_logs', JSON.stringify(data.logs.water));
          alert("Data imported successfully! The application will now reload.");
          window.location.reload();
        } catch (err) {
          alert("Import failed. Please ensure the file is a valid Aarogya backup.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-32">
      {/* Profile Header */}
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Lotus size={200} /></div>
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative flex-shrink-0">
            {/* Hidden file input for avatar */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {/* Avatar circle with hover overlay */}
            <div
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-saffron-500 p-1 overflow-hidden shadow-2xl cursor-pointer group"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={() => avatarInputRef.current?.click()}
              title="Click to change profile picture"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-saffron-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-black text-3xl md:text-4xl tracking-tight">{userInitials}</span>
                </div>
              )}

              {/* Hover overlay */}
              <div className={`absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 ${avatarHover || avatarUploading ? 'opacity-100' : 'opacity-0'}`}>
                {avatarUploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Camera size={24} className="text-white" />
                    <span className="text-white text-[9px] font-black uppercase tracking-widest">{user.avatar ? 'Change' : 'Upload'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Award badge */}
            <div className="absolute -bottom-2 -right-2 bg-saffron-500 text-white p-2.5 rounded-full shadow-lg border-4 border-white dark:border-slate-900 z-10">
              <Award size={22} />
            </div>

            {/* Remove photo button — only shown when avatar exists */}
            {user.avatar && (
              <button
                onClick={handleRemoveAvatar}
                title="Remove profile picture"
                className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 z-20 transition-all hover:scale-110"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            {editingName ? (
              <div className="space-y-4 max-w-md animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Name</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-2xl font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 w-full focus:ring-2 focus:ring-saffron-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal Motto</label>
                  <input
                    type="text"
                    value={tempMotto}
                    onChange={(e) => setTempMotto(e.target.value)}
                    className="text-lg font-medium italic bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 w-full focus:ring-2 focus:ring-saffron-500 outline-none transition-all"
                    placeholder="Set a health motto..."
                  />
                </div>
                <div className="flex gap-4 justify-center md:justify-start pt-2">
                  <button onClick={handleSaveProfile} className="px-8 py-3 bg-saffron-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg glow-saffron transition-all hover:scale-105 active:scale-95">Save Profile</button>
                  <button onClick={() => setEditingName(false)} className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{user.name}</h2>
                  <button onClick={() => setEditingName(true)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-saffron-500 rounded-2xl transition-all hover:scale-110">
                    <Edit2 size={18} />
                  </button>
                </div>
                <p className="text-xl text-slate-400 dark:text-slate-500 font-medium italic mb-6">"{user.motto || 'Striving for better health every day.'}"</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-3 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <Scale size={16} className="text-saffron-500" /> {user.weight}kg • {user.height}cm
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 px-6 py-3 rounded-2xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-3 border border-emerald-100 dark:border-emerald-800 shadow-sm">
                    <Activity size={16} className="text-emerald-500" /> BMI: {bmi}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Wellness Personality Selection */}
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl text-emerald-600"><Lotus size={24} /></div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Wellness Personality</h3>
            <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5 uppercase">Personalizes your diet, workouts & coaching style</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 'Vata',
              label: 'Calm & Steady',
              icon: Wind,
              color: 'text-sky-500',
              bg: 'bg-sky-50 dark:bg-sky-900/20',
              tag: 'Creative · Flexible · Light',
              desc: 'Best suited for warm, grounding meals and gentle, rhythmic workouts.',
            },
            {
              id: 'Pitta',
              label: 'Driven & Focused',
              icon: Zap,
              color: 'text-orange-500',
              bg: 'bg-orange-50 dark:bg-orange-900/20',
              tag: 'Ambitious · Sharp · Intense',
              desc: 'Best suited for moderate-intensity training, cooling foods and balanced recovery.',
            },
            {
              id: 'Kapha',
              label: 'Strong & Grounded',
              icon: Activity,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50 dark:bg-emerald-900/20',
              tag: 'Steady · Resilient · Enduring',
              desc: 'Best suited for high-energy workouts, light spiced meals and early starts.',
            },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => onUpdateProfile({ dosha: type.id as any })}
              className={`flex flex-col items-center p-8 rounded-[2.5rem] border-2 transition-all group ${
                user.dosha === type.id
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-xl scale-105'
                  : 'border-slate-50 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/40 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              <div className={`p-5 rounded-3xl mb-4 transition-all group-hover:scale-110 ${type.bg} ${type.color}`}>
                <type.icon size={32} />
              </div>
              <span className="font-black text-slate-900 dark:text-white mb-1 text-sm tracking-tight text-center">{type.label}</span>
              <span className={`text-[9px] font-black uppercase tracking-widest mb-3 ${type.color}`}>{type.tag}</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center leading-relaxed px-2">{type.desc}</p>
              {user.dosha === type.id && (
                <div className="mt-4 flex items-center gap-1.5 text-[8px] font-black uppercase text-emerald-600 tracking-widest">
                  <CheckCircle size={10} /> Active
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* App Preferences */}
        <div className="glass-card p-10 md:p-12 rounded-[3rem] space-y-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <SettingsIcon size={16} /> Global Preferences
          </h3>
          <div className="space-y-4">
            <button
              onClick={onToggleDarkMode}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[2rem] transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] text-slate-600 dark:text-slate-300 group-hover:bg-saffron-100 dark:group-hover:bg-saffron-900/30 group-hover:text-saffron-600 transition-all">
                  {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">Theme Mode</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{isDarkMode ? 'Lunar Interface' : 'Solar Interface'}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>

            <div className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[2rem] transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-800 relative">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] text-slate-600 dark:text-slate-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-all">
                  <Globe size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">Coach Language</p>
                  <select
                    value={user.language}
                    onChange={(e) => onUpdateProfile({ language: e.target.value })}
                    className="bg-transparent border-none text-[10px] text-saffron-600 uppercase font-black outline-none cursor-pointer mt-1 tracking-widest w-full appearance-none"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{l}</option>)}
                  </select>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

            <button
              onClick={onReset}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[2rem] transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] text-slate-600 dark:text-slate-300 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-500 transition-all">
                  <LogOut size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">Sign Out</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Keep data, exit session</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="glass-card p-10 md:p-12 rounded-[3rem] space-y-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <RefreshCcw size={16} /> Backup & Restore
          </h3>
          <div className="space-y-4">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between p-5 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-[2rem] transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30"
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-[1.5rem] transition-all ${exportSuccess
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 group-hover:bg-blue-100'
                  }`}>
                  {exportSuccess ? <CheckCircle size={24} /> : <Download size={24} />}
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">Export Recovery</p>
                  <p className={`text-[10px] uppercase font-black tracking-widest mt-1 ${exportSuccess ? 'text-emerald-500' : 'text-slate-400'
                    }`}>
                    {exportSuccess ? 'Export Successful!' : 'Backup all logs to JSON'}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-5 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-[2rem] transition-all group border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-[1.5rem] group-hover:bg-emerald-100 transition-all">
                  <Upload size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">Import Recovery</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Restore from backup file</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />
              <ChevronRight size={18} className="text-slate-300" />
            </button>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-[2rem] transition-all group border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-[1.5rem] group-hover:bg-red-100 transition-all">
                  <Trash2 size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-tight">Factory Reset</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Erase everything</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border border-white/5 group">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-1000"><FileJson size={200} /></div>
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-saffron-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-saffron-500/20"><Info size={32} /></div>
            <div>
              <h4 className="text-3xl font-black uppercase tracking-tighter">Aarogya Protocol <span className="text-saffron-500 font-serif italic text-xl">v2.1</span></h4>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Neural Wellness OS for India</p>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed max-w-2xl font-medium text-lg italic">
            Aarogya AI merges native nutritional wisdom with state-of-the-art synthetic intelligence.
            Your data resides exclusively within your local machine, ensuring absolute sovereignty over your physiological history.
          </p>
          <div className="pt-8 border-t border-white/5 flex gap-12">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Privacy</p>
              <p className="text-sm font-bold text-white flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> 100% On-Device</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intelligence</p>
              <p className="text-sm font-bold text-white flex items-center gap-2"><Zap size={14} className="text-saffron-500" /> Gemini 3 Flash</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-sm p-12 space-y-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-inner">
              <ShieldAlert size={48} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Purge Data?</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed italic px-2">This action is irreversible. All your logs, achievements, and identity data will be permanently erased.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  clearAllData();
                  onReset();
                }}
                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-[1.8rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-red-200 dark:shadow-none transition-all hover:scale-105"
              >
                Erase Everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-[1.8rem] font-black uppercase text-xs tracking-[0.2em] transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
