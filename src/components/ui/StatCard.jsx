import React from 'react';

/**
 * StatCard Component
 * Polish: tabular-nums on value, improved icon bg with brand tint,
 *         better label contrast (lb-label class), hover-lift,
 *         tighter vertical rhythm (UI UX Pro Max — Executive Dashboard pattern)
 */
export default function StatCard({
  label,
  value,
  trendValue,
  icon: Icon,
}) {
  const getTrendColor = () => {
    if (!trendValue) return 'text-lb-muted';
    if (trendValue.startsWith('+')) return 'text-emerald-600';
    if (trendValue.startsWith('-')) return 'text-red-600';
    return 'text-lb-muted';
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
    <div className="lb-card hover-lift p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="lb-label mb-2">{label}</p>
          <p className="text-2xl lb-stat-num text-lb-ink">{value}</p>
          {trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-[11px] font-semibold ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="w-9 h-9 rounded-xl bg-lb-primary/10 flex items-center justify-center shrink-0">
          {Icon && <Icon className="w-4.5 h-4.5 text-lb-primary" />}
        </div>
      </div>
    </div>
  );
}
