
import React, { useState, useRef } from 'react';
import { Camera, X, Loader2, Sparkles, Flame, Zap, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
import { analyzeMealImage } from '../services/geminiService';
import { MealVisionResult } from '../types';

interface MealVisionModalProps {
  onClose: () => void;
  onLogged: (result: MealVisionResult) => void;
}

const MealVisionModal: React.FC<MealVisionModalProps> = ({ onClose, onLogged }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MealVisionResult | null>(null);
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
      const data = await analyzeMealImage(base64);
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
                <Sparkles className="text-orange-500" /> Aarogya Drishti
              </h3>
              <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">AI Augmented Nutrition Scanner</p>
           </div>

           {!image ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
             >
                <div className="p-5 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 group-hover:scale-110 transition-transform">
                   <Camera size={40} />
                </div>
                <p className="mt-4 font-bold text-slate-500">Tap to snap or upload meal</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
             </div>
           ) : (
             <div className="space-y-6">
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                   <img src={image} alt="Meal" className="w-full h-auto object-cover max-h-80" />
                   {isAnalyzing && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                           <Loader2 className="animate-spin text-white" size={48} />
                           <p className="text-white font-black uppercase text-xs tracking-[0.2em] animate-pulse">Scanning Prana...</p>
                        </div>
                     </div>
                   )}
                </div>
                
                {!result ? (
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3"
                  >
                    Analyze Sattvic Profile <ChevronRight size={20} />
                  </button>
                ) : (
                  <div className="space-y-6 animate-tabTransition">
                    <div className="grid grid-cols-3 gap-4">
                       <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl text-center">
                          <Flame className="mx-auto text-orange-500 mb-1" size={20} />
                          <span className="block text-lg font-black">{result.calories}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Kcal</span>
                       </div>
                       <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-center">
                          <Zap className="mx-auto text-blue-500 mb-1" size={20} />
                          <span className="block text-lg font-black">{result.macronutrients.protein}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Protein</span>
                       </div>
                       <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-center">
                          <Heart className="mx-auto text-emerald-500 mb-1" size={20} />
                          <span className="block text-lg font-black">{result.healthScore}/100</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Score</span>
                       </div>
                    </div>
                    
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white border border-white/5">
                       <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Sparkles size={14} /> Ayurvedic Insight
                       </h4>
                       <p className="italic font-medium text-slate-300 leading-relaxed">"{result.ayurvedicInsight}"</p>
                    </div>

                    <div className="flex gap-4">
                       <button 
                         onClick={() => onLogged(result)} 
                         className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                       >
                          <CheckCircle2 size={18} /> Add to Diary
                       </button>
                       <button 
                         onClick={() => { setImage(null); setResult(null); }}
                         className="px-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-xs"
                       >
                          Retake
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

export default MealVisionModal;
