// Requests.jsx — full production page
// Real-time incoming requests + historical request management

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import { INTERPRETER_EARN_RATES } from '../../../config/constants'

// ── Constants ────────────────────────────────────────────────────────────────

const DOMAIN_COLORS = {
  'Medical':         { bg: '#E1F5EE', text: '#0F6E56', border: '#1D9E75' },
  'Legal':           { bg: '#FCEBEB', text: '#A32D2D', border: '#E24B4A' },
  'Insurance':       { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'Social Services': { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Government':      { bg: '#F3E8FF', text: '#7C3AED', border: '#A78BFA' },
  'Business':        { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Technical':       { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'Healthcare':      { bg: '#E1F5EE', text: '#0F6E56', border: '#1D9E75' },
  'General':         { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
}

const STATUS_TABS = ['All', 'Pending', 'Accepted', 'Declined', 'Expired']

const STATUS_BADGE = {
  pending:  { bg: 'bg-[#FAEEDA]',  text: 'text-[#854F0B]',  label: 'Pending'  },
  accepted: { bg: 'bg-[#E1F5EE]',  text: 'text-[#0F6E56]',  label: 'Accepted' },
  declined: { bg: 'bg-[#FCEBEB]',  text: 'text-[#A32D2D]',  label: 'Declined' },
  expired:  { bg: 'bg-lb-surface', text: 'text-lb-muted',    label: 'Expired'  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDomainStyle(cat) {
  return DOMAIN_COLORS[cat] || DOMAIN_COLORS['General']
}

function getInitial(name = '') {
  return (name.trim()[0] ?? '?').toUpperCase()
}

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function timeAgoStr(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function calcEarnings(sessionType, duration) {
  const rate  = INTERPRETER_EARN_RATES?.[sessionType] ?? INTERPRETER_EARN_RATES?.audio ?? 0.5
  const mins  = parseInt(duration) || 30
  return (rate * mins).toFixed(2)
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value, color = 'text-lb-ink', bg = 'bg-lb-surface' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl ${bg}`}>
      <p className={`text-[22px] font-semibold leading-none ${color}`}>{value ?? '—'}</p>
      <p className="text-[10px] text-lb-muted mt-1 uppercase tracking-widest font-medium">{label}</p>
    </div>
  )
}

function StarRating({ rating = 0 }) {
  const filled = Math.min(5, Math.max(0, Math.round(parseFloat(rating))))
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-2.5 h-2.5" fill={i < filled ? '#BA7517' : '#E5E7EB'} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  )
}

// ── Live request card (with countdown) ───────────────────────────────────────

function LiveRequestCard({ req, onAccept, onDecline }) {
  const [secs, setSecs] = useState(req.expiresIn ?? 300)

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (secs === 0) onDecline(req.id)
  }, [secs]) // eslint-disable-line react-hooks/exhaustive-deps

  const urgent       = secs < 60
  const isVideo      = req.sessionType === 'video' || req.type === 'video'
  const domainStyle  = getDomainStyle(req.category ?? req.domain ?? 'General')
  const clientName   = req.clientName ?? req.client ?? req.requesterName ?? 'Client'
  const avatar       = req.avatar ?? getInitial(clientName)
  const duration     = req.expectedDuration ?? req.duration ?? '30 min'
  const sessionType  = req.sessionType ?? req.call_type ?? 'audio'
  const est          = calcEarnings(sessionType, duration)
  const isReturning  = req.isReturning ?? req.returning ?? req.isReturningClient ?? false
  const providerOrg  = req.providerOrg ?? req.organization ?? req.clientOrg ?? null
  const clientRating = req.clientRating ?? req.rating ?? null
  const isRecording  = req.isRecording ?? false
  const isUrgent     = req.isUrgent ?? req.urgent ?? false
  const fromLang     = req.fromLang ?? req.language ?? req.sourceLanguage ?? 'Unknown'
  const toLang       = req.toLang   ?? req.targetLanguage ?? 'Unknown'

  return (
    <div className={`lb-card border-2 transition-all ${
      urgent ? 'border-[#E24B4A]/50' : 'border-[#7F77DD]/40'
    }`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[13px] font-semibold text-[#534AB7]">
            {avatar}
          </div>
          {isReturning && (
            <span className="absolute -bottom-1 -right-1 text-[8px] font-bold px-1 py-0.5 rounded-full bg-[#534AB7] text-white leading-none">↩</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-lb-ink">{fromLang} → {toLang}</p>
            {isUrgent && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">Emergency</span>
            )}
            {isReturning && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">↩ Returning</span>
            )}
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
              {req.category ?? req.domain ?? 'General'}
            </span>
            {isRecording && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E24B4A] animate-pulse" />
                Recording
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <p className="text-[11px] text-lb-muted">{clientName}</p>
            {providerOrg && <><span className="text-lb-subtle text-[10px]">·</span><p className="text-[11px] text-lb-muted">{providerOrg}</p></>}
            {clientRating != null && (
              <div className="flex items-center gap-1">
                <StarRating rating={clientRating} />
                <span className="text-[10px] text-lb-subtle">({clientRating})</span>
              </div>
            )}
          </div>
        </div>

        {/* Timer */}
        <span className={`shrink-0 text-[13px] font-semibold px-2.5 py-1.5 rounded-full font-mono tabular-nums flex items-center gap-1.5 ${
          urgent ? 'bg-[#FCEBEB] text-[#A32D2D]' : 'bg-[#EAF3DE] text-[#3B6D11]'
        }`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
          {fmt(secs)}
        </span>
      </div>

      {/* Earnings + CTA */}
      <div className="mt-3 pt-3 border-t border-lb-border/50 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-lb-muted">Estimated earnings</p>
          <p className="text-[18px] font-bold text-[#26215C] leading-tight">${est}</p>
          <p className="text-[10px] text-[#534AB7]">{duration}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDecline(req.id)}
            className="px-4 py-2 text-[12px] rounded-xl border border-lb-border text-lb-muted hover:bg-lb-surface hover:text-[#E24B4A] hover:border-[#E24B4A]/40 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => onAccept(req.id, req)}
            className="px-5 py-2 text-[12px] font-semibold rounded-xl bg-[#7F77DD] text-white hover:bg-[#534AB7] transition-colors shadow-sm"
          >
            Accept — ${est}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── History request card ──────────────────────────────────────────────────────

function HistoryCard({ req, onViewDetails }) {
  const status       = req.status ?? 'pending'
  const badge        = STATUS_BADGE[status] || STATUS_BADGE.pending
  const domainStyle  = getDomainStyle(req.category ?? req.domain ?? 'General')
  const clientName   = req.clientName ?? req.client ?? 'Client'
  const avatar       = req.avatar ?? getInitial(clientName)
  const fromLang     = req.fromLang ?? req.language ?? 'Unknown'
  const toLang       = req.toLang   ?? req.targetLanguage ?? 'Unknown'
  const duration     = req.expectedDuration ?? req.duration ?? '—'
  const sessionType  = req.sessionType ?? 'audio'
  const isVideo      = sessionType === 'video'
  const ago          = req.timeAgo ?? timeAgoStr(req.createdAt ?? req.timestamp)
  const est          = calcEarnings(sessionType, duration)

  return (
    <div className="lb-card">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[12px] font-semibold text-[#534AB7] shrink-0">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-medium text-lb-ink">{fromLang} → {toLang}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted">
              {isVideo ? 'Video' : 'Audio'} · {duration}
            </span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
              style={{ backgroundColor: domainStyle.bg, color: domainStyle.text, borderColor: domainStyle.border }}
            >
              {req.category ?? 'General'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[11px] text-lb-muted">{clientName} · {ago}</p>
            <div className="flex items-center gap-2">
              {status === 'accepted' && (
                <span className="text-[11px] font-medium text-[#0F6E56]">${est}</span>
              )}
              <button
                onClick={() => onViewDetails(req)}
                className="text-[11px] text-[#7F77DD] font-medium hover:text-[#534AB7] transition-colors"
              >
                Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Details drawer ────────────────────────────────────────────────────────────

function DetailsDrawer({ req, onClose }) {
  if (!req) return null

  const clientName  = req.clientName ?? req.client ?? 'Client'
  const fromLang    = req.fromLang   ?? req.language ?? 'Unknown'
  const toLang      = req.toLang     ?? req.targetLanguage ?? 'Unknown'
  const duration    = req.expectedDuration ?? req.duration ?? '—'
  const sessionType = req.sessionType ?? 'audio'
  const est         = calcEarnings(sessionType, duration)
  const status      = req.status ?? 'pending'
  const badge       = STATUS_BADGE[status] || STATUS_BADGE.pending
  const domainStyle = getDomainStyle(req.category ?? 'General')
  const ago         = req.timeAgo ?? timeAgoStr(req.createdAt ?? req.timestamp)
  const providerOrg = req.providerOrg ?? req.organization ?? req.clientOrg ?? null
  const notes       = req.notes ?? req.message ?? null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a1635] px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Request details</p>
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
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
            <span className="text-[11px] text-lb-subtle">{ago}</span>
          </div>

          {/* Client */}
          <div className="lb-card !bg-lb-surface">
            <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-2">Client</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[13px] font-semibold text-[#534AB7] shrink-0">
                {req.avatar ?? getInitial(clientName)}
              </div>
              <div>
                <p className="text-[13px] font-medium text-lb-ink">{clientName}</p>
                {providerOrg && <p className="text-[11px] text-lb-muted">{providerOrg}</p>}
                {req.clientRating != null && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating rating={req.clientRating} />
                    <span className="text-[10px] text-lb-subtle">({req.clientRating})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Session details */}
          <div className="lb-card !bg-lb-surface">
            <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-3">Session details</p>
            <div className="space-y-2.5">
              {[
                { label: 'Languages',     value: `${fromLang} → ${toLang}` },
                { label: 'Type',          value: (req.sessionType ?? 'Audio').charAt(0).toUpperCase() + (req.sessionType ?? 'audio').slice(1) },
                { label: 'Duration',      value: duration },
                { label: 'Category',      value: req.category ?? 'General', style: domainStyle },
                { label: 'Est. earnings', value: `$${est}`, bold: true },
                ...(req.scheduledAt ? [{ label: 'Scheduled', value: new Date(req.scheduledAt).toLocaleString() }] : []),
                ...(req.isRecording ? [{ label: 'Recording', value: 'This session will be recorded' }] : []),
              ].map(({ label, value, style, bold }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] text-lb-muted">{label}</span>
                  {style ? (
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded border"
                      style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                    >
                      {value}
                    </span>
                  ) : (
                    <span className={`text-[12px] ${bold ? 'font-semibold text-[#26215C]' : 'text-lb-ink'}`}>{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="lb-card !bg-[#FAEEDA] border border-[#F5D0A9]">
              <p className="text-[10px] text-[#854F0B] uppercase tracking-widest font-medium mb-1.5">Client note</p>
              <p className="text-[12px] text-[#854F0B] leading-relaxed italic">"{notes}"</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyRequests({ tab }) {
  const msgs = {
    All:      { title: 'No requests yet',         sub: 'New requests will appear here in real-time' },
    Pending:  { title: 'No pending requests',      sub: 'You\'re all caught up — new requests will appear here' },
    Accepted: { title: 'No accepted requests',     sub: 'Requests you accept will appear here' },
    Declined: { title: 'No declined requests',     sub: 'Requests you decline will appear here' },
    Expired:  { title: 'No expired requests',      sub: 'Requests that timed out will appear here' },
  }
  const { title, sub } = msgs[tab] || msgs.All
  return (
    <div className="lb-card py-12 text-center">
      <div className="w-10 h-10 rounded-full bg-lb-surface flex items-center justify-center mx-auto mb-3">
        <svg className="w-5 h-5 text-lb-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
      </div>
      <p className="text-[13px] font-medium text-lb-muted">{title}</p>
      <p className="text-[11px] text-lb-subtle mt-1">{sub}</p>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function RequestsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-lb-border rounded w-24" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="lb-card h-16" />)}
      </div>
      <div className="h-10 bg-lb-border rounded-xl" />
      {[...Array(3)].map((_, i) => <div key={i} className="lb-card h-28" />)}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Requests() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [loadingHistory, setLoadingHistory] = useState(true)
  const [liveRequests,   setLiveRequests]   = useState([])
  const [history,        setHistory]        = useState([])
  const [stats,          setStats]          = useState(null)  // { pending, accepted, declined, responseRate }
  const [activeTab,      setActiveTab]      = useState('All')
  const [filterLang,     setFilterLang]     = useState('')
  const [filterDate,     setFilterDate]     = useState('')
  const [drawerReq,      setDrawerReq]      = useState(null)

  const acceptedRef = useRef(null)

  // ── Fetch history + stats ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    fetch('/api/interpreter/requests/history')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.requests)) setHistory(data.requests)
        if (data.stats) setStats(data.stats)
        setLoadingHistory(false)
      })
      .catch(() => setLoadingHistory(false))
  }, [user?.id])

  // ── Socket: live requests ──────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onNewRequest = (data) => {
      setLiveRequests((prev) => {
        if (prev.some((r) => r.id === data.roomId)) return prev
        return [...prev, { ...data, id: data.roomId, expiresIn: 300, status: 'pending' }]
      })
    }

    const onPendingRequests = (list) => {
      setLiveRequests(list.map((r) => ({ ...r, id: r.roomId, expiresIn: 300, status: 'pending' })))
    }

    const onRequestCancelled = ({ roomId }) => {
      setLiveRequests((prev) => prev.filter((r) => r.id !== roomId))
    }

    const onCallAccepted = ({ roomId, channelName, agoraToken, sessionType }) => {
      setLiveRequests((prev) => prev.filter((r) => r.id !== roomId))
      if (channelName) {
        const tokenString = agoraToken?.token ?? agoraToken ?? ''
        const req         = acceptedRef.current
        acceptedRef.current = null
        const type        = sessionType ?? req?.sessionType ?? 'audio'
        const fromLang    = req?.fromLang ?? req?.language ?? 'en-us'
        const toLang      = req?.toLang   ?? req?.targetLanguage ?? 'ps-east'
        const category    = req?.category ?? 'General'
        const duration    = parseInt(req?.expectedDuration ?? req?.duration ?? 30)
        const clientName  = req?.clientName ?? req?.client ?? 'Client'
        navigate(
          `/call/${channelName}?` +
          `token=${encodeURIComponent(tokenString)}` +
          `&type=${type}` +
          `&fromLang=${encodeURIComponent(fromLang)}` +
          `&toLang=${encodeURIComponent(toLang)}` +
          `&category=${encodeURIComponent(category)}` +
          `&duration=${duration}` +
          `&interpreterName=${encodeURIComponent(clientName)}`
        )
      }
    }

    socket.on('new-request',       onNewRequest)
    socket.on('pending-requests',  onPendingRequests)
    socket.on('request-cancelled', onRequestCancelled)
    socket.on('call-accepted',     onCallAccepted)

    return () => {
      socket.off('new-request',       onNewRequest)
      socket.off('pending-requests',  onPendingRequests)
      socket.off('request-cancelled', onRequestCancelled)
      socket.off('call-accepted',     onCallAccepted)
    }
  }, [navigate])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAccept = useCallback((id, req) => {
    const socket = getSocket()
    if (!socket) return
    acceptedRef.current = req
    socket.emit('accept-call', { roomId: id })
    setLiveRequests((prev) => prev.filter((r) => r.id !== id))
    // Optimistically add to history as accepted
    setHistory((prev) => [{ ...req, status: 'accepted', createdAt: new Date().toISOString() }, ...prev])
  }, [])

  const handleDecline = useCallback((id) => {
    const socket = getSocket()
    if (socket) socket.emit('decline-call', { roomId: id })
    const req = liveRequests.find((r) => r.id === id)
    setLiveRequests((prev) => prev.filter((r) => r.id !== id))
    if (req) setHistory((prev) => [{ ...req, status: 'declined', createdAt: new Date().toISOString() }, ...prev])
  }, [liveRequests])

  // ── Derived ─────────────────────────────────────────────────────────────────

  const filteredHistory = history.filter((r) => {
    const matchTab  = activeTab === 'All' || (r.status ?? 'pending').toLowerCase() === activeTab.toLowerCase()
    const matchLang = !filterLang || (r.fromLang ?? '').toLowerCase().includes(filterLang.toLowerCase()) || (r.toLang ?? '').toLowerCase().includes(filterLang.toLowerCase())
    const matchDate = !filterDate || (r.createdAt ?? '').startsWith(filterDate)
    return matchTab && matchLang && matchDate
  })

  const derivedStats = {
    pending:      liveRequests.length,
    accepted:     stats?.accepted  ?? history.filter((r) => r.status === 'accepted').length,
    declined:     stats?.declined  ?? history.filter((r) => r.status === 'declined').length,
    responseRate: stats?.responseRate ?? null,
  }

  if (loadingHistory) return <RequestsSkeleton />

  return (
    <>
      <div className="space-y-4 max-w-3xl">

        {/* ── Page header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-lb-ink">Requests</h1>
            <p className="text-[13px] text-lb-muted mt-0.5">Manage incoming and historical interpretation requests</p>
          </div>
          {liveRequests.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] bg-[#E1F5EE] text-[#0F6E56] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
              {liveRequests.length} live
            </span>
          )}
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatPill label="Live now"      value={derivedStats.pending}      color="text-[#0F6E56]"  bg="bg-[#E1F5EE]" />
          <StatPill label="Accepted"      value={derivedStats.accepted}     color="text-[#26215C]"  bg="bg-[#EEEDFE]" />
          <StatPill label="Declined"      value={derivedStats.declined}     color="text-[#A32D2D]"  bg="bg-[#FCEBEB]" />
          <StatPill
            label="Response rate"
            value={derivedStats.responseRate != null ? `${derivedStats.responseRate}%` : '—'}
            color={derivedStats.responseRate >= 85 ? 'text-[#0F6E56]' : 'text-lb-ink'}
            bg="bg-lb-surface"
          />
        </div>

        {/* ── Live requests ──────────────────────────────────────────────────── */}
        {liveRequests.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
              <h3 className="text-[13px] font-semibold text-lb-ink">Live requests</h3>
              <span className="text-[11px] text-lb-muted">Respond before they expire</span>
            </div>
            <div className="space-y-3">
              {liveRequests.map((r) => (
                <LiveRequestCard
                  key={r.id}
                  req={r}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── History ────────────────────────────────────────────────────────── */}
        <div>
          <h3 className="text-[13px] font-semibold text-lb-ink mb-3">Request history</h3>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-lb-surface rounded-xl mb-3 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-fit text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-lb-ink shadow-sm'
                    : 'text-lb-muted hover:text-lb-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-lb-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Filter by language…"
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[12px] text-lb-ink bg-white border border-lb-border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7F77DD] placeholder:text-lb-subtle"
              />
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="text-[12px] text-lb-ink bg-white border border-lb-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#7F77DD]"
            />
            {(filterLang || filterDate) && (
              <button
                onClick={() => { setFilterLang(''); setFilterDate('') }}
                className="text-[11px] text-lb-muted hover:text-lb-ink px-2 py-2 rounded-xl hover:bg-lb-surface transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* List */}
          {filteredHistory.length === 0 ? (
            <EmptyRequests tab={activeTab} />
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((r, i) => (
                <HistoryCard
                  key={r.id ?? r.roomId ?? i}
                  req={r}
                  onViewDetails={setDrawerReq}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Details drawer ─────────────────────────────────────────────────── */}
      {drawerReq && (
        <DetailsDrawer req={drawerReq} onClose={() => setDrawerReq(null)} />
      )}
    </>
  )
}