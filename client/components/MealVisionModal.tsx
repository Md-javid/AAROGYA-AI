
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)' }}>
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto scrollbar-hide relative rounded-[2.5rem]"
        style={{ background: 'rgba(10,14,32,0.92)', backdropFilter: 'blur(40px)', border: '1.5px solid rgba(255,255,255,0.13)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
        <button onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl flex items-center justify-center z-10 hover:scale-110 transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <X size={18} className="text-white/70" />
        </button>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}>
              <Camera size={20} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-orange-400" /> Meal Vision
            </h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">AI Nutrition Scanner</p>
          </div>

          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-[2rem] h-56 flex flex-col items-center justify-center cursor-pointer hover:scale-[1.01] transition-all group"
              style={{ background: 'rgba(249,115,22,0.08)', border: '2px dashed rgba(249,115,22,0.35)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                style={{ background: 'rgba(249,115,22,0.18)' }}>
                <Camera size={28} className="text-orange-400" />
              </div>
              <p className="font-black text-white/60 text-sm">Tap to snap or upload meal</p>
              <p className="text-white/30 text-xs mt-1">JPG, PNG, WEBP supported</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="relative rounded-[2rem] overflow-hidden" style={{ border: '1.5px solid rgba(255,255,255,0.1)' }}>
                <img src={image} alt="Meal" className="w-full h-auto object-cover max-h-72" />
                {isAnalyzing && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-orange-400" size={40} />
                      <p className="text-white font-black uppercase text-[9px] tracking-[0.3em] animate-pulse">Analysing Nutrition...</p>
                    </div>
                  </div>
                )}
              </div>

              {!result ? (
                <button onClick={handleAnalyze} disabled={isAnalyzing}
                  className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}>
                  <Sparkles size={14} /> Analyse Meal <ChevronRight size={14} />
                </button>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <Flame size={16} />, value: result.calories, label: 'Kcal', color: '#f97316' },
                      { icon: <Zap size={16} />, value: result.macronutrients.protein, label: 'Protein', color: '#6366f1' },
                      { icon: <Heart size={16} />, value: `${result.healthScore}/100`, label: 'Score', color: '#10b981' },
                    ].map((s, i) => (
                      <div key={i} className="p-4 rounded-2xl text-center"
                        style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                        <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                        <span className="block text-lg font-black text-white">{s.value}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${s.color}99` }}>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <h4 className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Sparkles size={12} /> Ayurvedic Insight
                    </h4>
                    <p className="italic text-white/70 text-sm leading-relaxed">"{result.ayurvedicInsight}"</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => onLogged(result)}
                      className="flex-1 py-3.5 rounded-2xl font-black uppercase text-[9px] tracking-widest text-white flex items-center justify-center gap-2 hover:scale-105 transition-all"
                      style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                      <CheckCircle2 size={14} /> Add to Diary
                    </button>
                    <button onClick={() => { setImage(null); setResult(null); }}
                      className="px-5 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all hover:scale-105"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
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
