// IncomingRequests.jsx — 10/10: New vs Returning client badge + provider org shown on modal

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocket } from '../../../../lib/socket'
import { INTERPRETER_EARN_RATES } from '../../../../config/constants'

const overlayStyles = `
  @keyframes lb-fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes lb-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .animate-fade-in { animation: lb-fade-in 200ms ease-out forwards; }
  .animate-slide-up { animation: lb-slide-up 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
`

const FROM_LANGUAGES = {
  'en': 'English (US)', 'en-us': 'English (US)', 'en-usa': 'English (US)', 'en-american': 'English (US)',
  'en-ca': 'English (Canada)', 'en-canada': 'English (Canada)', 'en-can': 'English (Canada)',
  'en-gb': 'English (UK)', 'en-uk': 'English (UK)', 'en-british': 'English (UK)', 'en-great': 'English (UK)',
}

const TO_LANGUAGES = {
  'ps': 'Pashto Eastern', 'ps-et': 'Pashto Eastern', 'ps-east': 'Pashto Eastern', 'ps-eastern': 'Pashto Eastern',
  'ps-wt': 'Pashto Western', 'ps-west': 'Pashto Western', 'ps-western': 'Pashto Western',
  'pa': 'Punjabi Gurmukhi', 'pa-guru': 'Punjabi Gurmukhi', 'pa-gurmukhi': 'Punjabi Gurmukhi',
  'pa-shah': 'Punjabi Shahmukhi', 'pa-shahmukhi': 'Punjabi Shahmukhi', 'pa-arab': 'Punjabi Shahmukhi',
}

function resolveFrom(raw) {
  if (!raw) return null
  const key = String(raw).toLowerCase().trim().replace(/[^a-z-]/g, '')
  return FROM_LANGUAGES[key] || null
}

function resolveTo(raw) {
  if (!raw) return null
  const key = String(raw).toLowerCase().trim().replace(/[^a-z-]/g, '')
  return TO_LANGUAGES[key] || null
}

function formatLanguagePair(req) {
  const rawFrom = req.fromLang ?? req.language ?? req.sourceLanguage ?? req.source ?? req.langFrom ?? null
  const rawTo   = req.toLang   ?? req.targetLanguage ?? req.target ?? req.langTo ?? null
  const fromResolved = resolveFrom(rawFrom)
  const toResolved   = resolveTo(rawTo)
  if (fromResolved && toResolved) return { from: fromResolved, to: toResolved, warning: false }
  if (fromResolved && !toResolved) return { from: fromResolved, to: rawTo ? `${String(rawTo)} ⚠️` : 'Unknown ⚠️', warning: true }
  if (!fromResolved && toResolved) return { from: rawFrom ? `${String(rawFrom)} ⚠️` : 'Unknown ⚠️', to: toResolved, warning: true }
  return { from: rawFrom ? `${String(rawFrom)} ⚠️` : 'Unknown ⚠️', to: rawTo ? `${String(rawTo)} ⚠️` : 'Unknown ⚠️', warning: true }
}

