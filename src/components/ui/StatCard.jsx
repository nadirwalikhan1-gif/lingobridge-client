import React from 'react';

/**
 * StatCard Component
 * 
 * FIXES APPLIED:
 * - Auto-detects trend direction from trendValue prefix (+ → emerald, - → red, else slate)
 * - Removed dependency on separate trend 'up'/'down' prop
 * - Increased icon container from w-7 h-7 to w-8 h-8 for better visual balance
 */
export default function StatCard({
  label,
  value,
  trendValue,
  icon: Icon,
}) {
  // Auto-detect trend color from trendValue prefix
  const getTrendColor = () => {
    if (!trendValue) return 'text-slate-500';
    if (trendValue.startsWith('+')) return 'text-emerald-600';
    if (trendValue.startsWith('-')) return 'text-red-600';
    return 'text-slate-500';
  };

  const getTrendIcon = () => {
    if (!trendValue) return null;
    if (trendValue.startsWith('+')) {
      return (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    if (trendValue.startsWith('-')) {
      return (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
          {trendValue && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {/* FIX: Increased from w-7 h-7 to w-8 h-8, icon from w-3.5 h-3.5 to w-4 h-4 */}
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          {Icon && <Icon className="w-4 h-4 text-slate-600" />}
        </div>
      </div>
    </div>
  );
}
