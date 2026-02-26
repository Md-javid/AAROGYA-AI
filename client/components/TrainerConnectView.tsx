
import React, { useState } from 'react';
import {
    User, Star, MessageCircle, Award, Dumbbell, Heart, Send,
    CheckCircle, Clock, Globe, Zap, ChevronRight, X, Phone,
    Video, Calendar, Filter, Search, Sparkles, Shield
} from 'lucide-react';

interface Trainer {
    id: string;
    name: string;
    avatar: string;
    specialty: string[];
    rating: number;
    reviews: number;
    experience: string;
    clients: number;
    price: string;
    priceUnit: string;
    bio: string;
    languages: string[];
    available: boolean;
    verified: boolean;
    badges: string[];
    location: string;
    mode: ('online' | 'in-person' | 'both')[];
}

interface Message {
    id: string;
    from: 'user' | 'trainer';
    text: string;
    time: string;
}

const TRAINERS: Trainer[] = [
    {
        id: '1', name: 'Arjun Mehta', avatar: 'https://i.pravatar.cc/150?img=11',
        specialty: ['Weight Loss', 'Strength Training', 'HIIT'],
        rating: 4.9, reviews: 214, experience: '8 years', clients: 120, price: '₹500', priceUnit: '/session',
        bio: 'Certified personal trainer with 8 years of experience helping clients achieve their dream physique. Specializes in science-backed fat loss and muscle building.',
        languages: ['English', 'Hindi', 'Marathi'], available: true, verified: true,
        badges: ['Top Rated', 'Pro Certified', '100+ Clients'],
        location: 'Mumbai', mode: ['both'],
    },
    {
        id: '2', name: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?img=47',
        specialty: ['Yoga', 'Flexibility', 'Stress Relief', 'Prenatal Fitness'],
        rating: 4.8, reviews: 178, experience: '6 years', clients: 95, price: '₹400', priceUnit: '/session',
        bio: 'Certified yoga instructor and wellness coach. Passionate about holistic health, mindfulness, and helping clients find balance in their busy lives.',
        languages: ['English', 'Hindi', 'Tamil'], available: true, verified: true,
        badges: ['Yoga Expert', 'Wellness Coach'],
        location: 'Chennai', mode: ['online', 'in-person'],
    },
    {
        id: '3', name: 'Rahul Verma', avatar: 'https://i.pravatar.cc/150?img=15',
        specialty: ['Bodybuilding', 'Powerlifting', 'Sports Nutrition'],
        rating: 4.7, reviews: 143, experience: '10 years', clients: 200, price: '₹700', priceUnit: '/session',
        bio: 'Former national-level powerlifter turned coach. I help serious athletes and beginners alike build real, lasting strength with proper form and nutrition.',
        languages: ['English', 'Hindi', 'Punjabi'], available: false, verified: true,
        badges: ['Elite Trainer', 'Nutrition Expert', '200+ Clients'],
        location: 'Delhi', mode: ['both'],
    },
    {
        id: '4', name: 'Sneha Iyer', avatar: 'https://i.pravatar.cc/150?img=45',
        specialty: ['Zumba', 'Dance Fitness', 'Cardio', 'Weight Management'],
        rating: 4.9, reviews: 267, experience: '5 years', clients: 150, price: '₹350', priceUnit: '/session',
        bio: 'Make fitness fun! I blend dance, cardio, and energy to create workouts you\'ll actually look forward to. Suitable for all ages and fitness levels.',
        languages: ['English', 'Tamil', 'Telugu'], available: true, verified: true,
        badges: ['Top Rated', 'Fun Coach'],
        location: 'Bangalore', mode: ['online'],
    },
    {
        id: '5', name: 'Vikram Singh', avatar: 'https://i.pravatar.cc/150?img=13',
        specialty: ['Calisthenics', 'Functional Fitness', 'Mobility'],
        rating: 4.6, reviews: 89, experience: '4 years', clients: 60, price: '₹450', priceUnit: '/session',
        bio: 'No gym? No problem. I teach bodyweight training and functional movement patterns that build real-world strength and athleticism anywhere.',
        languages: ['English', 'Hindi'], available: true, verified: false,
        badges: ['Calisthenics Pro'],
        location: 'Pune', mode: ['online', 'in-person'],
    },
    {
        id: '6', name: 'Dr. Ananya Krishnan', avatar: 'https://i.pravatar.cc/150?img=44',
        specialty: ['Physiotherapy', 'Injury Rehab', 'Senior Fitness', 'Posture Correction'],
        rating: 5.0, reviews: 112, experience: '12 years', clients: 80, price: '₹900', priceUnit: '/session',
        bio: 'Physiotherapist and certified fitness coach. I specialize in helping people recover from injuries, correct posture, and safely return to an active lifestyle.',
        languages: ['English', 'Tamil', 'Malayalam'], available: true, verified: true,
        badges: ['Doctor', 'Physio Expert', 'Top Rated'],
        location: 'Hyderabad', mode: ['both'],
    },
];

