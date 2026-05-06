
import React, { useState, useEffect } from 'react';
import {
  Watch, Bluetooth, BluetoothConnected, Wifi, WifiOff,
  Heart, Footprints, Flame, Moon, Activity, RefreshCw,
  CheckCircle2, XCircle, ChevronRight, Zap, Smartphone,
  Signal, BatteryFull, Clock, TrendingUp, Unplug
} from 'lucide-react';

interface WearableDevice {
  id: string;
  name: string;
  brand: string;
  logo: string;
  color: string;
  glow: string;
  capabilities: string[];
  description: string;
}

interface ConnectedDevice {
  id: string;
  connectedAt: string;
  lastSync: string;
  battery: number;
  steps: number;
  heartRate: number;
  calories: number;
  sleepHours: number;
}

const WEARABLE_DEVICES: WearableDevice[] = [
  {
    id: 'apple-watch',
    name: 'Apple Watch',
    brand: 'Apple',
    logo: '⌚',
    color: '#A3AAAE',
    glow: 'rgba(163,170,174,0.3)',
    capabilities: ['Heart Rate', 'Steps', 'Calories', 'Sleep', 'Blood Oxygen', 'ECG'],
    description: 'Sync workouts, heart rate, and activity rings from your Apple Watch via HealthKit.',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    brand: 'Fitbit',
    logo: '💚',
    color: '#00B0B9',
    glow: 'rgba(0,176,185,0.3)',
    capabilities: ['Heart Rate', 'Steps', 'Calories', 'Sleep', 'Stress'],
    description: 'Connect your Fitbit to import steps, sleep data, and heart rate trends.',
  },
  {
    id: 'google-fit',
    name: 'Google Fit',
    brand: 'Google',
    logo: '❤️',
    color: '#4285F4',
    glow: 'rgba(66,133,244,0.3)',
    capabilities: ['Heart Points', 'Steps', 'Calories', 'Weight', 'Blood Pressure'],
    description: 'Sync your Google Fit data including Heart Points and move minutes.',
  },
  {
    id: 'samsung-health',
    name: 'Galaxy Watch',
    brand: 'Samsung',
    logo: '🔵',
    color: '#1428A0',
    glow: 'rgba(20,40,160,0.3)',
    capabilities: ['Heart Rate', 'Steps', 'Calories', 'Sleep', 'Body Composition', 'Blood Pressure'],
    description: 'Import health metrics from Samsung Health and Galaxy Watch sensors.',
  },
  {
    id: 'garmin',
    name: 'Garmin',
    brand: 'Garmin',
    logo: '🏔️',
    color: '#007CC3',
    glow: 'rgba(0,124,195,0.3)',
    capabilities: ['Heart Rate', 'Steps', 'Calories', 'Sleep', 'VO2 Max', 'Training Load'],
    description: 'Advanced metrics from Garmin — VO2 Max, training status, body battery.',
  },
  {
    id: 'mi-band',
    name: 'Mi Band / Amazfit',
    brand: 'Xiaomi',
    logo: '🟠',
    color: '#FF6900',
    glow: 'rgba(255,105,0,0.3)',
    capabilities: ['Heart Rate', 'Steps', 'Calories', 'Sleep', 'SpO2'],
    description: 'Sync Mi Band & Amazfit wearables for affordable, always-on tracking.',
  },
];

const STORAGE_KEY = 'aarogya_connected_wearables';

const getConnectedDevices = (): Record<string, ConnectedDevice> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};

const saveConnectedDevices = (devices: Record<string, ConnectedDevice>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
};

