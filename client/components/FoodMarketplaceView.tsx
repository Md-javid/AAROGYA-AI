
import React, { useState } from 'react';
import {
    ShoppingBag, Star, Heart, Plus, Minus, Search, Filter,
    MapPin, Clock, Leaf, Zap, Award, ChevronRight, X,
    CheckCircle, Truck, Package, User, Flame, Apple,
    Send, ShoppingCart, Sparkles, Phone, MessageCircle
} from 'lucide-react';

interface FoodListing {
    id: string;
    sellerName: string;
    sellerAvatar: string;
    sellerLocation: string;
    sellerBio: string;
    dishName: string;
    description: string;
    image: string;
    price: number;
    unit: string;
    category: 'protein' | 'salad' | 'tiffin' | 'snack' | 'juice' | 'dessert';
    tags: string[];
    calories: number;
    protein: string;
    rating: number;
    reviews: number;
    available: boolean;
    deliveryTime: string;
    minOrder: number;
    isVeg: boolean;
    isHomemade: boolean;
    badges: string[];
}

interface CartItem { listing: FoodListing; qty: number; }

const LISTINGS: FoodListing[] = [
    {
        id: '1', sellerName: 'Meena Aunty', sellerAvatar: 'https://i.pravatar.cc/150?img=47',
        sellerLocation: 'Koramangala, Bangalore', sellerBio: 'Home cook for 20 years. I make fresh, healthy tiffins every morning with love ❤️',
        dishName: 'High-Protein Paneer Tiffin', description: 'Fresh paneer bhurji with multigrain roti, dal, and a seasonal sabzi. Packed with protein and made fresh every morning.',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
        price: 120, unit: 'per box', category: 'tiffin', tags: ['High Protein', 'Homemade', 'Fresh Daily'],
        calories: 480, protein: '28g', rating: 4.9, reviews: 143, available: true, deliveryTime: '30–45 min',
        minOrder: 1, isVeg: true, isHomemade: true, badges: ['Top Seller', 'Fresh Daily'],
    },
    {
        id: '2', sellerName: 'Sunita Devi', sellerAvatar: 'https://i.pravatar.cc/150?img=44',
        sellerLocation: 'Indiranagar, Bangalore', sellerBio: 'Nutritionist and home chef. I prepare healthy meals for college students and working professionals.',
        dishName: 'Boiled Egg & Sprout Bowl', description: 'A power-packed bowl with 4 boiled eggs, mixed sprouts, cucumber, and a light lemon dressing. Perfect post-workout meal.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
        price: 90, unit: 'per bowl', category: 'protein', tags: ['High Protein', 'Low Carb', 'Post-Workout'],
        calories: 320, protein: '32g', rating: 4.8, reviews: 89, available: true, deliveryTime: '20–30 min',
        minOrder: 1, isVeg: false, isHomemade: true, badges: ['Nutritionist Pick'],
    },
    {
        id: '3', sellerName: 'Lakshmi Kitchen', sellerAvatar: 'https://i.pravatar.cc/150?img=45',
        sellerLocation: 'HSR Layout, Bangalore', sellerBio: 'Traditional South Indian recipes made healthy. No preservatives, no artificial colours.',
        dishName: 'Ragi Malt & Idli Combo', description: 'Finger millet (ragi) malt drink with 4 soft idlis and sambar. A traditional, nutritious breakfast combo.',
        image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&q=80',
        price: 80, unit: 'per combo', category: 'tiffin', tags: ['Gluten-Free', 'Traditional', 'Diabetic-Friendly'],
        calories: 380, protein: '14g', rating: 4.7, reviews: 212, available: true, deliveryTime: '25–40 min',
        minOrder: 1, isVeg: true, isHomemade: true, badges: ['Traditional Recipe', 'Diabetic-Friendly'],
    },
    {
        id: '4', sellerName: 'Priya\'s Greens', sellerAvatar: 'https://i.pravatar.cc/150?img=48',
        sellerLocation: 'Whitefield, Bangalore', sellerBio: 'I grow my own veggies and make fresh salads and juices every day. Delivery by 8 AM!',
        dishName: 'Detox Green Juice', description: 'Freshly pressed juice of spinach, cucumber, amla, ginger, and lemon. No sugar added. Boosts immunity and energy.',
        image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80',
        price: 60, unit: 'per 300ml', category: 'juice', tags: ['Detox', 'No Sugar', 'Immunity Boost'],
        calories: 80, protein: '3g', rating: 4.9, reviews: 178, available: true, deliveryTime: '15–25 min',
        minOrder: 2, isVeg: true, isHomemade: true, badges: ['Top Seller', 'No Preservatives'],
    },
    {
        id: '5', sellerName: 'Ananya\'s Kitchen', sellerAvatar: 'https://i.pravatar.cc/150?img=46',
        sellerLocation: 'BTM Layout, Bangalore', sellerBio: 'Fitness enthusiast and home chef. I make macro-tracked meals for gym-goers and athletes.',
        dishName: 'Chicken Breast Meal Prep', description: 'Grilled chicken breast (200g) with brown rice, steamed broccoli, and a side of Greek yogurt dip. Macro-tracked.',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80',
        price: 180, unit: 'per box', category: 'protein', tags: ['High Protein', 'Macro-Tracked', 'Gym Meal'],
        calories: 520, protein: '45g', rating: 4.8, reviews: 67, available: true, deliveryTime: '35–50 min',
        minOrder: 1, isVeg: false, isHomemade: true, badges: ['Macro-Tracked', 'Gym Approved'],
    },
    {
        id: '6', sellerName: 'Kavitha Snacks', sellerAvatar: 'https://i.pravatar.cc/150?img=43',
        sellerLocation: 'Jayanagar, Bangalore', sellerBio: 'Making healthy snacks that actually taste good! No maida, no refined sugar.',
        dishName: 'Roasted Makhana & Nut Mix', description: 'A crunchy mix of roasted fox nuts (makhana), almonds, cashews, and pumpkin seeds. Lightly spiced. Great for evening snacking.',
        image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80',
        price: 70, unit: 'per 100g pack', category: 'snack', tags: ['Low Calorie', 'Crunchy', 'No Maida'],
        calories: 180, protein: '8g', rating: 4.6, reviews: 134, available: true, deliveryTime: '20–35 min',
        minOrder: 2, isVeg: true, isHomemade: true, badges: ['Healthy Snack'],
    },
    {
        id: '7', sellerName: 'Radha\'s Salads', sellerAvatar: 'https://i.pravatar.cc/150?img=41',
        sellerLocation: 'Electronic City, Bangalore', sellerBio: 'Fresh salads made to order for office-goers and students. Customisable toppings!',
        dishName: 'Quinoa Power Salad', description: 'Protein-rich quinoa with roasted chickpeas, cherry tomatoes, avocado, feta, and a tahini dressing. Filling and nutritious.',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
        price: 150, unit: 'per bowl', category: 'salad', tags: ['Vegan', 'High Protein', 'Gluten-Free'],
        calories: 420, protein: '18g', rating: 4.7, reviews: 56, available: false, deliveryTime: '30–45 min',
        minOrder: 1, isVeg: true, isHomemade: true, badges: ['Vegan Friendly'],
    },
    {
        id: '8', sellerName: 'Nirmala\'s Sweets', sellerAvatar: 'https://i.pravatar.cc/150?img=42',
        sellerLocation: 'Marathahalli, Bangalore', sellerBio: 'Guilt-free Indian sweets made with jaggery, dates, and natural sweeteners. No refined sugar!',
        dishName: 'Date & Nut Energy Balls', description: 'Handmade energy balls with Medjool dates, almonds, walnuts, and dark chocolate chips. No added sugar. 3 balls per pack.',
        image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&q=80',
        price: 100, unit: 'per pack (3 balls)', category: 'dessert', tags: ['No Sugar', 'Energy Boost', 'Natural'],
        calories: 220, protein: '6g', rating: 4.8, reviews: 98, available: true, deliveryTime: '25–40 min',
        minOrder: 1, isVeg: true, isHomemade: true, badges: ['No Refined Sugar'],
    },
];

