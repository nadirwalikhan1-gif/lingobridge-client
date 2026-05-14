import React from 'react';
import { ChevronRight, Video, Phone } from 'lucide-react';

/**
 * Reusable StarRating sub-component
 * Extracted to eliminate duplication across SessionHistoryList, SessionHistory, RecentReviews, and Favourites
 */
function StarRating({ rating, size = 'w-3 h-3' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`${size} ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Export StarRating for use in other components
export { StarRating };

export default function SessionHistoryList({ sessions, showHeader = true, maxItems }) {
  // Demo data if no sessions prop provided
  const demoSessions = [
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
  ];

  const displaySessions = sessions || demoSessions;
  const limitedSessions = maxItems ? displaySessions.slice(0, maxItems) : displaySessions;

  return (
    <div className="card p-4">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Recent Sessions</h3>
          <button className="text-xs font-medium text-lb-primary hover:text-lb-deep transition-colors">
            View All
          </button>
        </div>
      )}

      <div className="space-y-2">
        {limitedSessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-slate-600">
                {s.interpreter.initials}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {s.interpreter.name}
                </p>
                {s.type === 'video' ? (
                  <Video className="w-3 h-3 text-violet-500" />
                ) : (
                  <Phone className="w-3 h-3 text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-slate-500">{s.language} • {s.duration}</p>
            </div>

            {/* Right Column */}
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-semibold text-slate-800">${s.price.toFixed(2)}</p>
              {/* Date made more readable at text-[10px] */}
              <p className="text-[10px] text-slate-400">{s.date}</p>
              <StarRating rating={s.rating} />
            </div>

            {/* Chevron - appears on hover via group class */}
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
