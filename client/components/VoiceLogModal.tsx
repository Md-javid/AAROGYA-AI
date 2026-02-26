
import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Loader2, CheckCircle, Flame, Utensils, Zap, Sparkles } from 'lucide-react';
import { processVoiceLog } from '../services/geminiService';
import { saveWorkoutLog, saveMealLog } from '../services/storageService';

interface VoiceLogModalProps {
  onClose: () => void;
  onLogged: () => void;
}

const VoiceLogModal: React.FC<VoiceLogModalProps> = ({ onClose, onLogged }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsProcessing(true);
          try {
            const data = await processVoiceLog(base64Audio, 'audio/webm');
            setResult(data);
            if (data.type === 'meal') {
              saveMealLog({
                date: new Date().toISOString().split('T')[0],
                mealType: data.mealType,
                items: data.items,
                calories: data.calories
              });
            } else if (data.type === 'workout') {
              saveWorkoutLog({
                date: new Date().toISOString().split('T')[0],
                type: data.workoutType,
                durationMinutes: data.duration,
                intensity: data.intensity,
                caloriesBurned: data.caloriesBurned
              });
            }
            onLogged();
          } catch (e) { console.error(e); } finally { setIsProcessing(false); }
        };
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) { alert("Microphone access denied."); onClose(); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  useEffect(() => {
    return () => mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 relative overflow-hidden text-center shadow-2xl border border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        
        <div className="space-y-8">
           <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">Aarogya Vani</h3>
              <p className="text-slate-500 text-sm font-medium">Log your journey with just your voice.</p>
           </div>

           <div className="relative h-48 flex items-center justify-center">
              {isRecording && <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-orange-500/20 rounded-full animate-ping"></div>
                <div className="absolute w-40 h-40 bg-orange-500/10 rounded-full animate-pulse"></div>
              </div>}
              
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${isRecording ? 'bg-red-500 scale-110' : 'bg-orange-600 hover:scale-105'}`}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={40} /> : <Mic size={40} />}
              </button>
           </div>

           <div className="min-h-[100px] flex flex-col items-center justify-center text-center">
              {isRecording ? (
                <p className="text-orange-600 font-black animate-pulse uppercase text-xs tracking-widest">Listening carefully...</p>
              ) : isProcessing ? (
                <div className="space-y-3">
                  <p className="text-indigo-600 font-black uppercase text-xs tracking-widest flex items-center gap-2"><Sparkles size={14}/> AI Analyzing context...</p>
                </div>
              ) : result ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800 animate-fadeIn w-full">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                    <CheckCircle size={20} />
                    <span className="font-black text-sm uppercase">Auto-Logged</span>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                     <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                        {result.type === 'meal' ? <Utensils size={24} className="text-orange-500" /> : <Zap size={24} className="text-indigo-500" />}
                     </div>
                     <div className="text-left">
                        <p className="font-bold text-slate-700 dark:text-slate-200">{result.items || result.workoutType}</p>
                        <p className="text-xs text-slate-500">{result.calories || result.caloriesBurned} kcal accounted for.</p>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                   <p className="text-slate-400 text-sm font-medium italic">"I had a healthy thali for lunch with rotis..."</p>
                   <p className="text-slate-300 text-[10px] uppercase font-black">Tap to start speaking</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceLogModal;
