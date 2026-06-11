// MySessions.jsx — full production page
// Tabs: Upcoming / In Progress / Completed / Cancelled
// Features: search, sort, session detail modal, socket live updates

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'

// ── Constants ────────────────────────────────────────────────────────────────

const TABS = ['Upcoming', 'In Progress', 'Completed', 'Cancelled']

const TAB_STATUS_MAP = {
  'Upcoming':    ['upcoming', 'scheduled', 'confirmed'],
  'In Progress': ['in_progress', 'active', 'live'],
  'Completed':   ['completed', 'done', 'finished'],
  'Cancelled':   ['cancelled', 'canceled', 'no_show'],
}

const STATUS_BADGE = {
  upcoming:   { bg: 'bg-[#EEEDFE]',  text: 'text-[#534AB7]',  label: 'Upcoming'    },
  scheduled:  { bg: 'bg-[#EEEDFE]',  text: 'text-[#534AB7]',  label: 'Scheduled'   },
  confirmed:  { bg: 'bg-[#EEEDFE]',  text: 'text-[#534AB7]',  label: 'Confirmed'   },
  in_progress:{ bg: 'bg-[#E1F5EE]',  text: 'text-[#0F6E56]',  label: 'In Progress' },
  active:     { bg: 'bg-[#E1F5EE]',  text: 'text-[#0F6E56]',  label: 'Live'        },
  live:       { bg: 'bg-[#E1F5EE]',  text: 'text-[#0F6E56]',  label: 'Live'        },
  completed:  { bg: 'bg-[#EAF3DE]',  text: 'text-[#3B6D11]',  label: 'Completed'   },
  done:       { bg: 'bg-[#EAF3DE]',  text: 'text-[#3B6D11]',  label: 'Completed'   },
  finished:   { bg: 'bg-[#EAF3DE]',  text: 'text-[#3B6D11]',  label: 'Completed'   },
  cancelled:  { bg: 'bg-[#FCEBEB]',  text: 'text-[#A32D2D]',  label: 'Cancelled'   },
  canceled:   { bg: 'bg-[#FCEBEB]',  text: 'text-[#A32D2D]',  label: 'Cancelled'   },
  no_show:    { bg: 'bg-[#FCEBEB]',  text: 'text-[#A32D2D]',  label: 'No Show'     },
}

