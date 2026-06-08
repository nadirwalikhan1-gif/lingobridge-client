// Favourites.jsx — saved interpreters for quick rebooking (light theme)

import React, { useState } from 'react';
import {
  Heart, Star, Search, Filter, Calendar, Phone, Video, UserCheck,
  Globe, Award, Clock, X, Plus, AlertCircle, Loader2,
} from 'lucide-react';

const MOCK_FAVOURITES = [
  { id: 1, name: 'Maria Gonzalez', initials: 'MG', languages: ['Spanish', 'English'], rating: 4.9, reviews: 127, certified: true, specializations: ['Legal', 'Medical'], availability: 'Available now', online: true, lastSession: 'Jan 15, 2024', totalSessions: 12, hourlyRate: 45, currency: 'USD' },
  { id: 2, name: 'John Doe', initials: 'JD', languages: ['English', 'Spanish'], rating: 4.7, reviews: 89, certified: true, specializations: ['Medical'], availability: 'Available in 2h', online: false, lastSession: 'Jan 12, 2024', totalSessions: 8, hourlyRate: 38, currency: 'USD' },
  { id: 3, name: 'Sarah Chen', initials: 'SC', languages: ['Mandarin', 'English'], rating: 5.0, reviews: 203, certified: true, specializations: ['Business', 'Legal'], availability: 'Available now', online: true, lastSession: 'Jan 10, 2024', totalSessions: 24, hourlyRate: 55, currency: 'USD' },
  { id: 4, name: 'Ahmed Hassan', initials: 'AH', languages: ['Arabic', 'English'], rating: 4.5, reviews: 64, certified: false, specializations: ['General'], availability: 'Available tomorrow', online: false, lastSession: 'Jan 08, 2024', totalSessions: 5, hourlyRate: 32, currency: 'USD' },
];

const SPEC_FILTERS = [
  { value: 'all', label: 'All' }, { value: 'Legal', label: 'Legal' }, { value: 'Medical', label: 'Medical' },
  { value: 'Business', label: 'Business' }, { value: 'General', label: 'General' },
];

const LANG_FILTERS = [
  { value: 'all', label: 'All' }, { value: 'Spanish', label: 'Spanish' }, { value: 'Mandarin', label: 'Mandarin' },
  { value: 'Arabic', label: 'Arabic' }, { value: 'English', label: 'English' },
];

function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} className={star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
      ))}
    </div>
  );
}

function EmptyState({ onBrowse }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <Heart size={28} className="text-violet-600" />
      </div>
      <h3 className="text-[16px] font-medium text-slate-900 mb-1">No favourites yet</h3>
      <p className="text-[13px] text-slate-400 text-center max-w-sm mb-5">Save interpreters you work with regularly for quick rebooking. Favourites appear here for one-tap access.</p>
      <button onClick={onBrowse} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors">
        <Plus size={14} /> Browse Interpreters
      </button>
    </div>
  );
}

function InterpreterCard({ interpreter, onRemove, onBook }) {
  const [removing, setRemoving] = useState(false);
  const [booking, setBooking] = useState(false);

  const handleRemove = () => { setRemoving(true); setTimeout(() => { onRemove(interpreter.id); setRemoving(false); }, 300); };
  const handleBook = (type) => { setBooking(true); setTimeout(() => { onBook(interpreter.id, type); setBooking(false); }, 400); };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-slate-300 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
              <span className="text-[14px] font-bold text-violet-600">{interpreter.initials}</span>
            </div>
            {interpreter.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />}
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">{interpreter.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StarDisplay rating={interpreter.rating} size={12} />
              <span className="text-[12px] text-slate-400">{interpreter.rating} ({interpreter.reviews} reviews)</span>
            </div>
          </div>
        </div>
        <button onClick={handleRemove} disabled={removing} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100" title="Remove from favourites">
          {removing ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <Globe size={12} /> <span>{interpreter.languages.join(' → ')}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <Award size={12} /> <span>{interpreter.specializations.join(', ')}</span>
          {interpreter.certified && <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full"><UserCheck size={10} /> Certified</span>}
        </div>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <Clock size={12} /> <span className={interpreter.online ? "text-emerald-600" : ""}>{interpreter.availability}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <Calendar size={12} /> <span>{interpreter.totalSessions} sessions · Last: {interpreter.lastSession}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mb-4">
        <span className="text-[12px] text-slate-400">Rate: <span className="text-slate-900 font-medium">${interpreter.hourlyRate}/hr</span></span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => handleBook('video')} disabled={booking} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
          {booking ? <Loader2 size={12} className="animate-spin" /> : <Video size={12} />} Book Video
        </button>
        <button onClick={() => handleBook('audio')} disabled={booking} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-100 transition-colors disabled:opacity-50">
          <Phone size={12} /> Book Audio
        </button>
      </div>
    </div>
  );
}

