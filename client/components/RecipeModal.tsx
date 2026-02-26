
import React, { useState } from 'react';
import { X, Clock, Flame, ChefHat, Info, Video, ExternalLink, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { MealItem } from '../types';
import { generateMealImage } from '../services/geminiService';

interface RecipeModalProps {
  meal: MealItem;
  type: string;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ meal, type, onClose }) => {
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getFunctionalYoutubeLink = (url?: string, dishName?: string) => {
    if (!url || url.includes('XXXXXXXXXXX')) {
      return `https://www.youtube.com/results?search_query=${encodeURIComponent((dishName || 'Indian dish') + ' recipe tutorial')}`;
    }
    return url;
  };

  const handleGenerateVisual = async () => {
    setIsGenerating(true);
    const url = await generateMealImage(meal.dishName);
    setVisualUrl(url);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden animate-fadeIn border border-slate-100 dark:border-slate-800 transition-colors flex flex-col">
        {/* Header */}
        <div className="bg-orange-600 dark:bg-orange-700 p-6 flex justify-between items-start text-white relative">
          <div>
            <span className="text-orange-100 text-xs font-bold uppercase tracking-widest">{type} Recipe</span>
            <h2 className="text-2xl font-bold mt-1">{meal.dishName}</h2>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs font-medium">
                <Clock size={14} /> {meal.prepTime}
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs font-medium">
                <Flame size={14} /> {meal.calories} kcal
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-hide">
          {/* AI Visualizer Section */}
          <section className="relative overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-2xl min-h-[200px] flex items-center justify-center">
            {visualUrl ? (
              <img src={visualUrl} alt={meal.dishName} className="w-full h-auto object-cover max-h-[400px]" />
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                   {isGenerating ? <Loader2 size={32} className="animate-spin text-orange-500" /> : <ImageIcon size={32} className="text-slate-300" />}
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Aarogya Vision</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">See how your healthy meal should look using AI.</p>
                <button 
                  onClick={handleGenerateVisual}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-700 transition-all disabled:opacity-50"
                >
                  <Sparkles size={16} /> {isGenerating ? 'Visualizing...' : 'Visualize Dish'}
                </button>
              </div>
            )}
          </section>

          {/* Video Link */}
          {meal.videoUrl && (
            <section className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/20">
              <h3 className="text-sm font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Video size={16} /> Cooking Tutorial
              </h3>
              <a 
                href={getFunctionalYoutubeLink(meal.videoUrl, meal.dishName)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-orange-600 dark:text-orange-400 text-sm font-black break-all hover:bg-white dark:hover:bg-orange-800/40 p-3 rounded-xl border border-orange-200 dark:border-orange-800/30 transition-all shadow-sm"
              >
                <ExternalLink size={16} /> {meal.dishName} Recipe
              </a>
            </section>
          )}

          {/* Ingredients */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div> Ingredients
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {meal.ingredients.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-orange-500 font-bold">•</span> {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Instructions */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div> Step-by-Step
            </h3>
            <div className="space-y-4">
              {meal.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm flex items-center justify-center border border-orange-100 dark:border-orange-800 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                    {idx + 1}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pt-1.5">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-2xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
          > Done </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
