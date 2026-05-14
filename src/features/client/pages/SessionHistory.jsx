import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import SessionHistoryList from '@/features/client/components/dashboard/SessionHistoryList';

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

  // Demo sessions data
  const allSessions = [
    {
      id: 1,
      interpreter: { name: 'Maria Gonzalez', avatar: null, initials: 'MG' },
      type: 'video',
      language: 'Spanish → English',
      duration: '45 min',
      price: 32.50,
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
      price: 22.00,
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
      price: 45.00,
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
      price: 18.50,
      rating: 5,
      date: '2024-01-08',
      status: 'completed',
    },
  ];

  const filteredSessions = allSessions.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    // Date filtering logic would go here
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Session History</h1>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />

          {/* Date Filter - styled select */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white text-[11px] font-medium text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-lb-primary/20 focus:border-lb-primary outline-none cursor-pointer"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Session Type Toggle Chips */}
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

      {/* Use SessionHistoryList component - single source of truth */}
      <SessionHistoryList sessions={filteredSessions} showHeader={false} />
    </div>
  );
}
