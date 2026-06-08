// Favourites.jsx — saved interpreters for quick rebooking
// Target: 8.5/10 — retention feature, drives repeat bookings

import React, { useState } from 'react';
import {
  Heart, Star, Search, Filter, Calendar, Phone, Video, UserCheck,
  Globe, Award, Clock, X, Plus, AlertCircle, Loader2,
} from 'lucide-react';

// ── Mock data — replace with API: GET /api/client/favourites ──
const MOCK_FAVOURITES = [
  {
    id: 1, name: 'Maria Gonzalez', initials: 'MG', languages: ['Spanish', 'English'],
    rating: 4.9, reviews: 127, certified: true, specializations: ['Legal', 'Medical'],
    availability: 'Available now', online: true, lastSession: 'Jan 15, 2024',
    totalSessions: 12, hourlyRate: 45, currency: 'USD',
  },
  {
    id: 2, name: 'John Doe', initials: 'JD', languages: ['English', 'Spanish'],
    rating: 4.7, reviews: 89, certified: true, specializations: ['Medical'],
    availability: 'Available in 2h', online: false, lastSession: 'Jan 12, 2024',
    totalSessions: 8, hourlyRate: 38, currency: 'USD',
  },
  {
    id: 3, name: 'Sarah Chen', initials: 'SC', languages: ['Mandarin', 'English'],
    rating: 5.0, reviews: 203, certified: true, specializations: ['Business', 'Legal'],
    availability: 'Available now', online: true, lastSession: 'Jan 10, 2024',
    totalSessions: 24, hourlyRate: 55, currency: 'USD',
  },
  {
    id: 4, name: 'Ahmed Hassan', initials: 'AH', languages: ['Arabic', 'English'],
    rating: 4.5, reviews: 64, certified: false, specializations: ['General'],
    availability: 'Available tomorrow', online: false, lastSession: 'Jan 08, 2024',
    totalSessions: 5, hourlyRate: 32, currency: 'USD',
  },
];

const SPEC_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Business', label: 'Business' },
  { value: 'General', label: 'General' },
];

const LANG_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Mandarin', label: 'Mandarin' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'English', label: 'English' },
];

// ── Star rating ──
function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? 'text-[#BA7517] fill-[#BA7517]'
              : 'text-white/10'
          }
        />
      ))}
    </div>
  );
}

// ── Empty state ──
function EmptyState({ onBrowse }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-[#7F77DD]/10 flex items-center justify-center mb-4">
        <Heart size={28} className="text-[#7F77DD]" />
      </div>
      <h3 className="text-[16px] font-medium text-white mb-1">No favourites yet</h3>
      <p className="text-[13px] text-white/40 text-center max-w-sm mb-5">
        Save interpreters you work with regularly for quick rebooking. Favourites appear here for one-tap access.
      </p>
      <button
        onClick={onBrowse}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7F77DD] text-white text-[13px] font-medium hover:bg-[#6B64C4] transition-colors"
      >
        <Plus size={14} />
        Browse Interpreters
      </button>
    </div>
  );
}

