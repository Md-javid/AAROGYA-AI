
import React, { useState } from 'react';
import { X, Flame, Clock, Utensils, Dumbbell, Moon, Droplets, PlusCircle, MinusCircle } from 'lucide-react';
import { WorkoutLog, MealLog, SleepLog, WaterLog } from '../types';

interface LogModalProps {
  type: 'workout' | 'meal' | 'sleep' | 'water';
  onClose: () => void;
  onSaveWorkout: (log: Omit<WorkoutLog, 'id'>) => void;
  onSaveMeal: (log: Omit<MealLog, 'id'>) => void;
  onSaveSleep: (log: Omit<SleepLog, 'id'>) => void;
  onSaveWater: (log: Omit<WaterLog, 'id'>) => void;
}

// Helper to get local YYYY-MM-DD
const getLocalToday = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const LogModal: React.FC<LogModalProps> = ({ type, onClose, onSaveWorkout, onSaveMeal, onSaveSleep, onSaveWater }) => {
  const [date, setDate] = useState(getLocalToday());
  
  // Workout State
  const [workoutType, setWorkoutType] = useState('Cardio');
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [caloriesBurned, setCaloriesBurned] = useState(200);

  // Meal State
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'>('Lunch');
  const [items, setItems] = useState('');
  const [caloriesConsumed, setCaloriesConsumed] = useState(400);

  // Sleep State
  const [sleepDuration, setSleepDuration] = useState(8);
  const [sleepQuality, setSleepQuality] = useState<number>(3);

  // Water State
  const [waterAmount, setWaterAmount] = useState(8);
  const [waterUnit, setWaterUnit] = useState<'Glasses' | 'Liters'>('Glasses');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'workout') {
      onSaveWorkout({
        date,
        type: workoutType,
        durationMinutes: duration,
        intensity,
        caloriesBurned
      });
    } else if (type === 'meal') {
      onSaveMeal({
        date,
        mealType,
        items,
        calories: caloriesConsumed
      });
    } else if (type === 'sleep') {
      onSaveSleep({
        date,
        durationHours: sleepDuration,
        quality: sleepQuality as any
      });
    } else if (type === 'water') {
      onSaveWater({
        date,
        amount: waterAmount,
        unit: waterUnit
      });
    }
    onClose();
  };

  const getHeaderIcon = () => {
    switch(type) {
      case 'workout': return <Dumbbell size={20} />;
      case 'meal': return <Utensils size={20} />;
      case 'sleep': return <Moon size={20} />;
      case 'water': return <Droplets size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="bg-orange-600 dark:bg-orange-700 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            {getHeaderIcon()}
            <h2 className="font-semibold text-lg capitalize">Log {type}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-orange-700 dark:hover:bg-orange-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
            <input 
              type="date" 
              required
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            />
          </div>

          {type === 'workout' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Workout Type</label>
                <select 
                  value={workoutType} 
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 transition-colors"
                >
                  <option value="Cardio">Cardio (Running, Walking)</option>
                  <option value="Strength">Strength Training</option>
                  <option value="Yoga">Yoga</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Sports">Sports (Cricket, Badminton, etc.)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (mins)</label>
                   <div className="relative">
                      <Clock size={16} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                      <input 
                        type="number" 
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full pl-9 p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Intensity</label>
                   <select 
                     value={intensity} 
                     onChange={(e) => setIntensity(e.target.value as any)}
                     className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 transition-colors"
                   >
                     <option value="Low">Low</option>
                     <option value="Medium">Medium</option>
                     <option value="High">High</option>
                   </select>
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Calories Burned (Approx)</label>
                 <div className="relative">
                    <Flame size={16} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                    <input 
                      type="number" 
                      min="1"
                      value={caloriesBurned}
                      onChange={(e) => setCaloriesBurned(parseInt(e.target.value))}
                      className="w-full pl-9 p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    />
                 </div>
              </div>
            </>
          )}

          {type === 'meal' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meal Type</label>
                <select 
                  value={mealType} 
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-800 transition-colors"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snack">Snack</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Food Items</label>
                <textarea 
                  required
                  placeholder="e.g. 2 Roti, Dal, Salad"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none transition-colors"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Calories Consumed (Approx)</label>
                 <div className="relative">
                    <Flame size={16} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                    <input 
                      type="number" 
                      min="1"
                      value={caloriesConsumed}
                      onChange={(e) => setCaloriesConsumed(parseInt(e.target.value))}
                      className="w-full pl-9 p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    />
                 </div>
              </div>
            </>
          )}

          {type === 'sleep' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sleep Duration (Hours)</label>
                <div className="relative">
                  <Moon size={16} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="number" 
                    step="0.5"
                    min="1"
                    max="24"
                    value={sleepDuration}
                    onChange={(e) => setSleepDuration(parseFloat(e.target.value))}
                    className="w-full pl-9 p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Sleep Quality</label>
                <div className="flex justify-between items-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSleepQuality(val)}
                      className={`flex-1 h-12 rounded-lg border transition-all font-bold ${
                        sleepQuality === val
                          ? 'bg-orange-600 dark:bg-orange-700 border-orange-600 dark:border-orange-700 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-orange-300 dark:hover:border-orange-700'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Restless</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Deep Sleep</span>
                </div>
              </div>
            </>
          )}

          {type === 'water' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hydration Unit</label>
                <div className="flex gap-4 mb-4">
                  {['Glasses', 'Liters'].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setWaterUnit(u as any)}
                      className={`flex-1 py-2 rounded-lg border transition-all text-sm font-medium ${
                        waterUnit === u
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">Amount Drunk</p>
                <div className="flex items-center justify-center gap-6">
                  <button 
                    type="button"
                    onClick={() => setWaterAmount(prev => Math.max(0, prev - 1))}
                    className="text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                  >
                    <MinusCircle size={32} />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-blue-800 dark:text-blue-200">{waterAmount}</span>
                    <span className="text-xs font-bold text-blue-500 uppercase">{waterUnit}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setWaterAmount(prev => prev + 1)}
                    className="text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                  >
                    <PlusCircle size={32} />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center px-4">
                Hydration is key for recovery and metabolism. Aim for 8-10 glasses daily.
              </p>
            </>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-orange-600 dark:bg-orange-700 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 dark:hover:bg-orange-800 transition-all shadow-lg shadow-orange-200 dark:shadow-none"
            >
              Save Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogModal;
