
import React, { useState, useEffect } from 'react';
import {
    MapPin, Navigation, Star, Clock, Phone, ExternalLink,
    Dumbbell, Wifi, Car, Droplets, Zap, Search, Filter,
    ChevronRight, Loader2, AlertCircle, RefreshCw, Heart
} from 'lucide-react';

interface Gym {
    id: string;
    name: string;
    address: string;
    distance: string;
    rating: number;
    reviews: number;
    openNow: boolean;
    hours: string;
    phone: string;
    amenities: string[];
    type: 'gym' | 'yoga' | 'crossfit' | 'pool';
    priceRange: '₹' | '₹₹' | '₹₹₹';
    image: string;
    saved: boolean;
}

const MOCK_GYMS: Gym[] = [
    {
        id: '1', name: 'FitZone Premium Gym', address: '12, MG Road, Near City Mall',
        distance: '0.4 km', rating: 4.7, reviews: 312, openNow: true, hours: '5:00 AM – 11:00 PM',
        phone: '+91 98765 43210', amenities: ['AC', 'Parking', 'Showers', 'Locker', 'WiFi', 'Trainer'],
        type: 'gym', priceRange: '₹₹', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', saved: false,
    },
    {
        id: '2', name: 'Anytime Fitness', address: '3rd Floor, Nexus Mall, Ring Road',
        distance: '0.9 km', rating: 4.5, reviews: 189, openNow: true, hours: '24 Hours',
        phone: '+91 87654 32109', amenities: ['AC', 'Locker', 'WiFi', '24/7'],
        type: 'gym', priceRange: '₹₹₹', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80', saved: false,
    },
    {
        id: '3', name: 'Zen Yoga Studio', address: '7, Gandhi Nagar, 2nd Cross',
        distance: '1.2 km', rating: 4.9, reviews: 97, openNow: true, hours: '6:00 AM – 9:00 PM',
        phone: '+91 76543 21098', amenities: ['AC', 'Showers', 'Meditation Room', 'Trainer'],
        type: 'yoga', priceRange: '₹₹', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80', saved: false,
    },
    {
        id: '4', name: 'CrossFit Iron Box', address: '88, Industrial Area, Phase 2',
        distance: '1.8 km', rating: 4.6, reviews: 214, openNow: false, hours: '6:00 AM – 8:00 PM',
        phone: '+91 65432 10987', amenities: ['Parking', 'Trainer', 'Locker'],
        type: 'crossfit', priceRange: '₹₹', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', saved: false,
    },
    {
        id: '5', name: 'AquaFit Swimming Club', address: '22, Lake View Road',
        distance: '2.1 km', rating: 4.4, reviews: 156, openNow: true, hours: '6:00 AM – 10:00 PM',
        phone: '+91 54321 09876', amenities: ['Pool', 'AC', 'Showers', 'Locker', 'Trainer'],
        type: 'pool', priceRange: '₹₹₹', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&q=80', saved: false,
    },
    {
        id: '6', name: 'Budget Gym & Fitness', address: '5, Old Market Street',
        distance: '2.5 km', rating: 4.1, reviews: 88, openNow: true, hours: '5:30 AM – 10:00 PM',
        phone: '+91 43210 98765', amenities: ['Parking', 'Trainer'],
        type: 'gym', priceRange: '₹', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80', saved: false,
    },
];

const AMENITY_ICONS: Record<string, React.ReactNode> = {
    'AC': <Zap size={10} />, 'WiFi': <Wifi size={10} />, 'Parking': <Car size={10} />,
    'Showers': <Droplets size={10} />, 'Pool': <Droplets size={10} />,
    'Trainer': <Dumbbell size={10} />, '24/7': <Clock size={10} />,
};

const TYPE_COLORS: Record<string, string> = {
    gym: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-orange-200 dark:border-orange-800',
    yoga: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    crossfit: 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-800',
    pool: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-800',
};

