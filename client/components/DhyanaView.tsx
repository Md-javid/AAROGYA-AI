
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { generateVedicStoryText, generateVedicStoryAudio } from '../services/geminiService';
import {
  Flower2 as Lotus,
  Wind,
  Moon,
  Sun,
  Play,
  Pause,
  RefreshCcw,
  Target,
  Sparkles,
  Loader2,
  Volume2,
  Headphones,
  FileText,
  StopCircle
} from 'lucide-react';

interface DhyanaViewProps {
  user: UserProfile;
  isDarkMode: boolean;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const DhyanaView: React.FC<DhyanaViewProps> = ({ user, isDarkMode }) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [currentPose, setCurrentPose] = useState(0);

  // Sleep Story State
  const [storyText, setStoryText] = useState<string | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  const yogaFlow = timeOfDay === 'Morning'
    ? [{ name: 'Sun Salutation', duration: '5 mins', benefit: 'Energizing' }, { name: 'Mountain Pose', duration: '2 mins', benefit: 'Posture & Balance' }]
    : [{ name: 'Moon Flow Stretch', duration: '5 mins', benefit: 'Calming' }, { name: "Child's Pose", duration: '2 mins', benefit: 'Stress Relief' }];

  useEffect(() => {
    let timer: any;
    if (sessionActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) setSessionActive(false);
    return () => clearInterval(timer);
  }, [sessionActive, timeLeft]);

  useEffect(() => {
    return () => {
      sourceNodeRef.current?.stop();
    };
  }, []);

  const handleGenerateStory = async () => {
    setStoryText(null);
    setIsGeneratingText(true);
    try {
      const text = await generateVedicStoryText(user);
      setStoryText(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleReadAloud = async () => {
    if (!storyText) return;
    if (isPlayingAudio) {
      sourceNodeRef.current?.stop();
      setIsPlayingAudio(false);
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const base64Audio = await generateVedicStoryAudio(storyText);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }

        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlayingAudio(false);

        source.start(0);
        sourceNodeRef.current = source;
        setIsPlayingAudio(true);
      }
    } catch (e) {
      console.error(e);
      alert("Audio playback failed. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="relative overflow-hidden bg-emerald-900 rounded-[3rem] p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10"><Lotus size={160} /></div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Yoga & Calm</h2>
          <h3 className="text-3xl font-black italic">"{timeOfDay} Flow: Relax and Recharge."</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Vedic Nidra Feature */}
          <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/50 to-transparent"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Moon size={48} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                    <Sparkles size={14} /> Guided Sleep Stories
                  </h4>
                  <h3 className="text-2xl font-black text-white">Sleep Stories</h3>
                </div>
                <button
                  onClick={handleGenerateStory}
                  disabled={isGeneratingText}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isGeneratingText ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                  {isGeneratingText ? 'Writing...' : 'Generate New Story'}
                </button>
              </div>

              {storyText && (
                <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 animate-fadeIn">
                  <p className="text-slate-300 text-lg italic leading-relaxed font-serif mb-8">
                    "{storyText}"
                  </p>
                  <div className="flex justify-center md:justify-start">
                    <button
                      onClick={handleReadAloud}
                      disabled={isGeneratingAudio}
                      className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${isPlayingAudio
                        ? 'bg-red-600 text-white'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        } disabled:opacity-50 shadow-lg`}
                    >
                      {isGeneratingAudio ? <Loader2 className="animate-spin" size={18} /> : isPlayingAudio ? <StopCircle size={18} /> : <Volume2 size={18} />}
                      {isGeneratingAudio ? 'Syncing Voice...' : isPlayingAudio ? 'Stop Narrator' : 'Read Aloud'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="relative w-64 h-64 mb-10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="120" fill="transparent" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} strokeWidth="8" />
                <circle cx="50%" cy="50%" r="120" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray={753.6} strokeDashoffset={753.6 * (1 - timeLeft / 600)} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSessionActive(!sessionActive)} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3">
                {sessionActive ? <Pause size={18} /> : <Play size={18} />} {sessionActive ? 'Pause' : 'Start Flow'}
              </button>
              <button onClick={() => setTimeLeft(600)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl"><RefreshCcw size={18} /></button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Target size={14} /> Sequence</h3>
          <div className="space-y-4">
            {yogaFlow.map((pose, i) => (
              <div key={i} className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${currentPose === i ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' : 'bg-white dark:bg-slate-900 border-slate-100'}`} onClick={() => setCurrentPose(i)}>
                <h4 className="font-black uppercase text-sm">{pose.name}</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">{pose.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DhyanaView;