const DOMAIN_COLORS = {
  'Medical':         { bg: '#E1F5EE', text: '#0F6E56', border: '#1D9E75' },
  'Legal':           { bg: '#FCEBEB', text: '#A32D2D', border: '#E24B4A' },
  'Insurance':       { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'Social Services': { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Government':      { bg: '#F3E8FF', text: '#7C3AED', border: '#A78BFA' },
  'Business':        { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Technical':       { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'General':         { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc',  label: 'Oldest first' },
  { value: 'earnings',  label: 'Highest earnings' },
  { value: 'duration',  label: 'Longest first' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitial(name = '') {
  return (name.trim()[0] ?? '?').toUpperCase()
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function fmtDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' +
         d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function timeUntil(iso) {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return null
  const m = Math.floor(diff / 60000)
  if (m < 60)   return `in ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24)   return `in ${h}h ${m % 60}m`
  return `in ${Math.floor(h / 24)}d`
}

function getBadge(status) {
  return STATUS_BADGE[status] ?? { bg: 'bg-lb-surface', text: 'text-lb-muted', label: status ?? 'Unknown' }
}

function getDomainStyle(cat) {
  return DOMAIN_COLORS[cat] || DOMAIN_COLORS['General']
}

function sortSessions(list, sortBy) {
  return [...list].sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.scheduledAt ?? a.startedAt ?? 0) - new Date(b.scheduledAt ?? b.startedAt ?? 0)
      case 'earnings':
        return (parseFloat(b.earnings) || 0) - (parseFloat(a.earnings) || 0)
      case 'duration':
        return (parseInt(b.duration) || 0) - (parseInt(a.duration) || 0)
      default: // date_desc
        return new Date(b.scheduledAt ?? b.startedAt ?? 0) - new Date(a.scheduledAt ?? a.startedAt ?? 0)
    }
  })
}

function tabMatchesSession(tab, session) {
  const status = (session.status ?? '').toLowerCase()
  return TAB_STATUS_MAP[tab]?.includes(status) ?? false
}

// ── Session card ──────────────────────────────────────────────────────────────

function SessionCard({ session, onViewDetails, onJoin }) {
  const status      = session.status ?? 'upcoming'
  const badge       = getBadge(status)
  const isLive      = TAB_STATUS_MAP['In Progress'].includes(status)
  const isUpcoming  = TAB_STATUS_MAP['Upcoming'].includes(status)
  const clientName  = session.clientName ?? session.client ?? 'Client'
  const avatar      = session.avatar ?? getInitial(clientName)
  const fromLang    = session.fromLang ?? session.language ?? 'Unknown'
  const toLang      = session.toLang   ?? session.targetLanguage ?? 'Unknown'
  const duration    = session.duration ?? session.expectedDuration ?? '—'
  const sessionType = session.sessionType ?? session.type ?? 'audio'
  const isVideo     = sessionType === 'video'
  const category    = session.category ?? session.domain ?? 'General'
  const domainStyle = getDomainStyle(category)
  const earnings    = session.earnings != null ? parseFloat(session.earnings).toFixed(2) : null
  const rating      = session.rating   ?? session.clientRating ?? null
  const notes       = session.notes    ?? session.summary ?? null
  const scheduledAt = session.scheduledAt ?? session.startedAt ?? session.createdAt ?? null
  const until       = isUpcoming ? timeUntil(scheduledAt) : null
  const providerOrg = session.providerOrg ?? session.organization ?? session.clientOrg ?? null

  return (
    <div
      className={`lb-card cursor-pointer hover:shadow-md transition-shadow ${
        isLive ? 'border-2 border-[#1D9E75]/40' : ''
      }`}
      onClick={() => onViewDetails(session)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 ${
          isLive     ? 'bg-[#E1F5EE] text-[#0F6E56]' :
          isUpcoming ? 'bg-[#EEEDFE] text-[#534AB7]' :
          status === 'completed' || status === 'done' ? 'bg-[#EAF3DE] text-[#3B6D11]' :
          'bg-[#FCEBEB] text-[#A32D2D]'
        }`}>
          {avatar}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-lb-ink">{fromLang} → {toLang}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} flex items-center gap-1`}>
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />}
              {badge.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted">
              {isVideo ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              )}
              {isVideo ? 'Video' : 'Audio'} · {duration}
            </span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
              style={{ backgroundColor: domainStyle.bg, color: domainStyle.text, borderColor: domainStyle.border }}
            >
              {category}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <p className="text-[11px] text-lb-muted">{clientName}</p>
            {providerOrg && <><span className="text-[10px] text-lb-subtle">·</span><p className="text-[11px] text-lb-muted">{providerOrg}</p></>}
            {scheduledAt && (
              <><span className="text-[10px] text-lb-subtle">·</span><p className="text-[11px] text-lb-subtle">{fmtDateTime(scheduledAt)}</p></>
            )}
            {until && (
              <span className="text-[10px] font-semibold text-[#534AB7] bg-[#EEEDFE] px-1.5 py-0.5 rounded">{until}</span>
            )}
          </div>
        </div>

        {/* Right col: earnings + rating */}
        <div className="shrink-0 text-right flex flex-col gap-1">
          {earnings != null && (
            <p className="text-[14px] font-semibold text-[#26215C]">${earnings}</p>
          )}
          {rating != null && (
            <p className="text-[11px] text-[#BA7517]">
              {'★'.repeat(Math.min(5, Math.round(rating)))}
              {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.round(rating))))}
            </p>
          )}
          {notes && (
            <svg className="w-3.5 h-3.5 text-lb-subtle ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} title="Has notes">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Live: rejoin button */}
      {isLive && (
        <div className="mt-3 pt-3 border-t border-[#1D9E75]/20">
          <button
            onClick={(e) => { e.stopPropagation(); onJoin(session) }}
            className="w-full py-2 text-[12px] font-semibold rounded-xl bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-colors"
          >
            Rejoin session →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Session detail modal ──────────────────────────────────────────────────────

function SessionModal({ session, onClose, onJoin }) {
  if (!session) return null

  const status      = session.status ?? 'upcoming'
  const badge       = getBadge(status)
  const isLive      = TAB_STATUS_MAP['In Progress'].includes(status)
  const clientName  = session.clientName  ?? session.client ?? 'Client'
  const fromLang    = session.fromLang    ?? session.language ?? 'Unknown'
  const toLang      = session.toLang      ?? session.targetLanguage ?? 'Unknown'
  const duration    = session.duration    ?? session.expectedDuration ?? '—'
  const sessionType = session.sessionType ?? session.type ?? 'audio'
  const category    = session.category    ?? session.domain ?? 'General'
  const domainStyle = getDomainStyle(category)
  const earnings    = session.earnings    != null ? parseFloat(session.earnings).toFixed(2) : null
  const rating      = session.rating      ?? session.clientRating ?? null
  const notes       = session.notes       ?? null
  const summary     = session.summary     ?? null
  const providerOrg = session.providerOrg ?? session.organization ?? session.clientOrg ?? null
  const scheduledAt = session.scheduledAt ?? session.startedAt ?? null
  const endedAt     = session.endedAt     ?? session.completedAt ?? null

  const detailRows = [
    { label: 'Languages',     value: `${fromLang} → ${toLang}` },
    { label: 'Type',          value: sessionType.charAt(0).toUpperCase() + sessionType.slice(1) },
    { label: 'Duration',      value: duration },
    { label: 'Category',      value: category, style: domainStyle },
    ...(scheduledAt ? [{ label: 'Scheduled', value: fmtDateTime(scheduledAt) }] : []),
    ...(endedAt     ? [{ label: 'Ended',     value: fmtDateTime(endedAt) }] : []),
    ...(earnings != null ? [{ label: 'Earnings', value: `$${earnings}`, bold: true }] : []),
    ...(session.channelName ? [{ label: 'Session ID', value: session.channelName, mono: true }] : []),
  ]

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="bg-[#1a1635] px-5 py-4 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Session details</p>
              <p className="text-[16px] font-semibold text-white mt-0.5">{fromLang} → {toLang}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Status */}
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />}
              {badge.label}
            </span>

            {/* Client */}
            <div className="lb-card !bg-lb-surface">
              <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-2">Client</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[13px] font-semibold text-[#534AB7] shrink-0">
                  {session.avatar ?? getInitial(clientName)}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-lb-ink">{clientName}</p>
                  {providerOrg && <p className="text-[11px] text-lb-muted">{providerOrg}</p>}
                  {rating != null && (
                    <p className="text-[11px] text-[#BA7517] mt-0.5">
                      {'★'.repeat(Math.min(5, Math.round(rating)))}
                      {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.round(rating))))}
                      <span className="text-lb-subtle ml-1">({rating})</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="lb-card !bg-lb-surface">
              <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-3">Details</p>
              <div className="space-y-2.5">
                {detailRows.map(({ label, value, style, bold, mono }) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-lb-muted shrink-0">{label}</span>
                    {style ? (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded border"
                        style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                      >
                        {value}
                      </span>
                    ) : (
                      <span className={`text-[12px] text-right ${bold ? 'font-semibold text-[#26215C]' : mono ? 'font-mono text-lb-subtle text-[10px]' : 'text-lb-ink'}`}>
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div className="lb-card !bg-lb-surface">
                <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-2">Session summary</p>
                <p className="text-[12px] text-lb-ink leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Notes */}
            {notes && (
              <div className="lb-card !bg-[#FAEEDA] border border-[#F5D0A9]">
                <p className="text-[10px] text-[#854F0B] uppercase tracking-widest font-medium mb-1.5">Notes</p>
                <p className="text-[12px] text-[#854F0B] leading-relaxed">{notes}</p>
              </div>
            )}

            {/* Attachments placeholder — only shown if backend sends them */}
            {Array.isArray(session.attachments) && session.attachments.length > 0 && (
              <div className="lb-card !bg-lb-surface">
                <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-2">Attachments</p>
                <div className="space-y-2">
                  {session.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-lb-border hover:border-[#7F77DD] hover:bg-[#EEEDFE] transition-colors"
                    >
                      <svg className="w-4 h-4 text-[#534AB7] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                      </svg>
                      <span className="text-[12px] text-lb-ink truncate">{att.name ?? `Attachment ${i + 1}`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {isLive && (
            <div className="p-5 border-t border-lb-border shrink-0">
              <button
                onClick={() => { onJoin(session); onClose() }}
                className="w-full py-3 text-[13px] font-semibold rounded-xl bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-colors"
              >
                Rejoin session →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({ sessions }) {
  const completed  = sessions.filter((s) => TAB_STATUS_MAP['Completed'].includes(s.status ?? '')).length
  const upcoming   = sessions.filter((s) => TAB_STATUS_MAP['Upcoming'].includes(s.status ?? '')).length
  const live       = sessions.filter((s) => TAB_STATUS_MAP['In Progress'].includes(s.status ?? '')).length
  const totalEarned = sessions
    .filter((s) => TAB_STATUS_MAP['Completed'].includes(s.status ?? ''))
    .reduce((sum, s) => sum + (parseFloat(s.earnings) || 0), 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Completed',    value: completed,                                    color: 'text-[#3B6D11]',  bg: 'bg-[#EAF3DE]'  },
        { label: 'Upcoming',     value: upcoming,                                     color: 'text-[#534AB7]',  bg: 'bg-[#EEEDFE]'  },
        { label: 'Live now',     value: live,                                         color: 'text-[#0F6E56]',  bg: 'bg-[#E1F5EE]',  pulse: live > 0 },
        { label: 'Total earned', value: `$${totalEarned.toFixed(2)}`,                 color: 'text-[#26215C]',  bg: 'bg-lb-surface'  },
      ].map(({ label, value, color, bg, pulse }) => (
        <div key={label} className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl ${bg}`}>
          <div className="flex items-center gap-1.5">
            <p className={`text-[22px] font-semibold leading-none ${color}`}>{value}</p>
            {pulse && <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />}
          </div>
          <p className="text-[10px] text-lb-muted mt-1 uppercase tracking-widest font-medium">{label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptySessions({ tab }) {
  const msgs = {
    'Upcoming':    { title: 'No upcoming sessions',     sub: 'Accepted bookings will appear here' },
    'In Progress': { title: 'No active sessions',       sub: 'Live sessions will appear here in real-time' },
    'Completed':   { title: 'No completed sessions',    sub: 'Sessions you finish will be recorded here' },
    'Cancelled':   { title: 'No cancelled sessions',    sub: 'Cancelled sessions will appear here' },
  }
  const { title, sub } = msgs[tab] || { title: 'No sessions found', sub: 'Try a different tab or search term' }
  return (
    <div className="lb-card py-12 text-center">
      <div className="w-10 h-10 rounded-full bg-lb-surface flex items-center justify-center mx-auto mb-3">
        <svg className="w-5 h-5 text-lb-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <p className="text-[13px] font-medium text-lb-muted">{title}</p>
      <p className="text-[11px] text-lb-subtle mt-1">{sub}</p>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-lb-border rounded w-28" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="lb-card h-16" />)}
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => <div key={i} className="h-9 bg-lb-border rounded-xl flex-1" />)}
      </div>
      {[...Array(4)].map((_, i) => <div key={i} className="lb-card h-24" />)}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MySessions() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [sessions,     setSessions]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState('Upcoming')
  const [search,       setSearch]       = useState('')
  const [sortBy,       setSortBy]       = useState('date_desc')
  const [modalSession, setModalSession] = useState(null)

  // ── Fetch sessions ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    fetch('/api/interpreter/sessions')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data.sessions) ? data.sessions : Array.isArray(data) ? data : []
        setSessions(list)
        // Auto-switch to In Progress if there are live sessions
        const hasLive = list.some((s) => TAB_STATUS_MAP['In Progress'].includes(s.status ?? ''))
        if (hasLive) setActiveTab('In Progress')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user?.id])

  // ── Socket: live session updates ───────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onSessionUpdate = (data) => {
      setSessions((prev) => {
        const exists = prev.some((s) => s.id === data.id || s.sessionId === data.sessionId)
        if (exists) return prev.map((s) => (s.id === data.id || s.sessionId === data.sessionId) ? { ...s, ...data } : s)
        return [data, ...prev]
      })
    }

    const onSessionStarted = (data) => {
      setSessions((prev) =>
        prev.map((s) => s.id === data.sessionId ? { ...s, status: 'active' } : s)
      )
      setActiveTab('In Progress')
    }

    const onSessionEnded = (data) => {
      setSessions((prev) =>
        prev.map((s) => s.id === data.sessionId ? { ...s, status: 'completed', earnings: data.earnings, endedAt: data.endedAt } : s)
      )
    }

    socket.on('session-update',  onSessionUpdate)
    socket.on('session-started', onSessionStarted)
    socket.on('session-ended',   onSessionEnded)

    return () => {
      socket.off('session-update',  onSessionUpdate)
      socket.off('session-started', onSessionStarted)
      socket.off('session-ended',   onSessionEnded)
    }
  }, [])

  // ── Join live session ──────────────────────────────────────────────────────
  const handleJoin = useCallback((session) => {
    const channelName = session.channelName ?? session.roomId ?? session.channel
    if (!channelName) return
    const token    = session.agoraToken ?? ''
    const type     = session.sessionType ?? session.type ?? 'audio'
    const fromLang = session.fromLang    ?? 'en-us'
    const toLang   = session.toLang      ?? 'ps-east'
    const category = session.category    ?? 'General'
    const duration = parseInt(session.duration ?? 30)
    const name     = session.clientName  ?? session.client ?? 'Client'
    navigate(
      `/call/${channelName}?` +
      `token=${encodeURIComponent(token)}` +
      `&type=${type}` +
      `&fromLang=${encodeURIComponent(fromLang)}` +
      `&toLang=${encodeURIComponent(toLang)}` +
      `&category=${encodeURIComponent(category)}` +
      `&duration=${duration}` +
      `&interpreterName=${encodeURIComponent(name)}`
    )
  }, [navigate])

  // ── Derived ─────────────────────────────────────────────────────────────────
  const tabSessions = sessions.filter((s) => tabMatchesSession(activeTab, s))

  const filteredSessions = tabSessions.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (s.clientName ?? s.client ?? '').toLowerCase().includes(q) ||
      (s.fromLang   ?? '').toLowerCase().includes(q) ||
      (s.toLang     ?? '').toLowerCase().includes(q) ||
      (s.category   ?? '').toLowerCase().includes(q)
    )
  })

  const sortedSessions = sortSessions(filteredSessions, sortBy)

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = sessions.filter((s) => tabMatchesSession(tab, s)).length
    return acc
  }, {})

  if (loading) return <PageSkeleton />

  return (
    <>
      <div className="space-y-4 max-w-3xl">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-[20px] font-semibold text-lb-ink">My Sessions</h1>
          <p className="text-[13px] text-lb-muted mt-0.5">Your interpretation session history and upcoming bookings</p>
        </div>

        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <StatsBar sessions={sessions} />

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 p-1 bg-lb-surface rounded-xl overflow-x-auto">
          {TABS.map((tab) => {
            const count = tabCounts[tab]
            const isLiveTab = tab === 'In Progress'
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-lb-ink shadow-sm'
                    : 'text-lb-muted hover:text-lb-ink'
                }`}
              >
                {tab}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab
                      ? isLiveTab ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#EEEDFE] text-[#534AB7]'
                      : 'bg-lb-border text-lb-muted'
                  }`}>
                    {count}
                  </span>
                )}
                {isLiveTab && count > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        {/* ── Search + sort ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-lb-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search client, language, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[12px] text-lb-ink bg-white border border-lb-border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7F77DD] placeholder:text-lb-subtle"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-[12px] text-lb-ink bg-white border border-lb-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#7F77DD]"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* ── Session list ─────────────────────────────────────────────────── */}
        {sortedSessions.length === 0 ? (
          <EmptySessions tab={activeTab} />
        ) : (
          <div className="space-y-3">
            {sortedSessions.map((s, i) => (
              <SessionCard
                key={s.id ?? s.sessionId ?? s.roomId ?? i}
                session={s}
                onViewDetails={setModalSession}
                onJoin={handleJoin}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Session detail modal ─────────────────────────────────────────── */}
      {modalSession && (
        <SessionModal
          session={modalSession}
          onClose={() => setModalSession(null)}
          onJoin={handleJoin}
        />
      )}
    </>
  )
}