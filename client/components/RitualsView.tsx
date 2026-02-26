
import React, { useState } from 'react';
import { UserProfile, Ritual } from '../types';
import { Clock, CheckCircle2, Sun, Moon, Info, Sparkles, Coffee, Flower2 as Lotus } from 'lucide-react';

interface RitualsViewProps {
   user: UserProfile;
   isDarkMode: boolean;
}

const RitualsView: React.FC<RitualsViewProps> = ({ user, isDarkMode }) => {
   const [rituals, setRituals] = useState<Ritual[]>([
      { id: '1', time: '05:00', name: 'Early Morning Wake-Up', description: 'Wake up early before sunrise for peak mental clarity and a calm, focused start to your day.', isCompleted: false, category: 'Morning' },
      { id: '2', time: '06:30', name: 'Tongue Cleaning', description: 'Gently clean your tongue each morning to remove bacteria and improve oral hygiene.', isCompleted: false, category: 'Morning' },
      { id: '3', time: '07:00', name: 'Oil Pulling', description: 'Swish sesame or coconut oil in your mouth for 5–10 minutes to strengthen teeth and gums.', isCompleted: false, category: 'Morning' },
      { id: '4', time: '08:00', name: 'Morning Exercise', description: 'Do your daily workout or yoga to energize your body and balance your energy levels.', isCompleted: false, category: 'Morning' },
      { id: '5', time: '13:00', name: 'Main Meal of the Day', description: 'Eat your biggest and most nutritious meal at midday when your digestion is strongest.', isCompleted: false, category: 'Afternoon' },
      { id: '6', time: '21:30', name: 'Wind-Down Routine', description: 'Foot massage and screen-free time before bed for deep, restful sleep.', isCompleted: false, category: 'Evening' },
   ]);

   const toggleRitual = (id: string) => {
      setRituals(prev => prev.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
   };

   const progress = Math.round((rituals.filter(r => r.isCompleted).length / rituals.length) * 100);

   return (
      <div className="space-y-12 animate-fadeIn pb-32">
         <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12"><Lotus size={240} /></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="space-y-6 text-center md:text-left max-w-xl">
                  <h2 className="text-[10px] font-black text-saffron-400 uppercase tracking-[0.6em] flex items-center justify-center md:justify-start gap-3">
                     <Sparkles size={18} /> Daily Habits & Routines
                  </h2>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">Build a Healthy Daily Routine.</h3>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed opacity-80 italic">A consistent daily routine helps maintain your energy, focus, and overall well-being.</p>
               </div>
               <div className="flex flex-col items-center justify-center p-10 bg-white/5 rounded-[3rem] border border-white/10 w-56 h-56 backdrop-blur-sm shadow-inner">
                  <span className="text-5xl font-black text-saffron-400 tracking-tighter">{progress}%</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Completed</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 relative">
               {/* Center Line */}
               <div className="absolute left-[2rem] top-8 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800 to-transparent z-0"></div>

               <div className="space-y-10 relative z-10">
                  {rituals.map((ritual) => (
                     <div key={ritual.id} className="flex gap-8 group">
                        <button
                           onClick={() => toggleRitual(ritual.id)}
                           className={`relative z-10 w-16 h-16 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center transition-all duration-500 shadow-lg ${ritual.isCompleted
                                 ? 'bg-saffron-500 text-white glow-saffron scale-110'
                                 : 'bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-300 hover:border-saffron-300 dark:hover:border-saffron-900'
                              }`}
                        >
                           {ritual.category === 'Morning' ? <Sun size={24} strokeWidth={2} /> : ritual.category === 'Evening' ? <Moon size={24} strokeWidth={2} /> : <Coffee size={24} strokeWidth={2} />}
                        </button>

                        <div
                           onClick={() => toggleRitual(ritual.id)}
                           className={`flex-1 p-8 rounded-[2.5rem] border transition-all cursor-pointer shadow-sm group-hover:shadow-md group-hover:translate-x-2 duration-300 ${ritual.isCompleted
                                 ? 'bg-saffron-50/50 dark:bg-saffron-950/20 border-saffron-200 dark:border-saffron-900/40'
                                 : 'glass-card border-slate-100 dark:border-slate-800 hover:border-saffron-200 dark:hover:border-saffron-900/40'
                              }`}
                        >
                           <div className="flex justify-between items-center mb-4">
                              <h4 className={`font-black uppercase text-sm tracking-tight ${ritual.isCompleted ? 'text-saffron-700 dark:text-saffron-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                 {ritual.name}
                              </h4>
                              <span className="text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">{ritual.time}</span>
                           </div>
                           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic opacity-90">"{ritual.description}"</p>
                           {ritual.isCompleted && (
                              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-fadeIn">
                                 <CheckCircle2 size={16} /> Habit Complete
                              </div>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="space-y-8">
               <div className="glass-card p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden sticky top-32">
                  <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Info size={100} /></div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
                     <Info size={16} /> Why Daily Habits Matter
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                     "Small, consistent habits done daily are the foundation of lasting health. By aligning your routine with your body's natural rhythms, you improve energy, focus, and long-term well-being."
                  </p>
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Key Benefit</p>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Stabilizes your nervous system and improves sleep, digestion, and mental clarity.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default RitualsView;
