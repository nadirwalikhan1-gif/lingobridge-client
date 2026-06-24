// CommandCenter.jsx — no hardcoded defaults for real metrics; safe '—' fallbacks

import { useState } from 'react'

// ── Helpers ────────────────────────────────────────────────────────────────
function display(v, suffix = '') {
  return v != null ? `${v}${suffix}` : '—'
}

// ── CommandCenter ──────────────────────────────────────────────────────────
export default function CommandCenter({
  // Status is always safe to default
  status           = 'online',
  // Real metrics — no fake defaults
  callsReceived    = null,
  callsAccepted    = null,
  callsMissed      = null,
  acceptanceRate   = null,
  acceptanceTrend  = null,
  sessionsToday    = null,
  sessionsTrend    = null,
  todayEarnings    = null,
  earningsTrend    = null,
  avgRating        = null,
  ratingTrend      = null,
  hoursToday       = null,
  hoursTrend       = null,
  // Waiting calls badge — safe to default 0
  callsWaiting     = 0,
  onWaitingClick,
}) {
  const statusMeta = {
    online:  { dot: '#1D9E75', label: 'Online',  sub: 'Receiving calls' },
    break:   { dot: '#BA7517', label: 'Break',   sub: 'Paused — metrics preserved' },
    offline: { dot: '#9CA3AF', label: 'Offline', sub: 'Hidden from clients' },
  }
  const meta = statusMeta[status] || statusMeta.online

  return (
    <div className="lb-card !p-0 overflow-hidden">
      {/* Top row: Status + Call queue + Acceptance + Rating */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-lb-border">

        {/* Status */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: meta.dot }}
            />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lb-muted">Status</span>
          </div>
          <p className="text-[22px] font-semibold text-lb-ink leading-none">{meta.label}</p>
          <p className="text-[11px] text-lb-subtle mt-1">{meta.sub}</p>
        </div>

        {/* Call Queue */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lb-muted">Call queue</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-[22px] font-semibold text-lb-ink leading-none">{display(callsReceived)}</p>
            <span className="text-[11px] text-lb-subtle">received</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {callsAccepted != null && (
              <span className="text-[11px] text-[#0F6E56] font-medium">{callsAccepted} accepted</span>
            )}
            {callsAccepted != null && callsMissed != null && (
              <span className="text-[11px] text-lb-subtle">·</span>
            )}
            {callsMissed != null && (
              <span className="text-[11px] text-[#A32D2D] font-medium">{callsMissed} missed</span>
            )}
            {callsAccepted == null && callsMissed == null && (
              <span className="text-[11px] text-lb-subtle">—</span>
            )}
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lb-muted">Acceptance</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className={`text-[22px] font-semibold leading-none ${acceptanceRate != null ? 'text-[#0F6E56]' : 'text-lb-muted'}`}>
              {display(acceptanceRate)}
            </p>
            {acceptanceTrend && (
              <span className="text-[11px] text-[#0F6E56] font-medium">↑ {acceptanceTrend}</span>
            )}
          </div>
          <p className="text-[11px] text-lb-subtle mt-1">Target: 85% minimum</p>
        </div>

        {/* Rating */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lb-muted">Avg rating</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className={`text-[22px] font-semibold leading-none ${avgRating != null ? 'text-[#BA7517]' : 'text-lb-muted'}`}>
              {display(avgRating)}
            </p>
            {ratingTrend && (
              <span className="text-[11px] text-[#0F6E56] font-medium">↑ {ratingTrend}</span>
            )}
          </div>
          <p className="text-[11px] text-lb-subtle mt-1">Based on recent reviews</p>
        </div>
      </div>

      {/* Bottom row: Earnings (dark) + Sessions + Hours + Waiting */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-lb-border border-t border-lb-border">

        {/* Earnings — dark treatment */}
        <div className="bg-[#1a1635] p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Today's earnings</span>
          <div>
            <p className="text-[24px] font-semibold text-white leading-none mt-1">
              {display(todayEarnings)}
            </p>
            {earningsTrend && (
              <p className="text-[11px] text-[#4ade80] mt-1">↑ {earningsTrend} vs yesterday</p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-lb-muted uppercase tracking-widest">Sessions today</span>
          <div>
            <p className="text-[24px] font-semibold text-lb-ink leading-none mt-1">
              {display(sessionsToday)}
            </p>
            {sessionsTrend && (
              <p className="text-[11px] text-[#0F6E56] mt-1">+{String(sessionsTrend).replace('+', '')} from yesterday</p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-lb-muted uppercase tracking-widest">Hours today</span>
          <div>
            <p className="text-[24px] font-semibold text-lb-ink leading-none mt-1">
              {display(hoursToday)}
            </p>
            {hoursTrend && (
              <p className="text-[11px] text-[#0F6E56] mt-1">+{String(hoursTrend).replace('+', '')} vs yesterday</p>
            )}
          </div>
        </div>

        {/* Clickable waiting alert */}
        <button
          onClick={onWaitingClick}
          disabled={callsWaiting === 0}
          className={`p-4 flex flex-col justify-between text-left transition-colors ${
            callsWaiting > 0
              ? 'bg-[#FCEBEB] hover:bg-[#FAD5D5] cursor-pointer'
              : 'bg-white cursor-default'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold uppercase tracking-widest ${callsWaiting > 0 ? 'text-[#A32D2D]' : 'text-lb-muted'}`}>
              Waiting
            </span>
            {callsWaiting > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#E24B4A] animate-pulse" />
            )}
          </div>
          <div>
            <p className={`text-[24px] font-semibold leading-none mt-1 ${callsWaiting > 0 ? 'text-[#A32D2D]' : 'text-lb-ink'}`}>
              {callsWaiting}
            </p>
            {callsWaiting > 0 ? (
              <p className="text-[11px] text-[#A32D2D] mt-1 font-medium">Click to respond →</p>
            ) : (
              <p className="text-[11px] text-lb-subtle mt-1">No calls waiting</p>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

// ─── PerformanceTrendPanel — right sidebar career metrics ──────────────────
export function PerformanceTrendPanel({
  acceptanceRate     = null,
  acceptanceTrend    = null,
  avgResponseTime    = null,
  responseTrend      = null,
  completedSessions  = null,
  sessionsTrend      = null,
  onTimeRate         = null,
  onTimeTrend        = null,
}) {
  const rows = [
    { label: 'Acceptance Rate',    value: acceptanceRate,    trend: acceptanceTrend,   isUp: true },
    { label: 'Avg Response Time',  value: avgResponseTime,   trend: responseTrend,     isUp: true, isTime: true },
    { label: 'Completed Sessions', value: completedSessions, trend: sessionsTrend,     isUp: true },
    { label: 'On-Time Start Rate', value: onTimeRate,        trend: onTimeTrend,       isUp: true },
  ]

  const hasAnyData = rows.some((r) => r.value != null)

  return (
    <div className="lb-card">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-[#534AB7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
        </svg>
        <h3 className="text-[13px] font-medium text-lb-ink">Your Performance</h3>
      </div>
      <p className="text-[10px] text-lb-subtle uppercase tracking-widest mb-3">This month</p>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="text-[12px] text-lb-muted">{r.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-lb-ink">
                {r.value != null ? r.value : '—'}
              </span>
              {r.trend && (
                <span className={`text-[10px] font-medium ${r.isUp ? 'text-[#0F6E56]' : 'text-[#A32D2D]'}`}>
                  ↑ {r.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-lb-border">
        <p className="text-[10px] text-lb-subtle text-center">
          {hasAnyData ? 'Compared to last month' : 'Data loading…'}
        </p>
      </div>
    </div>
  )
}
