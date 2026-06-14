import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Filter, Download, FileText, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, Calendar, Clock, Star, Video, Phone,
  ArrowUpDown, Search, X, Receipt
} from 'lucide-react';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

// ─── API Functions ──────────────────────────────────────────────────────────
const fetchSessionHistory = async ({ page, limit, dateFilter, typeFilter, sortBy, search }) => {
  const { data } = await api.get('/v1/sessions/history', {
    params: { page, limit, dateFilter, type: typeFilter, sort: sortBy, search }
  });
  return data;
};

const exportSessions = async ({ format, filters }) => {
  const { data } = await api.post('/v1/sessions/export', { format, filters }, {
    responseType: format === 'csv' ? 'blob' : 'json'
  });
  return data;
};

const downloadInvoice = async (invoiceId) => {
  const { data } = await api.get(`/v1/invoices/${invoiceId}/download`, { responseType: 'blob' });
  return data;
};

const downloadRecording = async (sessionId) => {
  const { data } = await api.get(`/v1/sessions/${sessionId}/recording`, { responseType: 'blob' });
  return data;
};

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ rating, size = 'w-3 h-3' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`${size} ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Session History List Component ───────────────────────────────────────────
export function SessionHistoryList({ sessions, showHeader = true, maxItems, onSessionClick, isLoading }) {
  const navigate = useNavigate();

  const displaySessions = maxItems ? sessions?.slice(0, maxItems) : sessions;

  if (isLoading) {
    return (
      <div className="card p-4">
        {showHeader && <div className="h-5 bg-slate-200 rounded w-32 mb-4 animate-pulse" />}
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-2 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!displaySessions?.length) {
    return (
      <div className="card p-4">
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Recent Sessions</h3>
          </div>
        )}
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-[13px] text-slate-400">No sessions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Recent Sessions</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-xs font-medium text-lb-primary hover:text-lb-deep transition-colors"
          >
            View All
          </button>
        </div>
      )}

      <div className="space-y-2">
        {displaySessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group"
            onClick={() => onSessionClick ? onSessionClick(s) : navigate(`/history/${s.id}`)}
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-slate-600">
                {s.interpreter?.initials || '??'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {s.interpreter?.name || 'Unknown Interpreter'}
                </p>
                {s.type === 'video' ? (
                  <Video className="w-3 h-3 text-violet-500" />
                ) : (
                  <Phone className="w-3 h-3 text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-slate-500">{s.language} · {s.duration} min</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-semibold text-slate-800">${s.price?.toFixed(2)}</p>
              <p className="text-[10px] text-slate-400">{s.date}</p>
              <StarRating rating={s.rating} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Session History Page ─────────────────────────────────────────────────
export default function SessionHistory() {
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const limit = 10;

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'price_desc', label: 'Price (High → Low)' },
    { value: 'price_asc', label: 'Price (Low → High)' },
    { value: 'duration_desc', label: 'Duration (Longest)' },
    { value: 'rating_desc', label: 'Highest Rated' },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['session-history', page, limit, dateFilter, typeFilter, sortBy, debouncedSearch],
    queryFn: () => fetchSessionHistory({ page, limit, dateFilter, typeFilter, sortBy, search: debouncedSearch }),
    staleTime: 60000,
  });

  const sessions = data?.sessions ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  const handleExport = useCallback(async (format) => {
    setExporting(true);
    try {
      const result = await exportSessions({
        format,
        filters: { dateFilter, typeFilter, search: debouncedSearch }
      });

      if (format === 'csv') {
        const blob = new Blob([result], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // PDF
        const blob = new Blob([result], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-history-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to export');
    } finally {
      setExporting(false);
    }
  }, [dateFilter, typeFilter, debouncedSearch]);

  const handleDownloadInvoice = useCallback(async (invoiceId) => {
    try {
      const blob = await downloadInvoice(invoiceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  }, []);

  const handleDownloadRecording = useCallback(async (sessionId) => {
    try {
      const blob = await downloadRecording(sessionId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${sessionId}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download recording');
    }
  }, []);

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-[18px] font-medium text-slate-900 mb-2">Failed to load session history</h3>
          <p className="text-[13px] text-slate-400 mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800">Session History</h1>
          <p className="text-[13px] text-slate-400 mt-1">{totalCount} total sessions</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            CSV
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
            PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by interpreter, language, or invoice #..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="bg-white text-[13px] font-medium text-slate-600 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none cursor-pointer"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white text-[13px] font-medium text-slate-600 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setTypeFilter(opt.value); setPage(1); }}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                typeFilter === opt.value
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          <div className="w-9" />
          <span>Session Details</span>
          <span className="text-right">Date</span>
          <span className="text-right">Duration</span>
          <span className="text-right">Price</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-2 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : sessions.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-[14px] text-slate-400">No sessions found</p>
              <button 
                onClick={() => { setDateFilter('all'); setTypeFilter('all'); setSearch(''); setPage(1); }}
                className="text-[12px] text-violet-600 hover:text-violet-700 mt-2 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            sessions.map((s) => (
              <div 
                key={s.id} 
                className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/history/${s.id}`)}
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-600">{s.interpreter?.initials || '??'}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-slate-900 truncate">{s.interpreter?.name}</p>
                    {s.type === 'video' ? <Video className="w-3 h-3 text-violet-500" /> : <Phone className="w-3 h-3 text-emerald-500" />}
                  </div>
                  <p className="text-[11px] text-slate-400">{s.language} · {s.status}</p>
                  {s.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <StarRating rating={s.rating} size="w-2.5 h-2.5" />
                      <span className="text-[10px] text-slate-400">{s.rating}/5</span>
                    </div>
                  )}
                </div>

                <span className="text-[12px] text-slate-500 text-right">{s.date}</span>
                <span className="text-[12px] text-slate-500 text-right">{s.duration} min</span>
                <span className="text-[13px] font-semibold text-slate-900 text-right">${s.price?.toFixed(2)}</span>

                <div className="flex items-center justify-end gap-1">
                  {s.invoiceId && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(s.invoiceId); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-violet-600 transition-colors"
                      title="Download invoice"
                    >
                      <Receipt size={14} />
                    </button>
                  )}
                  {s.hasRecording && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDownloadRecording(s.id); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-violet-600 transition-colors"
                      title="Download recording"
                    >
                      <Video size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-slate-400">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i)) + i;
              if (p > totalPages) return null;
              return (
                <button 
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-colors ${
                    page === p ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
