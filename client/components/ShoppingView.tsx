
import React, { useMemo, useState } from 'react';
import { DietPlan } from '../types';
import { 
  ShoppingCart, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Search, 
  Package, 
  Truck, 
  Store,
  ArrowRight,
  Info,
  // Fix: Added missing Zap icon import
  Zap
} from 'lucide-react';

interface ShoppingViewProps {
  dietPlan: DietPlan | null;
  isDarkMode: boolean;
}

const ShoppingView: React.FC<ShoppingViewProps> = ({ dietPlan, isDarkMode }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const allIngredients = useMemo(() => {
    if (!dietPlan) return [];
    const meals = [dietPlan.breakfast, dietPlan.lunch, dietPlan.snack, dietPlan.dinner];
    const ingredients = meals.flatMap(meal => meal.ingredients);
    // Unique ingredients only
    return Array.from(new Set(ingredients)).sort();
  }, [dietPlan]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const getAmazonLink = (item: string) => `https://www.amazon.in/s?k=${encodeURIComponent(item)}+grocery`;
  const getBigBasketLink = (item: string) => `https://www.bigbasket.com/ps/?q=${encodeURIComponent(item)}`;

  const completionPercentage = allIngredients.length > 0 
    ? Math.round((Object.values(checkedItems).filter(Boolean).length / allIngredients.length) * 100)
    : 0;

  if (!dietPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
          <Package size={40} className="text-slate-300" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">No Plan Found</h3>
        <p className="max-w-xs font-medium">Generate your regional diet plan first to see your smart shopping list here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Summary */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-5">
           <div className="p-5 bg-orange-100 dark:bg-orange-900/30 rounded-[2rem]">
              <ShoppingCart size={32} className="text-orange-600 dark:text-orange-400" />
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Smart Pantry</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Aggregated Grocery List</p>
           </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="text-center md:text-right">
             <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{completionPercentage}%</span>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Acquired</p>
          </div>
          <div className="h-12 w-[1px] bg-slate-100 dark:bg-slate-800 hidden md:block" />
          <div className="flex gap-3">
             <a 
               href="https://www.bigbasket.com/" 
               target="_blank" 
               rel="noreferrer"
               className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl hover:scale-105 transition-all"
             >
                <Store size={24} />
             </a>
             <a 
               href="https://www.amazon.in/fresh" 
               target="_blank" 
               rel="noreferrer"
               className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl hover:scale-105 transition-all"
             >
                <Truck size={24} />
             </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* The List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
            <CheckCircle2 size={14} /> Checklist ({allIngredients.length} Items)
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
             {allIngredients.map((item, idx) => (
               <div 
                 key={idx} 
                 className={`flex items-center justify-between p-6 border-b border-slate-50 dark:border-slate-800/50 last:border-none transition-colors ${
                   checkedItems[item] ? 'bg-slate-50/50 dark:bg-slate-800/20 opacity-60' : ''
                 }`}
               >
                 <button 
                   onClick={() => toggleCheck(item)}
                   className="flex items-center gap-4 group flex-1 text-left"
                 >
                   {checkedItems[item] ? (
                     <CheckCircle2 size={24} className="text-emerald-500" />
                   ) : (
                     <Circle size={24} className="text-slate-200 dark:text-slate-700 group-hover:text-orange-400 transition-colors" />
                   )}
                   <span className={`font-bold transition-all ${
                     checkedItems[item] ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'
                   }`}>
                     {item}
                   </span>
                 </button>
                 
                 <div className="flex items-center gap-2">
                   <a 
                     href={getAmazonLink(item)} 
                     target="_blank" 
                     rel="noreferrer"
                     title="Search on Amazon"
                     className="p-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                   >
                     <Search size={16} />
                   </a>
                   <a 
                     href={getBigBasketLink(item)} 
                     target="_blank" 
                     rel="noreferrer"
                     title="Search on BigBasket"
                     className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                   >
                     <ExternalLink size={16} />
                   </a>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Store Deep Links & Info */}
        <div className="space-y-6">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
            <Store size={14} /> Quick Access Stores
          </h3>
          
          <div className="space-y-3">
             {[
               { name: 'Amazon Fresh', url: 'https://www.amazon.in/fresh', color: 'bg-[#FF9900]', icon: Truck },
               { name: 'BigBasket', url: 'https://www.bigbasket.com/', color: 'bg-[#689f38]', icon: Store },
               { name: 'Zepto / Blinkit', url: 'https://www.zeptonow.com/', color: 'bg-purple-600', icon: Zap },
               { name: 'Swiggy Instamart', url: 'https://www.swiggy.com/instamart', color: 'bg-orange-500', icon: ShoppingCart }
             ].map((store, i) => (
               <a 
                 key={i}
                 href={store.url}
                 target="_blank"
                 rel="noreferrer"
                 className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.8rem] shadow-sm hover:translate-x-2 transition-transform group"
               >
                 <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl text-white ${store.color}`}>
                       <store.icon size={20} />
                    </div>
                    <span className="font-black text-slate-700 dark:text-slate-200 uppercase text-xs tracking-wider">{store.name}</span>
                 </div>
                 <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
               </a>
             ))}
          </div>

          <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20">
             <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
                <Info size={20} />
                <h4 className="font-black text-sm uppercase tracking-widest">Smart Tip</h4>
             </div>
             <p className="text-xs text-blue-800/70 dark:text-blue-200/60 font-medium leading-relaxed">
               Buying in bulk? Focus on grains and spices first. For fresh produce like Curry Leaves or Paneer, use Zepto or Blinkit for 10-minute delivery to ensure maximum nutrient density.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingView;
