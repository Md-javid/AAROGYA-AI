/**
 * FoodTracker.tsx
 * Meal + calorie + macro tracking with Duolingo-style XP rewards
 * iOS 19 Liquid Glass design system
 */
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Droplets, Flame, Target, ChevronRight, Award, Camera, Utensils, Apple, Coffee, Moon, Sun } from 'lucide-react';

/* ── Types ── */
interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: Meal;
  timestamp: number;
  quantity: number;
  unit: string;
}

type Meal = 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';

interface FoodTrackerProps {
  elderMode?: boolean;
  onXpEarned?: (xp: number) => void;
  onOpenMealVision?: () => void;
}

/* ── Common Indian + global foods database ── */
const FOOD_DB: Omit<FoodEntry, 'id' | 'meal' | 'timestamp' | 'quantity'>[] = [
  { name: 'Dal Tadka (1 bowl)',      calories: 198, protein: 11, carbs: 28, fat:  5, unit: 'bowl' },
  { name: 'Roti (1 piece)',          calories:  70, protein:  3, carbs: 15, fat:  1, unit: 'piece' },
  { name: 'Brown Rice (1 cup)',      calories: 216, protein:  5, carbs: 45, fat:  2, unit: 'cup' },
  { name: 'Idli (2 pieces)',         calories: 130, protein:  5, carbs: 25, fat:  1, unit: '2 pieces' },
  { name: 'Sambar (1 bowl)',         calories: 130, protein:  7, carbs: 18, fat:  4, unit: 'bowl' },
  { name: 'Paneer 100g',             calories: 265, protein: 18, carbs:  3, fat: 21, unit: '100g' },
  { name: 'Chicken Breast 100g',     calories: 165, protein: 31, carbs:  0, fat:  4, unit: '100g' },
  { name: 'Egg (whole)',             calories:  75, protein:  6, carbs:  1, fat:  5, unit: 'egg' },
  { name: 'Banana (medium)',         calories: 105, protein:  1, carbs: 27, fat:  0, unit: 'banana' },
  { name: 'Apple (medium)',          calories:  95, protein:  0, carbs: 25, fat:  0, unit: 'apple' },
  { name: 'Curd / Yoghurt 1 cup',    calories: 100, protein:  5, carbs: 11, fat:  5, unit: 'cup' },
  { name: 'Poha (1 plate)',          calories: 270, protein:  6, carbs: 52, fat:  5, unit: 'plate' },
  { name: 'Oats (1 cup cooked)',     calories: 150, protein:  5, carbs: 27, fat:  3, unit: 'cup' },
  { name: 'Milk (1 glass)',          calories: 120, protein:  6, carbs:  9, fat:  5, unit: 'glass' },
  { name: 'Mixed Salad (large)',     calories:  80, protein:  3, carbs: 15, fat:  1, unit: 'bowl' },
  { name: 'Rajma (1 bowl)',          calories: 210, protein: 13, carbs: 35, fat:  2, unit: 'bowl' },
  { name: 'Chole Masala (1 bowl)',   calories: 240, protein: 12, carbs: 36, fat:  6, unit: 'bowl' },
  { name: 'Masala Chai (1 cup)',     calories:  60, protein:  2, carbs:  7, fat:  3, unit: 'cup' },
  { name: 'Mango (1 medium)',        calories: 150, protein:  2, carbs: 37, fat:  1, unit: 'mango' },
  { name: 'Almonds (10 pieces)',     calories:  70, protein:  3, carbs:  3, fat:  6, unit: '10 pieces' },
  { name: 'Whey Protein (1 scoop)', calories: 120, protein: 25, carbs:  5, fat:  2, unit: 'scoop' },
];

const MEAL_ICONS: Record<Meal, React.ReactNode> = {
  'Breakfast': <Sun size={16} />,
  'Lunch':     <Utensils size={16} />,
  'Snack':     <Apple size={16} />,
  'Dinner':    <Moon size={16} />,
};

const MEAL_COLORS: Record<Meal, string> = {
  'Breakfast': '#FFB547',
  'Lunch':     '#4F8EF7',
  'Snack':     '#22E5B5',
  'Dinner':    '#9B6BFF',
};

const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

const CALORIE_GOAL = 2000;
const WATER_GLASSES_GOAL = 8;