const GymLocatorView: React.FC = () => {
    const [gyms, setGyms] = useState<Gym[]>(MOCK_GYMS);
    const [locating, setLocating] = useState(false);
    const [located, setLocated] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

    const locateMe = () => {
        setLocating(true);
        setLocationError('');
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            setLocating(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocated(true);
                setLocating(false);
            },
            () => {
                setLocationError('Could not get your location. Please allow location access.');
                setLocating(false);
            },
            { timeout: 10000 }
        );
    };

    const toggleSave = (id: string) => {
        setGyms(prev => prev.map(g => g.id === id ? { ...g, saved: !g.saved } : g));
    };

    const openDirections = (gym: Gym) => {
        const query = encodeURIComponent(gym.name + ' ' + gym.address);
        if (userCoords) {
            window.open(`https://www.google.com/maps/dir/${userCoords.lat},${userCoords.lng}/${query}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/${query}`, '_blank');
        }
    };

    const openMapSearch = () => {
        if (userCoords) {
            window.open(`https://www.google.com/maps/search/gym+near+me/@${userCoords.lat},${userCoords.lng},14z`, '_blank');
        } else {
            window.open('https://www.google.com/maps/search/gym+near+me', '_blank');
        }
    };

    const filtered = gyms.filter(g => {
        const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.address.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || g.type === filterType;
        return matchSearch && matchType;
    });

    return (
        <div className="space-y-8 animate-fadeIn pb-32">

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl border border-white/5">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-saffron-500 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-saffron-400 text-[10px] font-black uppercase tracking-[0.4em]">
                            <MapPin size={14} className="animate-bounce" /> Nearby Gym Locator
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-400 to-orange-300">Perfect Gym</span></h2>
                        <p className="text-slate-400 font-medium max-w-md">Discover gyms, yoga studios, and fitness centres near you. Compare ratings, amenities, and pricing.</p>
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                        <button
                            onClick={locateMe}
                            disabled={locating}
                            className="flex items-center gap-3 px-8 py-4 bg-saffron-500 hover:bg-saffron-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-xl glow-saffron disabled:opacity-60"
                        >
                            {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                            {locating ? 'Locating...' : located ? 'Re-locate Me' : 'Use My Location'}
                        </button>
                        <button onClick={openMapSearch} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10">
                            <ExternalLink size={14} /> Open in Google Maps
                        </button>
                    </div>
                </div>

                {located && userCoords && (
                    <div className="relative z-10 mt-6 flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-fadeIn">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Location found · Showing gyms near you
                    </div>
                )}
                {locationError && (
                    <div className="relative z-10 mt-4 flex items-center gap-2 text-red-400 text-xs font-medium animate-fadeIn">
                        <AlertCircle size={14} /> {locationError}
                    </div>
                )}
            </div>

            {/* Map Embed */}
            {located && userCoords && (
                <div className="rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl animate-fadeIn">
                    <iframe
                        title="Nearby Gyms Map"
                        width="100%"
                        height="320"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${userCoords.lng - 0.02},${userCoords.lat - 0.02},${userCoords.lng + 0.02},${userCoords.lat + 0.02}&layer=mapnik&marker=${userCoords.lat},${userCoords.lng}`}
                    />
                    <div className="bg-white dark:bg-slate-900 px-6 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} className="text-saffron-500" /> Your Location · OpenStreetMap</span>
                        <button onClick={openMapSearch} className="text-[10px] font-black text-saffron-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                            Full Map <ExternalLink size={10} />
                        </button>
                    </div>
                </div>
            )}

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search gyms by name or area..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-saffron-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'gym', 'yoga', 'crossfit', 'pool'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterType === t ? 'bg-saffron-500 text-white border-saffron-500 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-saffron-300'}`}
                        >
                            {t === 'all' ? 'All Types' : t === 'pool' ? '🏊 Pool' : t === 'yoga' ? '🧘 Yoga' : t === 'crossfit' ? '🏋️ CrossFit' : '💪 Gym'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gym Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((gym, i) => (
                    <div
                        key={gym.id}
                        className="glass-card rounded-[2.5rem] overflow-hidden border border-white/20 group cursor-pointer hover:border-saffron-300/50 transition-all"
                        style={{ animationDelay: `${i * 80}ms` }}
                        onClick={() => setSelectedGym(gym)}
                    >
                        {/* Image */}
                        <div className="relative h-44 overflow-hidden">
                            <img src={gym.image} alt={gym.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${TYPE_COLORS[gym.type]}`}>
                                    {gym.type}
                                </span>
                                <span className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                                    {gym.priceRange}
                                </span>
                            </div>
                            {/* Save button */}
                            <button
                                onClick={e => { e.stopPropagation(); toggleSave(gym.id); }}
                                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${gym.saved ? 'bg-red-500 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}
                            >
                                <Heart size={14} className={gym.saved ? 'fill-white' : ''} />
                            </button>
                            {/* Open/Closed */}
                            <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${gym.openNow ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'} backdrop-blur-sm`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${gym.openNow ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
                                {gym.openNow ? 'Open Now' : 'Closed'}
                            </div>
                            <div className="absolute bottom-3 right-3 text-white text-[10px] font-black">{gym.distance}</div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight group-hover:text-saffron-600 dark:group-hover:text-saffron-400 transition-colors">{gym.name}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={10} /> {gym.address}</p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={12} className={i < Math.floor(gym.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'} />
                                    ))}
                                </div>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-300">{gym.rating}</span>
                                <span className="text-[10px] text-slate-400">({gym.reviews} reviews)</span>
                            </div>

                            {/* Hours */}
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                <Clock size={11} /> {gym.hours}
                            </div>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-1.5">
                                {gym.amenities.slice(0, 5).map(a => (
                                    <span key={a} className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 dark:border-slate-700">
                                        {AMENITY_ICONS[a]} {a}
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={e => { e.stopPropagation(); openDirections(gym); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105"
                                >
                                    <Navigation size={12} /> Directions
                                </button>
                                <a
                                    href={`tel:${gym.phone}`}
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 border border-slate-100 dark:border-slate-700"
                                >
                                    <Phone size={12} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <MapPin size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-black uppercase tracking-widest text-sm">No gyms found matching your search</p>
                </div>
            )}

            {/* Detail Modal */}
            {selectedGym && (
                <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedGym(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="relative h-52">
                            <img src={selectedGym.image} alt={selectedGym.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <button onClick={() => setSelectedGym(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-all text-lg font-bold">×</button>
                            <div className="absolute bottom-4 left-5">
                                <h3 className="text-2xl font-black text-white">{selectedGym.name}</h3>
                                <p className="text-white/70 text-sm flex items-center gap-1"><MapPin size={11} /> {selectedGym.address}</p>
                            </div>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <p className="text-lg font-black text-slate-900 dark:text-white">{selectedGym.rating}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <p className="text-lg font-black text-slate-900 dark:text-white">{selectedGym.distance}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Distance</p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <p className="text-lg font-black text-slate-900 dark:text-white">{selectedGym.priceRange}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amenities</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedGym.amenities.map(a => (
                                        <span key={a} className="flex items-center gap-1 px-3 py-1.5 bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 dark:text-saffron-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-saffron-100 dark:border-saffron-900/30">
                                            {AMENITY_ICONS[a]} {a}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => openDirections(selectedGym)} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 glow-saffron">
                                    <Navigation size={14} /> Get Directions
                                </button>
                                <a href={`tel:${selectedGym.phone}`} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105">
                                    <Phone size={14} /> Call
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymLocatorView;
