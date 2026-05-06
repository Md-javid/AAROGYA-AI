
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)' }}>
      <div className="w-full max-w-md rounded-[2.5rem] relative overflow-hidden text-center"
        style={{ background: 'rgba(10,14,32,0.92)', backdropFilter: 'blur(40px)', border: '1.5px solid rgba(255,255,255,0.13)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
        <button onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl flex items-center justify-center z-10 hover:scale-110 transition-all"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <X size={18} className="text-white/70" />
        </button>

        <div className="p-8 space-y-6">
          <div>
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#a855f7)' }}>
              <Mic size={20} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-white">Voice Log</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Speak to log meals or workouts</p>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            {isRecording && (
              <>
                <div className="absolute w-32 h-32 rounded-full animate-ping" style={{ background: 'rgba(249,115,22,0.15)' }} />
                <div className="absolute w-44 h-44 rounded-full animate-pulse" style={{ background: 'rgba(249,115,22,0.07)' }} />
              </>
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              style={isRecording
                ? { background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 0 40px rgba(239,68,68,0.5)' }
                : { background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 0 40px rgba(249,115,22,0.4)' }}>
              {isProcessing ? <Loader2 className="animate-spin" size={36} /> : <Mic size={36} />}
            </button>
          </div>

          <div className="min-h-[90px] flex flex-col items-center justify-center">
            {isRecording ? (
              <p className="font-black uppercase text-[10px] tracking-widest text-orange-400 animate-pulse">Listening carefully...</p>
            ) : isProcessing ? (
              <p className="font-black uppercase text-[10px] tracking-widest text-indigo-400 flex items-center gap-2">
                <Sparkles size={12} /> AI analysing your voice...
              </p>
            ) : result ? (
              <div className="w-full p-5 rounded-2xl animate-fadeIn"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div className="flex items-center justify-center gap-2 text-emerald-400 mb-3">
                  <CheckCircle size={18} />
                  <span className="font-black text-xs uppercase tracking-wider">Auto-Logged!</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: result.type === 'meal' ? 'rgba(249,115,22,0.2)' : 'rgba(99,102,241,0.2)' }}>
                    {result.type === 'meal'
                      ? <Utensils size={18} className="text-orange-400" />
                      : <Zap size={18} className="text-indigo-400" />}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-white text-sm">{result.items || result.workoutType}</p>
                    <p className="text-white/40 text-xs">{result.calories || result.caloriesBurned} kcal accounted for</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-white/30 text-sm italic">"I had dal chawal for lunch..."</p>
                <p className="text-white/20 text-[10px] uppercase font-black">Tap the mic to start</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceLogModal;