/* ── Macro pill ── */
const MacroPill: React.FC<{ label: string; value: number; color: string; unit?: string }> = ({ label, value, color, unit = 'g' }) => (
  <div className="flex flex-col items-center glass-pill px-4 py-2 min-w-[70px]">
    <div className="font-black text-white text-lg" style={{ color }}>{Math.round(value)}<span className="text-xs font-normal text-white/40">{unit}</span></div>
    <div className="text-white/40 text-xs">{label}</div>
  </div>
);

/* ── Main component ── */
const FoodTracker: React.FC<FoodTrackerProps> = ({ elderMode = false, onXpEarned, onOpenMealVision }) => {
  const today = new Date().toDateString();

  const [entries, setEntries] = useState<FoodEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('aarogya_food') || '[]'); } catch { return []; }
  });
  const [activeMeal, setActiveMeal] = useState<Meal>('Breakfast');
  const [search, setSearch]         = useState('');
  const [water, setWater]           = useState(() => parseInt(localStorage.getItem('aarogya_water') || '0'));
  const [showAddForm, setShowAddForm] = useState(false);
  const [customFood, setCustomFood]   = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [showXpPop, setShowXpPop]     = useState(false);

  /* ── Today's entries ── */
  const todayEntries = useMemo(() =>
    entries.filter(e => new Date(e.timestamp).toDateString() === today),
    [entries, today]);

  const totals = useMemo(() => todayEntries.reduce((a, e) => ({
    calories: a.calories + e.calories * e.quantity,
    protein:  a.protein  + e.protein  * e.quantity,
    carbs:    a.carbs    + e.carbs    * e.quantity,
    fat:      a.fat      + e.fat      * e.quantity,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [todayEntries]);

  const caloriePercent = Math.min((totals.calories / CALORIE_GOAL) * 100, 100);

  /* ── Filtered food list ── */
  const filteredFoods = search.trim()
    ? FOOD_DB.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : FOOD_DB;

  /* ── Add entry ── */
  const addEntry = (food: (typeof FOOD_DB)[0]) => {
    const entry: FoodEntry = {
      ...food, id: Date.now().toString(),
      meal: activeMeal, timestamp: Date.now(), quantity: 1,
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem('aarogya_food', JSON.stringify(updated));
    const xp = Math.round(food.calories / 50);
    if (onXpEarned) onXpEarned(xp);
    setShowXpPop(true); setTimeout(() => setShowXpPop(false), 2000);
    setSearch('');
  };

  const addCustomEntry = () => {
    const { name, calories, protein, carbs, fat } = customFood;
    if (!name || !calories) return;
    const entry: FoodEntry = {
      id: Date.now().toString(), name, unit: 'serving',
      calories: parseFloat(calories) || 0, protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0, fat: parseFloat(fat) || 0,
      meal: activeMeal, timestamp: Date.now(), quantity: 1,
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem('aarogya_food', JSON.stringify(updated));
    if (onXpEarned) onXpEarned(10);
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowAddForm(false);
  };

  const removeEntry = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('aarogya_food', JSON.stringify(updated));
  };

  const setWaterAndSave = (n: number) => {
    const nw = Math.max(0, Math.min(n, WATER_GLASSES_GOAL * 2));
    setWater(nw);
    localStorage.setItem('aarogya_water', String(nw));
    if (n > water && n <= WATER_GLASSES_GOAL && onXpEarned) onXpEarned(5);
  };

  const textBase = elderMode ? 'text-base' : 'text-sm';
  const textLg   = elderMode ? 'text-xl'   : 'text-lg';
  const padBtn   = elderMode ? 'py-4 px-6' : 'py-2.5 px-4';

  return (
    <div className="space-y-6 pb-24">
      {/* ── XP Pop ── */}
      {showXpPop && (
        <div className="fixed bottom-24 right-6 z-[200] xp-badge text-lg animate-xpPop px-4 py-2 pointer-events-none">
          +XP Logged! 🥗
        </div>
      )}

      {/* ── Header + daily summary ── */}
      <div className="glass-card p-6 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(255,181,71,0.15), rgba(155,107,255,0.10))' }}>
        <h2 className={`font-black text-white mb-4 ${elderMode ? 'text-3xl' : 'text-2xl'}`}>🥗 Food Tracker</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <MacroPill label="Calories" value={totals.calories} color="#FFB547" unit=" kcal" />
          <MacroPill label="Protein"  value={totals.protein}  color="#22E5B5" />
          <MacroPill label="Carbs"    value={totals.carbs}    color="#4F8EF7" />
          <MacroPill label="Fat"      value={totals.fat}      color="#9B6BFF" />
        </div>
        {/* Calorie progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-white/50 font-bold ${textBase}`}>Today's goal</span>
            <span className={`font-black text-white ${textBase}`}>{Math.round(totals.calories)} / {CALORIE_GOAL} kcal</span>
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{
              width: `${caloriePercent}%`,
              background: caloriePercent > 95
                ? 'linear-gradient(90deg, #FF6B6B, #FF3B30)'
                : 'linear-gradient(90deg, #FFB547, #22E5B5)'
            }} />
          </div>
        </div>
      </div>

      {/* ── Water tracker ── */}
      <div className="glass-card p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets size={18} style={{ color: '#4F8EF7' }} />
            <h3 className={`font-black text-white ${textLg}`}>Hydration</h3>
          </div>
          <span className={`font-bold text-white/60 ${textBase}`}>{water}/{WATER_GLASSES_GOAL} glasses</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: WATER_GLASSES_GOAL }, (_, i) => (
            <button key={i} onClick={() => setWaterAndSave(i + 1)}
              className={`min-tap w-11 h-11 rounded-xl flex items-center justify-center transition-all ${elderMode ? 'w-14 h-14' : ''}`}
              style={{
                background: i < water ? 'rgba(79,142,247,0.35)' : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${i < water ? 'rgba(79,142,247,0.6)' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: i < water ? '0 0 14px rgba(79,142,247,0.25)' : 'none',
                fontSize: 20
              }}>
              💧
            </button>
          ))}
          <button onClick={() => setWaterAndSave(water - 1)}
            className="btn-glass px-3 py-2 rounded-xl text-xs ml-auto">Undo</button>
        </div>
      </div>

      {/* ── Meal selector ── */}
      <div className="glass-card p-5 rounded-3xl">
        <h3 className={`font-black text-white mb-3 ${textLg}`}>Log a Meal</h3>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {MEALS.map(m => (
            <button key={m} onClick={() => setActiveMeal(m)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold flex-shrink-0 transition-all ${textBase} ${activeMeal === m ? 'glass-pill-active' : 'glass-pill'}`}
              style={activeMeal === m ? { border: `1.5px solid ${MEAL_COLORS[m]}60`, boxShadow: `0 0 16px ${MEAL_COLORS[m]}25`, color: MEAL_COLORS[m] } : {}}>
              <span>{MEAL_ICONS[m]}</span> {m}
            </button>
          ))}
        </div>

        {/* search */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          className={`glass-input w-full ${elderMode ? 'py-4 text-lg' : 'py-3'} px-4 mb-3`}
          placeholder={`Search food to add to ${activeMeal}...`} />

        {/* camera scan */}
        <div className="flex gap-2 mb-3">
          {onOpenMealVision && (
            <button onClick={onOpenMealVision}
              className={`btn-glass flex items-center gap-2 flex-1 justify-center ${padBtn}`}
              style={{ border: '1.5px solid rgba(155,107,255,0.4)', color: '#9B6BFF' }}>
              <Camera size={16} /> Scan with AI
            </button>
          )}
          <button onClick={() => setShowAddForm(!showAddForm)}
            className={`btn-glass flex items-center gap-2 flex-1 justify-center ${padBtn}`}>
            <Plus size={16} /> Custom Food
          </button>
        </div>

        {/* custom food form */}
        {showAddForm && (
          <div className="glass-pill p-4 mb-3 space-y-2">
            <input placeholder="Food name *" value={customFood.name}
              onChange={e => setCustomFood(p => ({ ...p, name: e.target.value }))}
              className="glass-input w-full py-2 px-3" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Calories *" value={customFood.calories}
                onChange={e => setCustomFood(p => ({ ...p, calories: e.target.value }))}
                className="glass-input py-2 px-3" />
              <input type="number" placeholder="Protein g" value={customFood.protein}
                onChange={e => setCustomFood(p => ({ ...p, protein: e.target.value }))}
                className="glass-input py-2 px-3" />
              <input type="number" placeholder="Carbs g" value={customFood.carbs}
                onChange={e => setCustomFood(p => ({ ...p, carbs: e.target.value }))}
                className="glass-input py-2 px-3" />
              <input type="number" placeholder="Fat g" value={customFood.fat}
                onChange={e => setCustomFood(p => ({ ...p, fat: e.target.value }))}
                className="glass-input py-2 px-3" />
            </div>
            <button onClick={addCustomEntry} className={`btn-primary w-full ${padBtn}`}>Add Custom Food</button>
          </div>
        )}

        {/* food list results */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredFoods.slice(0, 10).map((food, i) => (
            <div key={i} onClick={() => addEntry(food)}
              className="flex items-center justify-between glass-pill p-3 cursor-pointer hover:bg-white/10 transition-all group">
              <div>
                <div className={`font-bold text-white group-hover:text-yellow-300 ${textBase}`}>{food.name}</div>
                <div className="text-white/40 text-xs">{food.calories} kcal · P:{food.protein}g C:{food.carbs}g F:{food.fat}g</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="xp-badge text-xs px-2 py-0.5">+{Math.round(food.calories / 50)} XP</span>
                <Plus size={16} className="text-white/40 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Today's food log by meal ── */}
      {MEALS.map(meal => {
        const mealEntries = todayEntries.filter(e => e.meal === meal);
        if (mealEntries.length === 0) return null;
        const mealCal = mealEntries.reduce((a, e) => a + e.calories * e.quantity, 0);
        return (
          <div key={meal} className="glass-card p-5 rounded-3xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div style={{ color: MEAL_COLORS[meal] }}>{MEAL_ICONS[meal]}</div>
                <h3 className={`font-black text-white ${textLg}`}>{meal}</h3>
              </div>
              <span className={`font-bold text-white/50 ${textBase}`}>{Math.round(mealCal)} kcal</span>
            </div>
            <div className="space-y-2">
              {mealEntries.map(e => (
                <div key={e.id} className="flex items-center justify-between glass-pill px-4 py-2.5 group">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">🍽️</div>
                    <div>
                      <div className={`font-bold text-white ${textBase}`}>{e.name}</div>
                      <div className="text-white/40 text-xs">{e.calories * e.quantity} kcal</div>
                    </div>
                  </div>
                  <button onClick={() => removeEntry(e.id)}
                    className="opacity-0 group-hover:opacity-100 btn-glass p-2 rounded-lg transition-all"
                    style={{ color: '#FF6B6B' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Macro breakdown rings ── */}
      {totals.calories > 0 && (
        <div className="glass-card p-6 rounded-3xl">
          <h3 className={`font-black text-white mb-4 ${textLg}`}>📊 Macro Breakdown</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Protein', value: totals.protein, total: totals.protein + totals.carbs + totals.fat, color: '#22E5B5', emoji: '💪' },
              { label: 'Carbs',   value: totals.carbs,   total: totals.protein + totals.carbs + totals.fat, color: '#4F8EF7', emoji: '⚡' },
              { label: 'Fat',     value: totals.fat,     total: totals.protein + totals.carbs + totals.fat, color: '#9B6BFF', emoji: '🛡️' },
            ].map(macro => {
              const pct = macro.total > 0 ? Math.round((macro.value / macro.total) * 100) : 0;
              return (
                <div key={macro.label} className="text-center glass-pill p-4">
                  <div className="text-3xl mb-1">{macro.emoji}</div>
                  <div className="text-white/40 text-xs mb-1">{macro.label}</div>
                  <div className="font-black text-white text-xl">{pct}%</div>
                  <div className="text-white/40 text-xs">{Math.round(macro.value)}g</div>
                  <div className="mt-2 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ width: `${pct}%`, background: macro.color, borderRadius: 999, height: '100%', boxShadow: `0 0 8px ${macro.color}50` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Nutrition tips ── */}
      <div className="glass-card p-5 rounded-3xl">
        <h3 className={`font-black text-white mb-3 ${textLg}`}>💡 Quick Tips</h3>
        <div className="space-y-2">
          {[
            { tip: 'Eat protein within 30 min of workout', icon: '💪', color: '#22E5B5' },
            { tip: 'Stay hydrated — aim for 8 glasses daily', icon: '💧', color: '#4F8EF7' },
            { tip: 'Include fibre-rich dal/sabzi every meal',  icon: '🥗', color: '#FFB547' },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3 glass-pill p-3">
              <span className="text-xl">{t.icon}</span>
              <p className={`text-white/70 ${textBase}`}>{t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodTracker;
