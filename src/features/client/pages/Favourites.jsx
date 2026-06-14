import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Heart, Star, Search, Filter, Calendar, Phone, Video, UserCheck,
  Globe, Award, Clock, X, Plus, AlertCircle, Loader2, ArrowRight,
  MessageSquare, SlidersHorizontal
} from 'lucide-react';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

// ─── API Functions ──────────────────────────────────────────────────────────
const fetchFavourites = async ({ search, spec, lang, sort, page = 1, limit = 12 }) => {
  const { data } = await api.get('/v1/favourites', {
    params: { search, specialization: spec, language: lang, sort, page, limit }
  });
  return data;
};

const removeFavourite = async (interpreterId) => {
  await api.delete(`/v1/favourites/${interpreterId}`);
};

const bookSession = async ({ interpreterId, type, scheduledAt }) => {
  const { data } = await api.post('/v1/sessions', {
    interpreterId,
    type,
    scheduledAt,
    status: scheduledAt ? 'scheduled' : 'pending'
  });
  return data;
};

// ─── Star Display Component ─────────────────────────────────────────────────
function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} className={star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
      ))}
    </div>
  );
}

// ─── Pagination Helper ─────────────────────────────────────────────────────────
function getPaginationRange(currentPage, totalPages, windowSize = 5) {
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  let end   = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onBrowse }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <Heart size={28} className="text-violet-600" />
      </div>
      <h3 className="text-[16px] font-medium text-slate-900 mb-1">No favourites yet</h3>
      <p className="text-[13px] text-slate-400 text-center max-w-sm mb-5">
        Save interpreters you work with regularly for quick rebooking. Favourites appear here for one-tap access.
      </p>
      <button 
        onClick={onBrowse} 
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors"
      >
        <Plus size={14} /> Browse Interpreters
      </button>
    </div>
  );
}

