
import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, Sparkles, AlertCircle, Dumbbell, ShieldCheck, ChevronRight } from 'lucide-react';
import { analyzeWorkoutImage } from '../services/geminiService';
import { WorkoutVisionResult } from '../types';

interface WorkoutVisionModalProps {
  onClose: () => void;
}

const WorkoutVisionModal: React.FC<WorkoutVisionModalProps> = ({ onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<WorkoutVisionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const base64 = image.split(',')[1];
      const data = await analyzeWorkoutImage(base64);
      setResult(data);
    } catch (e) {
      alert("Analysis failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide border border-slate-100 dark:border-slate-800 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-colors z-10"><X size={24} /></button>

        <div className="p-10 space-y-8">
           <div className="text-center">
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-3">
                <Sparkles className="text-indigo-500" /> Form Guard
              </h3>
              <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">AI Movement & Equipment Analyzer</p>
           </div>

           {!image ? (
             <div
               onClick={() => fileInputRef.current?.click()}
               className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
             >
                <div className="p-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                   <Camera size={40} />
                </div>
                <p className="mt-4 font-bold text-slate-500">Tap to check form or scan equipment</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
             </div>
           ) : (
             <div className="space-y-6">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                   <img src={image} alt="Workout" className="w-full h-auto object-cover max-h-80" />
                   {isAnalyzing && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                           <Loader2 className="animate-spin text-white" size={48} />
                           <p className="text-white font-black uppercase text-xs tracking-[0.2em] animate-pulse">Analyzing Biomechanics...</p>
                        </div>
                     </div>
                   )}
                </div>

                {!result ? (
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                  >
                    Analyze Movement <ChevronRight size={20} />
                  </button>
                ) : (
                  <div className="space-y-6 animate-tabTransition">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                             <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{result.identifiedExercise}</h4>
                             <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.safetyRating > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                 Safety Score: {result.safetyRating}/100
                             </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {result.musclesWorked.map(m => (
                                <span key={m} className="px-2 py-1 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] uppercase font-bold rounded-lg border border-slate-200 dark:border-slate-600">
                                    {m}
                                </span>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl mt-1"><ShieldCheck size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Form Analysis</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{result.formAnalysis}</p>
                                </div>
                            </div>
                             <div className="flex gap-4 items-start">
                                <div className="p-2 bg-saffron-100 dark:bg-saffron-900/30 text-saffron-600 rounded-xl mt-1"><AlertCircle size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pro Tip</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{result.tip}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                       <button
                         onClick={() => { setImage(null); setResult(null); }}
                         className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800"
                       >
                          Analyze Another
                       </button>
                    </div>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutVisionModal;