const SECTOR_COLORS = {
  'Medical':         { bg: '#E1F5EE', text: '#0F6E56', border: '#1D9E75' },
  'Legal':           { bg: '#FCEBEB', text: '#A32D2D', border: '#E24B4A' },
  'Insurance':       { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'Social Services': { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Government':      { bg: '#F3E8FF', text: '#7C3AED', border: '#A78BFA' },
  'Business':        { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'General':         { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
}

function getSectorStyle(sector) { return SECTOR_COLORS[sector] || SECTOR_COLORS['General'] }

function resolveSector(raw) {
  const map = {
    'customer service': 'Customer Service', 'welfare': 'Welfare', 'social': 'Social Services',
    'social services': 'Social Services', 'healthcare admin': 'Healthcare', 'healthcare': 'Healthcare',
    'medical': 'Medical', 'legal': 'Legal', 'insurance': 'Insurance',
    'business': 'Business', 'government': 'Government', 'technical': 'Technical', 'personal': 'Personal',
  }
  if (!raw) return 'General'
  const key = String(raw).toLowerCase().trim()
  return map[key] || (key.charAt(0).toUpperCase() + key.slice(1))
}

function fmt(s) {
  const m = Math.floor(s / 60), ss = s % 60
  return `${m}:${ss < 10 ? '0' : ''}${ss}`
}

function RequestCard({ req, onAccept, onDecline }) {
  const [secs, setSecs] = useState(req.expiresIn ?? 60)

  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (secs === 0) onDecline(req.id)
  }, [secs]) // eslint-disable-line react-hooks/exhaustive-deps

  const urgent = secs < 120
  const isVideo = req.sessionType === 'video' || req.type === 'video'
  const pair = formatLanguagePair(req)
  const sector = resolveSector(req.category ?? req.purpose ?? req.domain ?? req.sector)
  const clientName = req.clientName ?? req.client ?? req.userName ?? req.fromUser ?? req.requesterName ?? req.requester ?? req.name ?? 'Client'
  const avatar = req.avatar ?? (clientName?.[0] ?? 'C').toUpperCase()
  const expectedDuration = req.expectedDuration ?? req.duration ?? '30 min'
  const sessionType = req.sessionType ?? req.call_type ?? 'audio'
  const perMinuteRate = req.perMinuteRate ?? req.rate ?? INTERPRETER_EARN_RATES[sessionType]
  const durationMinutes = parseInt(expectedDuration) || 30
  const estimatedEarnings = (perMinuteRate * durationMinutes).toFixed(2)
  const sectorStyle = getSectorStyle(sector)

  const isReturning = req.isReturning ?? req.returning ?? false
  const providerOrg = req.providerOrg ?? req.organization ?? req.clientOrg ?? req.org ?? null

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      urgent
        ? 'border-[#E24B4A]/60 bg-[rgba(226,75,74,0.03)]'
        : 'border-[#7F77DD]/60 bg-[rgba(127,119,221,0.03)]'
    }`}>
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[15px] font-semibold text-[#534AB7]">
            {avatar}
          </div>
          {isReturning && (
            <span className="absolute -bottom-1 -right-1 text-[8px] font-bold px-1 py-0.5 rounded-full bg-[#534AB7] text-white leading-none">
              ↩
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[16px] font-semibold leading-tight ${pair.warning ? 'text-[#A32D2D]' : 'text-lb-ink'}`}>
              {pair.from} → {pair.to}
            </span>
            {pair.warning && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">Unsupported</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full border border-lb-border bg-lb-surface text-lb-muted">
              {isVideo ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              )}
              {isVideo ? 'Video' : 'Audio'} · {expectedDuration}
            </span>
            <span className="inline-flex text-[12px] font-semibold px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: sectorStyle.bg, color: sectorStyle.text, borderColor: sectorStyle.border }}>
              {sector}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[12px] text-lb-muted">${perMinuteRate.toFixed(2)}/min</span>
            {providerOrg && (
              <>
                <span className="text-[11px] text-lb-subtle">·</span>
                <span className="text-[11px] text-lb-muted font-medium">{providerOrg}</span>
              </>
            )}
            <span className="text-[11px] text-lb-subtle">·</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              isReturning ? 'bg-[#EEEDFE] text-[#534AB7]' : 'bg-[#EAF3DE] text-[#3B6D11]'
            }`}>
              {isReturning ? '↩ Returning client' : '✦ New client'}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <span className={`text-[14px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 font-mono tabular-nums ${
            urgent ? 'bg-[#FCEBEB] text-[#A32D2D]' : 'bg-[#EAF3DE] text-[#3B6D11]'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
            {fmt(secs)}
          </span>
        </div>
      </div>

      <div className="my-4 border-t border-lb-border/50" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-lb-muted">Estimated earnings</span>
          <span className="text-[20px] font-bold text-[#26215C]">${estimatedEarnings}</span>
          <span className="text-[11px] text-[#534AB7]">{perMinuteRate.toFixed(2)}/min · {expectedDuration}</span>
        </div>
        <div className="flex flex-col gap-2 w-60 shrink-0">
          <button
            onClick={() => onAccept(req.id, req)}
            className="w-full h-14 text-[16px] rounded-xl bg-[#7F77DD] text-white font-semibold hover:bg-[#534AB7] transition-colors shadow-lg active:scale-[0.98]"
          >
            Accept — ${estimatedEarnings}
          </button>
          <button
            onClick={() => onDecline(req.id)}
            className="w-full h-10 text-[14px] rounded-xl text-lb-muted hover:text-[#E24B4A] hover:bg-[#FCEBEB] transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}

// Renders only when real next-session data is available from the schedule
function NextSessionBanner({ nextSession }) {
  if (!nextSession) return null

  const fromLang     = nextSession.fromLang     ?? nextSession.from         ?? null
  const toLang       = nextSession.toLang       ?? nextSession.to           ?? null
  const sessionType  = nextSession.sessionType  ?? nextSession.type         ?? null
  const duration     = nextSession.duration     ?? nextSession.expectedDuration ?? null
  const minutesUntil = nextSession.minutesUntil ?? nextSession.startsIn     ?? null
  const earnings     = nextSession.earnings     ?? nextSession.estimatedEarnings ?? null

  // Need at minimum a time and language pair to show anything useful
  if (!minutesUntil || !fromLang || !toLang) return null

  const details = [fromLang, toLang].filter(Boolean).join(' → ')
  const meta    = [sessionType, duration].filter(Boolean).join(' · ')

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-lb-surface border border-lb-border mt-3">
      <div className="w-1.5 h-8 rounded-full bg-[#7F77DD] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-lb-ink">Next session in {minutesUntil} min</p>
        {(details || meta) && (
          <p className="text-[10px] text-lb-muted mt-0.5">
            {[details, meta].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      {earnings && (
        <span className="text-[11px] font-medium text-[#534AB7] shrink-0">{earnings}</span>
      )}
    </div>
  )
}

export default function IncomingRequests({ onRequestsChange, nextSession }) {
  const [requests, setRequests] = useState([])
  const navigate = useNavigate()
  const acceptedRequestRef = useRef(null)

  useEffect(() => {
    onRequestsChange?.(requests.length > 0)
  }, [requests.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onNewRequest = (data) => {
      setRequests(prev => {
        if (prev.some(r => r.id === data.roomId)) return prev
        return [...prev, { ...data, id: data.roomId, expiresIn: 300 }]
      })
    }

    const onPendingRequests = (list) => {
      setRequests(list.map(r => ({ ...r, id: r.roomId, expiresIn: 300 })))
    }

    const onRequestCancelled = ({ roomId }) => {
      setRequests(prev => prev.filter(r => r.id !== roomId))
    }

    const onCallAccepted = ({ roomId, channelName, agoraToken, sessionType }) => {
      setRequests(prev => prev.filter(r => r.id !== roomId))
      if (channelName) {
        const tokenString = agoraToken?.token ?? agoraToken ?? ''
        const req = acceptedRequestRef.current
        acceptedRequestRef.current = null
        const type = sessionType ?? req?.sessionType ?? req?.type ?? 'audio'
        const fromLang = req?.fromLang ?? req?.language ?? req?.sourceLanguage ?? 'en-us'
        const toLang = req?.toLang ?? req?.targetLanguage ?? 'ps-east'
        const category = req?.category ?? req?.purpose ?? req?.domain ?? 'General'
        const duration = req?.duration ?? req?.expectedDuration ?? '30 min'
        const durationNum = parseInt(duration) || 30
        const clientName = req?.clientName ?? req?.client ?? req?.requesterName ?? 'Client'
        navigate(
          `/call/${channelName}?` +
          `token=${encodeURIComponent(tokenString)}` +
          `&type=${type}` +
          `&fromLang=${encodeURIComponent(fromLang)}` +
          `&toLang=${encodeURIComponent(toLang)}` +
          `&category=${encodeURIComponent(category)}` +
          `&duration=${durationNum}` +
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

  const handleAccept = (id) => {
    const socket = getSocket()
    if (!socket) return
    const req = requests.find(r => r.id === id)
    acceptedRequestRef.current = req
    socket.emit('accept-call', { roomId: id })
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const handleDecline = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const newCount = requests.length

  return (
    <>
      <style>{overlayStyles}</style>
      <div className={`lb-card transition-all duration-300 ${newCount > 0 ? 'p-5' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-lb-ink transition-all ${newCount > 0 ? 'text-[16px]' : 'text-[14px]'}`}>
              Incoming requests
            </h3>
            {newCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#7F77DD] text-white text-[11px] font-bold animate-pulse">
                {newCount}
              </span>
            )}
          </div>
          {newCount === 0 && (
            <button className="text-[12px] text-[#7F77DD] font-medium">View all</button>
          )}
        </div>

        {newCount === 0 ? (
          <>
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-lb-surface/50 border border-lb-border/50">
              <span className="w-1.5 h-1.5 rounded-full bg-lb-border" />
              <p className="text-[11px] text-lb-muted">No incoming requests — you&apos;re set to Online</p>
            </div>
            <NextSessionBanner nextSession={nextSession} />
          </>
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up mx-auto">
              <div className="bg-[#7F77DD] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[16px] font-semibold text-white">Incoming Call</span>
                </div>
                <span className="text-[14px] text-white/80">{newCount} request{newCount > 1 ? 's' : ''}</span>
              </div>
              <div className="p-5 space-y-3 max-h-[80vh] overflow-y-auto w-full">
                {requests.map(r => (
                  <RequestCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
