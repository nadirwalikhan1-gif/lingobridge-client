import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import SessionHistoryList from '@/features/client/components/dashboard/SessionHistoryList';
// FIX: vault-model — import client rates for dynamic pricing
import { CLIENT_RATES } from '@/config/constants';

export default function SessionHistory() {
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
  ];

  // FIX: vault-model — demo sessions with minutes field, price computed dynamically
  const allSessions = [
    {
      id: 1,
      interpreter: { name: 'Maria Gonzalez', avatar: null, initials: 'MG' },
      type: 'video',
      language: 'Spanish → English',
      duration: '45 min',
      minutes: 45,
      rating: 5,
      date: '2024-01-15',
      status: 'completed',
    },
    {
      id: 2,
      interpreter: { name: 'John Doe', avatar: null, initials: 'JD' },
      type: 'audio',
      language: 'French → English',
      duration: '30 min',
      minutes: 30,
      rating: 4,
      date: '2024-01-12',
      status: 'completed',
    },
    {
      id: 3,
      interpreter: { name: 'Sarah Chen', avatar: null, initials: 'SC' },
      type: 'video',
      language: 'Mandarin → English',
      duration: '60 min',
      minutes: 60,
      rating: 5,
      date: '2024-01-10',
      status: 'completed',
    },
    {
      id: 4,
      interpreter: { name: 'Ahmed Hassan', avatar: null, initials: 'AH' },
      type: 'audio',
      language: 'Arabic → English',
      duration: '25 min',
      minutes: 25,
      rating: 5,
      date: '2024-01-08',
      status: 'completed',
    },
  ].map(s => ({
    ...s,
    // FIX: vault-model — compute price from CLIENT_RATES (audio $1.49, video $1.79)
    price: +(s.minutes * (CLIENT_RATES[s.type] || 0)).toFixed(2),
  }));

  const filteredSessions = allSessions.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Session History</h1>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white text-[11px] font-medium text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-lb-primary/20 focus:border-lb-primary outline-none cursor-pointer"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                  typeFilter === opt.value
                    ? 'bg-lb-primary text-white border-lb-primary'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SessionHistoryList sessions={filteredSessions} showHeader={false} />
    </div>
  );
}