const BADGE_COLORS: Record<string, string> = {
    'Top Rated': 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'Pro Certified': 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Elite Trainer': 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    'Doctor': 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Yoga Expert': 'bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
};

const TrainerConnectView: React.FC = () => {
    const [search, setSearch] = useState('');
    const [filterMode, setFilterMode] = useState<string>('all');
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', from: 'trainer', text: 'Hi! I\'m excited to help you reach your fitness goals. What are you looking to achieve?', time: '10:00 AM' },
    ]);
    const [inputMsg, setInputMsg] = useState('');
    const [savedTrainers, setSavedTrainers] = useState<string[]>([]);
    const [bookingTrainer, setBookingTrainer] = useState<Trainer | null>(null);

    const filtered = TRAINERS.filter(t => {
        const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.specialty.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
            t.location.toLowerCase().includes(search.toLowerCase());
        const matchMode = filterMode === 'all' || t.mode.includes(filterMode as any);
        return matchSearch && matchMode;
    });

    const sendMessage = () => {
        if (!inputMsg.trim()) return;
        const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { id: Date.now().toString(), from: 'user', text: inputMsg, time: now }]);
        setInputMsg('');
        // Simulate trainer reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(), from: 'trainer',
                text: 'Great question! Let me put together a personalised plan for you. Can you share your current fitness level and any injuries?',
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-32">

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-indigo-950 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl border border-white/5">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-saffron-500 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-violet-400 text-[10px] font-black uppercase tracking-[0.4em]">
                            <Sparkles size={14} className="animate-pulse" /> Trainer Connect
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-300">Trainer</span></h2>
                        <p className="text-slate-400 font-medium max-w-md">Connect with certified personal trainers online or in-person. Chat, book sessions, and transform your fitness journey.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[{ n: '50+', l: 'Trainers' }, { n: '4.8★', l: 'Avg Rating' }, { n: '10K+', l: 'Sessions' }].map(s => (
                            <div key={s.l} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-2xl font-black text-white">{s.n}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, specialty, or city..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'online', 'in-person'].map(m => (
                        <button key={m} onClick={() => setFilterMode(m)}
                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterMode === m ? 'bg-violet-600 text-white border-violet-600 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-violet-300'}`}>
                            {m === 'all' ? 'All' : m === 'online' ? '🌐 Online' : '📍 In-Person'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trainer Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((trainer, i) => (
                    <div key={trainer.id} className="glass-card rounded-[2.5rem] p-7 border border-white/20 group hover:border-violet-300/50 transition-all" style={{ animationDelay: `${i * 80}ms` }}>

                        {/* Header */}
                        <div className="flex items-start gap-4 mb-5">
                            <div className="relative flex-shrink-0">
                                <img src={trainer.avatar} alt={trainer.name} className="w-16 h-16 rounded-2xl object-cover" />
                                {trainer.available && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="font-black text-base text-slate-900 dark:text-white truncate">{trainer.name}</h3>
                                    {trainer.verified && <Shield size={13} className="text-blue-500 flex-shrink-0" />}
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">{trainer.location} · {trainer.experience} exp</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star size={11} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{trainer.rating}</span>
                                    <span className="text-[10px] text-slate-400">({trainer.reviews})</span>
                                </div>
                            </div>
                            <button onClick={() => setSavedTrainers(prev => prev.includes(trainer.id) ? prev.filter(id => id !== trainer.id) : [...prev, trainer.id])}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${savedTrainers.includes(trainer.id) ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Heart size={13} className={savedTrainers.includes(trainer.id) ? 'fill-white' : ''} />
                            </button>
                        </div>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {trainer.specialty.slice(0, 3).map(s => (
                                <span key={s} className="px-2.5 py-1 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-violet-100 dark:border-violet-900/30">{s}</span>
                            ))}
                            {trainer.specialty.length > 3 && <span className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl text-[9px] font-black">+{trainer.specialty.length - 3}</span>}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {trainer.badges.slice(0, 2).map(b => (
                                <span key={b} className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${BADGE_COLORS[b] || 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>{b}</span>
                            ))}
                        </div>

                        {/* Mode + Price */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex gap-1.5">
                                {trainer.mode.map(m => (
                                    <span key={m} className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${m === 'online' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'}`}>
                                        {m === 'online' ? '🌐' : '📍'} {m}
                                    </span>
                                ))}
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-black text-slate-900 dark:text-white">{trainer.price}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{trainer.priceUnit}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setSelectedTrainer(trainer); setChatOpen(true); setMessages([{ id: '1', from: 'trainer', text: `Hi! I'm ${trainer.name}. I'm excited to help you reach your fitness goals. What are you looking to achieve?`, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }]); }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105"
                            >
                                <MessageCircle size={13} /> Message
                            </button>
                            <button
                                onClick={() => setBookingTrainer(trainer)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-saffron-500 hover:bg-saffron-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105"
                            >
                                <Calendar size={13} /> Book
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Modal */}
            {chatOpen && selectedTrainer && (
                <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-slide-up" style={{ height: '80vh', maxHeight: 600 }}>
                        {/* Chat Header */}
                        <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-600 to-purple-600">
                            <img src={selectedTrainer.avatar} alt={selectedTrainer.name} className="w-11 h-11 rounded-2xl object-cover border-2 border-white/30" />
                            <div className="flex-1">
                                <h4 className="font-black text-white">{selectedTrainer.name}</h4>
                                <p className="text-[10px] text-violet-200 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online now</p>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all font-bold text-lg">×</button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.from === 'trainer' && <img src={selectedTrainer.avatar} alt="" className="w-8 h-8 rounded-xl object-cover mr-2 flex-shrink-0 self-end" />}
                                    <div className={`max-w-[75%] ${msg.from === 'user' ? 'bg-violet-600 text-white rounded-3xl rounded-br-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-3xl rounded-bl-lg'} px-4 py-3`}>
                                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                        <p className={`text-[9px] mt-1 ${msg.from === 'user' ? 'text-violet-200' : 'text-slate-400'}`}>{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <input
                                type="text"
                                value={inputMsg}
                                onChange={e => setInputMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                            <button onClick={sendMessage} className="w-12 h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl flex items-center justify-center transition-all hover:scale-105">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {bookingTrainer && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setBookingTrainer(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-sm shadow-2xl p-8 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <img src={bookingTrainer.avatar} alt={bookingTrainer.name} className="w-20 h-20 rounded-3xl object-cover mx-auto mb-3 border-4 border-violet-100 dark:border-violet-900" />
                            <h3 className="font-black text-xl text-slate-900 dark:text-white">{bookingTrainer.name}</h3>
                            <p className="text-sm text-slate-400">{bookingTrainer.price}{bookingTrainer.priceUnit}</p>
                        </div>
                        <div className="space-y-3 mb-6">
                            {['Mon, Feb 19 · 7:00 AM', 'Mon, Feb 19 · 10:00 AM', 'Tue, Feb 20 · 6:00 PM', 'Wed, Feb 21 · 8:00 AM'].map(slot => (
                                <button key={slot} className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:border-violet-300 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-slate-700 dark:text-slate-300 transition-all text-left flex items-center gap-3">
                                    <Calendar size={14} className="text-violet-500" /> {slot}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => { alert(`Session booked with ${bookingTrainer.name}! You'll receive a confirmation shortly.`); setBookingTrainer(null); }}
                            className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105">
                            Confirm Booking
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerConnectView;
