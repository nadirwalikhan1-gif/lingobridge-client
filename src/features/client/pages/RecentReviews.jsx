import React, { useState } from 'react';
import { StarRating } from '@/features/client/components/dashboard/SessionHistoryList';

export default function RecentReviews() {
  const [filter, setFilter] = useState('all'); // 'all' | '5' | '4below'

  const allReviews = [
    {
      id: 1,
      interpreter: 'Maria Gonzalez',
      initials: 'MG',
      rating: 5,
      text: 'Excellent interpretation skills. Very professional and punctual.',
      date: 'Jan 15, 2024',
      sessionType: 'video',
    },
    {
      id: 2,
      interpreter: 'John Doe',
      initials: 'JD',
      rating: 4,
      text: 'Good session, but had minor audio issues at the start.',
      date: 'Jan 12, 2024',
      sessionType: 'audio',
    },
    {
      id: 3,
      interpreter: 'Sarah Chen',
      initials: 'SC',
      rating: 5,
      text: 'Absolutely fantastic! Made the business meeting seamless.',
      date: 'Jan 10, 2024',
      sessionType: 'video',
    },
    {
      id: 4,
      interpreter: 'Ahmed Hassan',
      initials: 'AH',
      rating: 3,
      text: 'Decent but struggled with technical terminology.',
      date: 'Jan 08, 2024',
      sessionType: 'audio',
    },
  ];

  // Calculate average and distribution
  const averageRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allReviews.filter((r) => r.rating === star).length,
    percentage: Math.round((allReviews.filter((r) => r.rating === star).length / allReviews.length) * 100),
  }));

  const filteredReviews = allReviews.filter((r) => {
    if (filter === 'all') return true;
    if (filter === '5') return r.rating === 5;
    if (filter === '4below') return r.rating <= 4;
    return true;
  });

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: '5', label: '5 Stars' },
    { value: '4below', label: '4 Stars & Below' },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Reviews</h1>
      </div>

      {/* Average Rating Summary with Bar Chart */}
      <div className="card p-5">
        <div className="flex items-center gap-6">
          {/* Big Average */}
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-800">{averageRating}</p>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              <StarRating rating={Math.round(Number(averageRating))} size="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-400 mt-1">{allReviews.length} reviews</p>
          </div>

          {/* Bar Chart Breakdown */}
          <div className="flex-1 space-y-1.5">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 w-3">{d.star}</span>
                <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Toggle Chips */}
      <div className="flex items-center gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              filter === opt.value
                ? 'bg-lb-primary text-white border-lb-primary'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="card p-4 space-y-3">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-slate-600">{review.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-800">{review.interpreter}</p>
                  <span className="text-xs text-slate-400">{review.date}</span>
                </div>
                {/* Use shared StarRating component */}
                <div className="mb-2">
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-slate-600">{review.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