export default function Favourites() {
  const [favourites, setFavourites] = useState(MOCK_FAVOURITES);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = favourites
    .filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.languages.some((l) => l.toLowerCase().includes(search.toLowerCase()));
      const matchesSpec = specFilter === 'all' || f.specializations.includes(specFilter);
      const matchesLang = langFilter === 'all' || f.languages.includes(langFilter);
      return matchesSearch && matchesSpec && matchesLang;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return b.totalSessions - a.totalSessions;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'rate_asc') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'rate_desc') return b.hourlyRate - a.hourlyRate;
      return 0;
    });

  const handleRemove = (id) => setFavourites((prev) => prev.filter((f) => f.id !== id));
  const handleBook = (id, type) => alert("Booking " + type + " session with interpreter #" + id);
  const handleBrowse = () => alert('Navigate to interpreter browse page');

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 mb-1">Favourites</h1>
          <p className="text-[13px] text-slate-400">{favourites.length} saved interpreter{favourites.length !== 1 ? 's' : ''} · Quick rebooking</p>
        </div>
        <button onClick={handleBrowse} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors shrink-0">
          <Plus size={14} /> Add New
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name or language..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 shadow-sm" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={"flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-colors shrink-0 " + (showFilters ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 shadow-sm")}>
          <Filter size={14} /> Filters
        </button>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0 shadow-sm">
          <option value="recent">Sort: Most Sessions</option>
          <option value="rating">Sort: Highest Rated</option>
          <option value="rate_asc">Sort: Rate (Low → High)</option>
          <option value="rate_desc">Sort: Rate (High → Low)</option>
        </select>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] text-slate-400">Specialization:</span>
            {SPEC_FILTERS.map((f) => (
              <button key={f.value} onClick={() => setSpecFilter(f.value)} className={"text-[11px] px-2.5 py-1 rounded-full transition-colors " + (specFilter === f.value ? "bg-violet-600 text-white" : "bg-slate-50 text-slate-500 hover:text-slate-700")}>{f.label}</button>
            ))}
          </div>
          <div className="w-full h-px bg-slate-100 my-3" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] text-slate-400">Language:</span>
            {LANG_FILTERS.map((f) => (
              <button key={f.value} onClick={() => setLangFilter(f.value)} className={"text-[11px] px-2.5 py-1 rounded-full transition-colors " + (langFilter === f.value ? "bg-violet-600 text-white" : "bg-slate-50 text-slate-500 hover:text-slate-700")}>{f.label}</button>
            ))}
          </div>
        </div>
      )}

      {filtered.length !== favourites.length && <p className="text-[12px] text-slate-400 mb-4">Showing {filtered.length} of {favourites.length} favourites</p>}

      {filtered.length === 0 ? (
        favourites.length === 0 ? <EmptyState onBrowse={handleBrowse} /> : (
          <div className="text-center py-16">
            <AlertCircle size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-[14px] text-slate-400">No favourites match your filters</p>
            <button onClick={() => { setSearch(""); setSpecFilter('all'); setLangFilter('all'); }} className="text-[12px] text-violet-600 hover:text-violet-700 mt-2 transition-colors">Clear all filters</button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((interp) => <InterpreterCard key={interp.id} interpreter={interp} onRemove={handleRemove} onBook={handleBook} />)}
        </div>
      )}
    </div>
  );
}