// ── Interpreter card ──
function InterpreterCard({ interpreter, onRemove, onBook }) {
  const [removing, setRemoving] = useState(false);
  const [booking, setBooking] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => {
      onRemove(interpreter.id);
      setRemoving(false);
    }, 300);
  };

  const handleBook = (type) => {
    setBooking(true);
    setTimeout(() => {
      onBook(interpreter.id, type);
      setBooking(false);
    }, 400);
  };

  return (
    <div className="bg-[#1C1A2E] border border-white/8 rounded-xl p-5 hover:border-white/15 transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#7F77DD]/20 flex items-center justify-center">
              <span className="text-[14px] font-bold text-[#A8A3E8]">{interpreter.initials}</span>
            </div>
            {interpreter.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1D9E75] border-2 border-[#1C1A2E]" />
            )}
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-white">{interpreter.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StarDisplay rating={interpreter.rating} size={12} />
              <span className="text-[12px] text-white/50">
                {interpreter.rating} ({interpreter.reviews} reviews)
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="p-1.5 rounded-lg text-white/20 hover:text-[#E24B4A] hover:bg-[#E24B4A]/10 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove from favourites"
        >
          {removing ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
        </button>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[12px] text-white/50">
          <Globe size={12} />
          <span>{interpreter.languages.join(' → ')}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-white/50">
          <Award size={12} />
          <span>{interpreter.specializations.join(', ')}</span>
          {interpreter.certified && (
            <span className="flex items-center gap-1 text-[10px] text-[#1D9E75] bg-[#1D9E75]/10 px-1.5 py-0.5 rounded-full">
              <UserCheck size={10} /> Certified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[12px] text-white/50">
          <Clock size={12} />
          <span className={interpreter.online ? 'text-[#1D9E75]' : ''}>{interpreter.availability}</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-white/50">
          <Calendar size={12} />
          <span>{interpreter.totalSessions} sessions · Last: {interpreter.lastSession}</span>
        </div>
      </div>

      {/* Rate */}
      <div className="pt-3 border-t border-white/5 mb-4">
        <span className="text-[12px] text-white/40">
          Rate: <span className="text-white font-medium">${interpreter.hourlyRate}/hr</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleBook('video')}
          disabled={booking}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#7F77DD] text-white text-[12px] font-medium hover:bg-[#6B64C4] transition-colors disabled:opacity-50"
        >
          {booking ? <Loader2 size={12} className="animate-spin" /> : <Video size={12} />}
          Book Video
        </button>
        <button
          onClick={() => handleBook('audio')}
          disabled={booking}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#13111F] border border-white/10 text-white text-[12px] font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <Phone size={12} />
          Book Audio
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
      const matchesSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.languages.some((l) => l.toLowerCase().includes(search.toLowerCase()));
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

  const handleRemove = (id) => {
    setFavourites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleBook = (id, type) => {
    alert(`Booking ${type} session with interpreter #${id}`);
  };

  const handleBrowse = () => {
    alert('Navigate to interpreter browse page');
  };

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-white mb-1">Favourites</h1>
          <p className="text-[13px] text-white/40">
            {favourites.length} saved interpreter{favourites.length !== 1 ? 's' : ''} · Quick rebooking
          </p>
        </div>
        <button
          onClick={handleBrowse}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7F77DD] text-white text-[13px] font-medium hover:bg-[#6B64C4] transition-colors shrink-0"
        >
          <Plus size={14} />
          Add New
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name or language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1C1A2E] border border-white/8 rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13px] font-medium transition-colors shrink-0 ${
            showFilters
              ? 'bg-[#7F77DD]/10 border-[#7F77DD]/30 text-[#7F77DD]'
              : 'bg-[#1C1A2E] border-white/8 text-white/50 hover:text-white/70'
          }`}
        >
          <Filter size={14} />
          Filters
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#1C1A2E] border border-white/8 rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none appearance-none cursor-pointer shrink-0"
        >
          <option value="recent">Sort: Most Sessions</option>
          <option value="rating">Sort: Highest Rated</option>
          <option value="rate_asc">Sort: Rate (Low → High)</option>
          <option value="rate_desc">Sort: Rate (High → Low)</option>
        </select>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-[#1C1A2E] border border-white/8 rounded-xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] text-white/40">Specialization:</span>
            {SPEC_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSpecFilter(f.value)}
                className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                  specFilter === f.value
                    ? 'bg-[#7F77DD] text-white'
                    : 'bg-white/5 text-white/50 hover:text-white/70'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="w-full h-px bg-white/10 my-3" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[12px] text-white/40">Language:</span>
            {LANG_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setLangFilter(f.value)}
                className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                  langFilter === f.value
                    ? 'bg-[#7F77DD] text-white'
                    : 'bg-white/5 text-white/50 hover:text-white/70'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      {filtered.length !== favourites.length && (
        <p className="text-[12px] text-white/40 mb-4">
          Showing {filtered.length} of {favourites.length} favourites
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        favourites.length === 0 ? (
          <EmptyState onBrowse={handleBrowse} />
        ) : (
          <div className="text-center py-16">
            <AlertCircle size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-[14px] text-white/40">No favourites match your filters</p>
            <button
              onClick={() => { setSearch(''); setSpecFilter('all'); setLangFilter('all'); }}
              className="text-[12px] text-[#7F77DD] hover:text-[#A8A3E8] mt-2 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((interp) => (
            <InterpreterCard
              key={interp.id}
              interpreter={interp}
              onRemove={handleRemove}
              onBook={handleBook}
            />
          ))}
        </div>
      )}
    </div>
  );
}