const WearablesView: React.FC = () => {
  const [connectedDevices, setConnectedDevices] = useState<Record<string, ConnectedDevice>>(getConnectedDevices);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const totalConnected = Object.keys(connectedDevices).length;

  const handleConnect = async (deviceId: string) => {
    setConnectingId(deviceId);
    // Simulate OAuth / BLE pairing flow
    await new Promise(r => setTimeout(r, 2200));

    const newDevice: ConnectedDevice = {
      id: deviceId,
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      battery: Math.floor(Math.random() * 40) + 60,
      steps: Math.floor(Math.random() * 8000) + 2000,
      heartRate: Math.floor(Math.random() * 30) + 65,
      calories: Math.floor(Math.random() * 400) + 150,
      sleepHours: Math.round((Math.random() * 3 + 5) * 10) / 10,
    };
    const updated = { ...connectedDevices, [deviceId]: newDevice };
    setConnectedDevices(updated);
    saveConnectedDevices(updated);
    setConnectingId(null);
  };

  const handleDisconnect = (deviceId: string) => {
    const updated = { ...connectedDevices };
    delete updated[deviceId];
    setConnectedDevices(updated);
    saveConnectedDevices(updated);
    setShowDetails(null);
  };

  const handleSync = async (deviceId: string) => {
    setSyncingId(deviceId);
    await new Promise(r => setTimeout(r, 1800));
    const updated = { ...connectedDevices };
    if (updated[deviceId]) {
      updated[deviceId] = {
        ...updated[deviceId],
        lastSync: new Date().toISOString(),
        steps: Math.floor(Math.random() * 8000) + 2000,
        heartRate: Math.floor(Math.random() * 30) + 65,
        calories: Math.floor(Math.random() * 400) + 150,
        sleepHours: Math.round((Math.random() * 3 + 5) * 10) / 10,
        battery: Math.max(10, (updated[deviceId].battery || 80) - Math.floor(Math.random() * 5)),
      };
    }
    setConnectedDevices(updated);
    saveConnectedDevices(updated);
    setSyncingId(null);
  };

  const timeSince = (isoStr: string) => {
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6 animate-slide-up">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 text-white"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.85), rgba(139,92,246,0.85))',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 24px 60px rgba(59,130,246,0.3)',
        }}>
        <div className="absolute inset-0 opacity-5">
          <Watch className="absolute -right-6 -bottom-6" size={240} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <Watch size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60 flex items-center gap-2">
                <Bluetooth size={10} /> Wearable Devices
              </p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Connect Your Wearables</h2>
            </div>
          </div>
          <p className="text-white/70 text-sm max-w-xl leading-relaxed">
            Sync your fitness trackers and smartwatches to automatically import heart rate, steps, sleep, and calorie data into Aarogya AI.
          </p>

          {/* Connected Summary */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <BluetoothConnected size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {totalConnected} Connected
              </span>
            </div>
            {totalConnected > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)' }}>
                <Signal size={14} className="text-emerald-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Syncing Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CONNECTED DEVICES LIVE DATA ── */}
      {totalConnected > 0 && (
        <div className="space-y-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <Signal size={11} className="text-emerald-400" /> Live Data from Connected Devices
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(() => {
              const allDevices = Object.values(connectedDevices);
              const totalSteps = allDevices.reduce((s, d) => s + d.steps, 0);
              const avgHR = Math.round(allDevices.reduce((s, d) => s + d.heartRate, 0) / allDevices.length);
              const totalCals = allDevices.reduce((s, d) => s + d.calories, 0);
              const avgSleep = Math.round(allDevices.reduce((s, d) => s + d.sleepHours, 0) / allDevices.length * 10) / 10;
              return [
                { label: 'Steps', value: totalSteps.toLocaleString(), icon: Footprints, color: '#3B82F6' },
                { label: 'Heart Rate', value: `${avgHR} bpm`, icon: Heart, color: '#EF4444' },
                { label: 'Calories', value: `${totalCals} kcal`, icon: Flame, color: '#F97316' },
                { label: 'Sleep', value: `${avgSleep} hrs`, icon: Moon, color: '#8B5CF6' },
              ].map(stat => (
                <div key={stat.label} className="rounded-[1.5rem] p-5 relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1.5px solid rgba(255,255,255,0.10)',
                  }}>
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-15" style={{ background: stat.color }} />
                  <stat.icon size={16} style={{ color: stat.color }} className="mb-2" />
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* ── DEVICE LIST ── */}
      <div className="space-y-3">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <Smartphone size={11} /> Available Devices
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WEARABLE_DEVICES.map(device => {
            const isConnected = !!connectedDevices[device.id];
            const isConnecting = connectingId === device.id;
            const isSyncing = syncingId === device.id;
            const connData = connectedDevices[device.id];
            const isExpanded = showDetails === device.id;

            return (
              <div key={device.id}
                className="rounded-[2rem] overflow-hidden transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(24px)',
                  border: isConnected ? `1.5px solid ${device.color}50` : '1.5px solid rgba(255,255,255,0.08)',
                  boxShadow: isConnected ? `0 0 30px ${device.glow}` : 'none',
                }}>

                {/* Main Row */}
                <div className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${device.color}20`, border: `1px solid ${device.color}30` }}>
                    {device.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-sm">{device.name}</h4>
                      {isConnected && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
                          style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                          <CheckCircle2 size={8} /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{device.brand}</p>
                    {isConnected && connData && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] text-slate-500 flex items-center gap-1">
                          <Clock size={9} /> {timeSince(connData.lastSync)}
                        </span>
                        <span className="text-[9px] text-slate-500 flex items-center gap-1">
                          <BatteryFull size={9} /> {connData.battery}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isConnected ? (
                      <>
                        <button onClick={() => handleSync(device.id)} disabled={isSyncing}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: `${device.color}20`, border: `1px solid ${device.color}30` }}>
                          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} style={{ color: device.color }} />
                        </button>
                        <button onClick={() => setShowDetails(isExpanded ? null : device.id)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                          <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleConnect(device.id)} disabled={isConnecting}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50"
                        style={{
                          background: `linear-gradient(135deg, ${device.color}, ${device.color}CC)`,
                          boxShadow: `0 4px 16px ${device.glow}`,
                          color: 'white',
                        }}>
                        {isConnecting ? (
                          <><RefreshCw size={12} className="animate-spin" /> Pairing...</>
                        ) : (
                          <><Bluetooth size={12} /> Connect</>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && isConnected && connData && (
                  <div className="px-5 pb-5 pt-0 space-y-4 animate-slide-up"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

                    {/* Capabilities */}
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Synced Metrics</p>
                      <div className="flex flex-wrap gap-1.5">
                        {device.capabilities.map(cap => (
                          <span key={cap} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-bold"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <CheckCircle2 size={8} className="text-emerald-400" /> {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Live Stats */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Steps', val: connData.steps.toLocaleString(), icon: Footprints, c: '#3B82F6' },
                        { label: 'HR', val: `${connData.heartRate}`, icon: Heart, c: '#EF4444' },
                        { label: 'Cal', val: `${connData.calories}`, icon: Flame, c: '#F97316' },
                        { label: 'Sleep', val: `${connData.sleepHours}h`, icon: Moon, c: '#8B5CF6' },
                      ].map(s => (
                        <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: `${s.c}10` }}>
                          <s.icon size={12} style={{ color: s.c }} className="mx-auto mb-1" />
                          <p className="text-sm font-black text-white">{s.val}</p>
                          <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Description + Disconnect */}
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-500 italic max-w-[70%] leading-relaxed">{device.description}</p>
                      <button onClick={() => handleDisconnect(device.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-all hover:scale-105"
                        style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
                        <Unplug size={11} /> Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TIPS ── */}
      <div className="rounded-[2rem] p-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.08)',
        }}>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-3">
          <Zap size={10} className="text-amber-400" /> How It Works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Connect', desc: 'Tap Connect on your device — we use secure OAuth to pair.', icon: Bluetooth, color: '#3B82F6' },
            { step: '2', title: 'Auto-Sync', desc: 'Data syncs automatically every 15 minutes in background.', icon: RefreshCw, color: '#8B5CF6' },
            { step: '3', title: 'AI Insights', desc: 'Aarogya AI uses your wearable data for smarter coaching.', icon: TrendingUp, color: '#10B981' },
          ].map(tip => (
            <div key={tip.step} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${tip.color}20`, border: `1px solid ${tip.color}30` }}>
                <tip.icon size={14} style={{ color: tip.color }} />
              </div>
              <div>
                <p className="text-xs font-black text-white">{tip.title}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WearablesView;