const CATEGORY_LABELS: Record<string, string> = {
    all: 'All', protein: '💪 Protein', tiffin: '🍱 Tiffin', salad: '🥗 Salad',
    juice: '🥤 Juice', snack: '🌰 Snacks', dessert: '🍫 Healthy Sweets',
};

const FoodMarketplaceView: React.FC = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
    const [savedItems, setSavedItems] = useState<string[]>([]);
    const [sellerMode, setSellerMode] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const filtered = LISTINGS.filter(l => {
        const matchSearch = l.dishName.toLowerCase().includes(search.toLowerCase()) ||
            l.sellerName.toLowerCase().includes(search.toLowerCase()) ||
            l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchCat = category === 'all' || l.category === category;
        return matchSearch && matchCat;
    });

    const addToCart = (listing: FoodListing) => {
        setCart(prev => {
            const existing = prev.find(i => i.listing.id === listing.id);
            if (existing) return prev.map(i => i.listing.id === listing.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { listing, qty: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => {
            const existing = prev.find(i => i.listing.id === id);
            if (existing && existing.qty > 1) return prev.map(i => i.listing.id === id ? { ...i, qty: i.qty - 1 } : i);
            return prev.filter(i => i.listing.id !== id);
        });
    };

    const cartTotal = cart.reduce((sum, i) => sum + i.listing.price * i.qty, 0);
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

    const placeOrder = () => {
        setOrderPlaced(true);
        setCart([]);
        setCartOpen(false);
        setTimeout(() => setOrderPlaced(false), 4000);
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-32">

            {/* Order Success Toast */}
            {orderPlaced && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up font-black text-sm">
                    <CheckCircle size={20} /> Order placed! Your food is being prepared 🎉
                </div>
            )}

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl border border-white/5">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-saffron-500 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">
                            <Leaf size={14} className="animate-pulse" /> Healthy Food Marketplace
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Fresh & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Healthy</span> Food</h2>
                        <p className="text-slate-400 font-medium max-w-md">Home-cooked, nutritious meals made by talented home chefs in your city. Perfect for college students, gym-goers, and busy professionals.</p>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black text-emerald-300 border border-white/10">
                                <Leaf size={12} /> 100% Homemade
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black text-saffron-300 border border-white/10">
                                <Zap size={12} /> No Preservatives
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black text-blue-300 border border-white/10">
                                <Truck size={12} /> Fast Delivery
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                        <button onClick={() => setSellerMode(true)} className="flex items-center gap-3 px-8 py-4 bg-saffron-500 hover:bg-saffron-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-xl glow-saffron">
                            <Plus size={16} /> Sell Your Food
                        </button>
                        <p className="text-[10px] text-slate-500 text-center">Are you a home cook? Start earning today!</p>
                    </div>
                </div>
            </div>

            {/* Seller Registration Modal */}
            {sellerMode && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSellerMode(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md shadow-2xl p-8 animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <Leaf size={28} className="text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Become a Seller</h3>
                            <p className="text-sm text-slate-400 mt-1">Share your healthy cooking with your community</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Your Name', placeholder: 'e.g. Meena Sharma', type: 'text' },
                                { label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
                                { label: 'Your Area / Locality', placeholder: 'e.g. Koramangala, Bangalore', type: 'text' },
                                { label: 'What do you cook?', placeholder: 'e.g. Tiffins, Salads, Juices...', type: 'text' },
                            ].map(f => (
                                <div key={f.label}>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{f.label}</label>
                                    <input type={f.type} placeholder={f.placeholder} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { alert('🎉 Application submitted! We\'ll contact you within 24 hours to get you started.'); setSellerMode(false); }}
                            className="w-full mt-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105">
                            Submit Application
                        </button>
                    </div>
                </div>
            )}

            {/* Search + Cart + Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search dishes, sellers, or tags..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-lg">
                    <ShoppingCart size={16} /> Cart
                    {cartCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">{cartCount}</span>}
                </button>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 flex-wrap">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button key={key} onClick={() => setCategory(key)}
                        className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${category === key ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-emerald-300'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Food Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((listing, i) => (
                    <div key={listing.id} className="glass-card rounded-[2.5rem] overflow-hidden border border-white/20 group hover:border-emerald-300/50 transition-all" style={{ animationDelay: `${i * 80}ms` }}>
                        {/* Image */}
                        <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => setSelectedListing(listing)}>
                            <img src={listing.image} alt={listing.dishName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute top-3 left-3 flex gap-2">
                                {listing.isVeg ? (
                                    <span className="px-2 py-1 bg-emerald-500/90 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">🟢 Veg</span>
                                ) : (
                                    <span className="px-2 py-1 bg-red-500/90 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">🔴 Non-Veg</span>
                                )}
                                {listing.isHomemade && <span className="px-2 py-1 bg-saffron-500/90 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">🏠 Homemade</span>}
                            </div>
                            <button onClick={e => { e.stopPropagation(); setSavedItems(prev => prev.includes(listing.id) ? prev.filter(id => id !== listing.id) : [...prev, listing.id]); }}
                                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${savedItems.includes(listing.id) ? 'bg-red-500 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                                <Heart size={13} className={savedItems.includes(listing.id) ? 'fill-white' : ''} />
                            </button>
                            {!listing.available && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white font-black text-sm uppercase tracking-widest">Currently Unavailable</span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Seller */}
                            <div className="flex items-center gap-3">
                                <img src={listing.sellerAvatar} alt={listing.sellerName} className="w-9 h-9 rounded-xl object-cover" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">by {listing.sellerName}</p>
                                    <p className="text-[9px] text-slate-400 flex items-center gap-1"><MapPin size={8} /> {listing.sellerLocation}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{listing.dishName}</h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{listing.description}</p>
                            </div>

                            {/* Nutrition */}
                            <div className="flex gap-3">
                                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                    <Flame size={10} className="text-orange-500" />
                                    <span className="text-[9px] font-black text-orange-700 dark:text-orange-400">{listing.calories} kcal</span>
                                </div>
                                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <Zap size={10} className="text-blue-500" />
                                    <span className="text-[9px] font-black text-blue-700 dark:text-blue-400">{listing.protein} protein</span>
                                </div>
                                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <Clock size={10} className="text-slate-500" />
                                    <span className="text-[9px] font-black text-slate-500">{listing.deliveryTime}</span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                                {listing.tags.slice(0, 3).map(t => (
                                    <span key={t} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[9px] font-black border border-emerald-100 dark:border-emerald-900/30">{t}</span>
                                ))}
                            </div>

                            {/* Rating + Price + Add */}
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{listing.rating}</span>
                                    <span className="text-[10px] text-slate-400">({listing.reviews})</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div>
                                        <span className="text-xl font-black text-slate-900 dark:text-white">₹{listing.price}</span>
                                        <span className="text-[10px] text-slate-400 ml-1">{listing.unit}</span>
                                    </div>
                                    <button
                                        onClick={() => listing.available && addToCart(listing)}
                                        disabled={!listing.available}
                                        className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white rounded-2xl flex items-center justify-center transition-all hover:scale-110 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Drawer */}
            {cartOpen && (
                <div className="fixed inset-0 z-[200] flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm h-full shadow-2xl flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600">
                            <h3 className="font-black text-white text-lg flex items-center gap-2"><ShoppingCart size={20} /> Your Cart</h3>
                            <button onClick={() => setCartOpen(false)} className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-all font-bold text-lg">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
                            {cart.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                                    <p className="font-black uppercase tracking-widest text-sm">Your cart is empty</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.listing.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <img src={item.listing.image} alt={item.listing.dishName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm text-slate-900 dark:text-white truncate">{item.listing.dishName}</p>
                                        <p className="text-[10px] text-slate-400">{item.listing.sellerName}</p>
                                        <p className="text-sm font-black text-emerald-600">₹{item.listing.price * item.qty}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => removeFromCart(item.listing.id)} className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all"><Minus size={12} /></button>
                                        <span className="font-black text-sm w-5 text-center">{item.qty}</span>
                                        <button onClick={() => addToCart(item.listing)} className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-all"><Plus size={12} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {cart.length > 0 && (
                            <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]">Total</span>
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">₹{cartTotal}</span>
                                </div>
                                <button onClick={placeOrder} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 flex items-center justify-center gap-2">
                                    <CheckCircle size={16} /> Place Order · ₹{cartTotal}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Listing Detail Modal */}
            {selectedListing && (
                <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedListing(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="relative h-52">
                            <img src={selectedListing.image} alt={selectedListing.dishName} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <button onClick={() => setSelectedListing(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-all text-lg font-bold">×</button>
                            <div className="absolute bottom-4 left-5">
                                <h3 className="text-xl font-black text-white">{selectedListing.dishName}</h3>
                                <p className="text-white/70 text-sm">by {selectedListing.sellerName}</p>
                            </div>
                        </div>
                        <div className="p-7 space-y-5">
                            <div className="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                <img src={selectedListing.sellerAvatar} alt={selectedListing.sellerName} className="w-12 h-12 rounded-2xl object-cover flex-shrink-0" />
                                <div>
                                    <p className="font-black text-sm text-slate-900 dark:text-white">{selectedListing.sellerName}</p>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin size={9} /> {selectedListing.sellerLocation}</p>
                                    <p className="text-xs text-slate-500 mt-1 italic">"{selectedListing.sellerBio}"</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedListing.description}</p>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-2xl">
                                    <p className="text-lg font-black text-orange-600">{selectedListing.calories}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calories</p>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-2xl">
                                    <p className="text-lg font-black text-blue-600">{selectedListing.protein}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protein</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <p className="text-lg font-black text-slate-700 dark:text-white">{selectedListing.deliveryTime}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivery</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => { addToCart(selectedListing); setSelectedListing(null); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105">
                                    <ShoppingCart size={14} /> Add to Cart · ₹{selectedListing.price}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodMarketplaceView;