// ─── Book Modal ───────────────────────────────────────────────────────────────
function BookModal({ interpreter, isOpen, onClose }) {
  const [type, setType] = useState('video');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState('now'); // 'now' or 'later'
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const bookMutation = useMutation({
    mutationFn: bookSession,
    onSuccess: (data) => {
      toast.success(mode === 'now' ? 'Session request sent!' : 'Session scheduled!');
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
      if (mode === 'now') {
        navigate(`/sessions/${data.id}`);
      } else {
        navigate('/calendar');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to book session');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-bold text-slate-900">Book with {interpreter.name}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <span className="text-[13px] font-bold text-violet-600">{interpreter.initials}</span>
            </div>
            <div>
              <p className="text-[13px] font-medium text-slate-900">{interpreter.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <StarDisplay rating={interpreter.rating} size={12} />
                <span className="text-[11px] text-slate-400">{interpreter.rating}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-2 block">When?</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setMode('now')}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium border transition-colors ${
                    mode === 'now' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-200'
                  }`}
                >
                  Start Now
                </button>
                <button 
                  onClick={() => setMode('later')}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium border transition-colors ${
                    mode === 'later' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-200'
                  }`}
                >
                  Schedule
                </button>
              </div>
            </div>

            {mode === 'later' && (
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Date & Time</label>
                <input 
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-violet-400"
                />
              </div>
            )}

            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-2 block">Session Type</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setType('video')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium border transition-colors ${
                    type === 'video' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-200'
                  }`}
                >
                  <Video size={14} /> Video
                </button>
                <button 
                  onClick={() => setType('audio')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium border transition-colors ${
                    type === 'audio' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-200'
                  }`}
                >
                  <Phone size={14} /> Audio
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => bookMutation.mutate({ interpreterId: interpreter.id, type, scheduledAt: mode === 'later' ? scheduledAt : undefined })}
                disabled={bookMutation.isPending || (mode === 'later' && !scheduledAt)}
                className="w-full py-3 rounded-xl bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {bookMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                {bookMutation.isPending ? 'Booking...' : mode === 'now' ? 'Request Session' : 'Schedule Session'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Interpreter Card ───────────────────────────────────────────────────────
function InterpreterCard({ interpreter, onRemove, onBook, onMessage }) {
  const [removing, setRemoving] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);

  const handleRemove = useCallback(async () => {
    setRemoving(true);
    try {
      await onRemove(interpreter.id);
      toast.success('Removed from favourites');
    } catch (err) {
      toast.error('Failed to remove');
      setRemoving(false);
    }
  }, [interpreter.id, onRemove]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-slate-300 transition-colors group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-[14px] font-bold text-violet-600">{interpreter.initials}</span>
              </div>
              {interpreter.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900">{interpreter.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <StarDisplay rating={interpreter.rating} size={12} />
                <span className="text-[12px] text-slate-400">{interpreter.rating} ({interpreter.reviews} reviews)</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleRemove} 
            disabled={removing} 
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100" 
            title="Remove from favourites"
          >
            {removing ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <Globe size={12} /> <span>{interpreter.languages?.join(' → ')}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <Award size={12} /> 
            <span>{interpreter.specializations?.join(', ')}</span>
            {interpreter.certified && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                <UserCheck size={10} /> Certified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <Clock size={12} /> 
            <span className={interpreter.online ? "text-emerald-600 font-medium" : ""}>{interpreter.availability}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <Calendar size={12} /> 
            <span>{interpreter.totalSessions} sessions · Last: {interpreter.lastSession}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mb-4">
          <span className="text-[12px] text-slate-400">
            Rate: <span className="text-slate-900 font-medium">${interpreter.hourlyRate}/hr</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowBookModal(true)} 
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-700 transition-colors"
          >
            <Video size={12} /> Book Session
          </button>
          <button 
            onClick={() => onMessage(interpreter.id)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Send message"
          >
            <MessageSquare size={14} />
          </button>
        </div>
      </div>

      <BookModal 
        interpreter={interpreter} 
        isOpen={showBookModal} 
        onClose={() => setShowBookModal(false)} 
      />
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Favourites() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ['favourites', debouncedSearch, specFilter, langFilter, sortBy, page],
    queryFn: () => fetchFavourites({ 
      search: debouncedSearch, 
      spec: specFilter, 
      lang: langFilter, 
      sort: sortBy, 
      page 
    }),
    staleTime: 30000,
  });

  const removeMutation = useMutation({
    mutationFn: removeFavourite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove favourite');
    }
  });

  const handleBrowse = () => navigate('/interpreters');
  const handleMessage = (interpreterId) => navigate(`/messages?interpreter=${interpreterId}`);

  const favourites = data?.favourites ?? [];
  const totalPages = data?.totalPages ?? 1;
  const specOptions = data?.filters?.specializations ?? [];
  const langOptions = data?.filters?.languages ?? [];

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl">
        <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-64 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h3 className="text-[16px] font-medium text-slate-900 mb-2">Failed to load favourites</h3>
        <p className="text-[13px] text-slate-400 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!favourites.length && !debouncedSearch && specFilter === 'all' && langFilter === 'all') {
    return <EmptyState onBrowse={handleBrowse} />;
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 mb-1">Favourites</h1>
          <p className="text-[13px] text-slate-400">
            {data?.totalCount ?? 0} saved interpreter{data?.totalCount !== 1 ? 's' : ''} · Quick rebooking
          </p>
        </div>
        <button 
          onClick={handleBrowse} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors shrink-0"
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or language..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 shadow-sm" 
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-colors shrink-0 ${
            showFilters ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 shadow-sm"
          }`}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0 shadow-sm"
        >
          <option value="recent">Sort: Most Recent</option>
          <option value="rating">Sort: Highest Rated</option>
          <option value="sessions">Sort: Most Sessions</option>
          <option value="rate_asc">Sort: Rate (Low → High)</option>
          <option value="rate_desc">Sort: Rate (High → Low)</option>
        </select>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          {specOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-[12px] text-slate-400">Specialization:</span>
              <button 
                onClick={() => { setSpecFilter('all'); setPage(1); }}
                className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                  specFilter === 'all' ? "bg-violet-600 text-white" : "bg-slate-50 text-slate-500 hover:text-slate-700"
                }`}
              >
                All
              </button>
              {specOptions.map((spec) => (
                <button 
                  key={spec} 
                  onClick={() => { setSpecFilter(spec); setPage(1); }}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                    specFilter === spec ? "bg-violet-600 text-white" : "bg-slate-50 text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          )}
          <div className="w-full h-px bg-slate-100 my-3" />
          {langOptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[12px] text-slate-400">Language:</span>
              <button 
                onClick={() => { setLangFilter('all'); setPage(1); }}
                className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                  langFilter === 'all' ? "bg-violet-600 text-white" : "bg-slate-50 text-slate-500 hover:text-slate-700"
                }`}
              >
                All
              </button>
              {langOptions.map((lang) => (
                <button 
                  key={lang} 
                  onClick={() => { setLangFilter(lang); setPage(1); }}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${
                    langFilter === lang ? "bg-violet-600 text-white" : "bg-slate-50 text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {favourites.length !== (data?.totalCount ?? 0) && (
        <p className="text-[12px] text-slate-400 mb-4">
          Showing {favourites.length} of {data?.totalCount ?? 0} favourites
        </p>
      )}

      {favourites.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-[14px] text-slate-400">No favourites match your filters</p>
          <button 
            onClick={() => { setSearch(""); setSpecFilter('all'); setLangFilter('all'); setPage(1); }}
            className="text-[12px] text-violet-600 hover:text-violet-700 mt-2 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favourites.map((interp) => (
            <InterpreterCard 
              key={interp.id} 
              interpreter={interp} 
              onRemove={removeMutation.mutate} 
              onBook={() => {}}
              onMessage={handleMessage}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
          </button>
          {getPaginationRange(page, totalPages).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors ${
                page === p ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
