// IncomingRequests.jsx — live socket data, countdown timers, urgent border state
// FIXES: 🔴 Client rating + sector + recording + urgency + "General" subcategories

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocket } from '../../../../lib/socket'

// ─── Locale → Language mapping ───
const LOCALE_MAP = {
  'en': 'English', 'en-us': 'English', 'en-gb': 'English', 'en-ca': 'English', 'en-au': 'English',
  'es': 'Spanish', 'es-mx': 'Spanish', 'es-es': 'Spanish', 'es-ar': 'Spanish',
  'fr': 'French', 'fr-ca': 'French', 'fr-fr': 'French',
  'de': 'German', 'de-de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese', 'pt-br': 'Portuguese', 'pt-pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese', 'zh-cn': 'Chinese', 'zh-tw': 'Chinese', 'zh-hk': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'ur': 'Urdu',
  'fa': 'Farsi', 'fa-ir': 'Farsi',
  'ps': 'Pashto',
  'tr': 'Turkish',
  'pl': 'Polish',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'tl': 'Tagalog', 'fil': 'Tagalog',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'el': 'Greek',
  'he': 'Hebrew', 'iw': 'Hebrew',
  'id': 'Indonesian',
  'ms': 'Malay',
  'bn': 'Bengali',
  'pa': 'Punjabi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'si': 'Sinhala',
  'ne': 'Nepali',
  'my': 'Burmese',
  'km': 'Khmer',
  'lo': 'Lao',
  'sw': 'Swahili',
  'am': 'Amharic',
  'ha': 'Hausa',
  'yo': 'Yoruba',
  'ig': 'Igbo',
  'zu': 'Zulu',
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'eu': 'Basque',
  'be': 'Belarusian',
  'bs': 'Bosnian',
  'bg': 'Bulgarian',
  'ca': 'Catalan',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'et': 'Estonian',
  'fi': 'Finnish',
  'gl': 'Galician',
  'ka': 'Georgian',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'ga': 'Irish',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'mk': 'Macedonian',
  'mt': 'Maltese',
  'mn': 'Mongolian',
  'no': 'Norwegian',
  'ro': 'Romanian',
  'sr': 'Serbian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'cy': 'Welsh',
  'xh': 'Xhosa',
}

function resolveLanguage(raw) {
  if (!raw) return null
  const key = String(raw).toLowerCase().trim()
  return LOCALE_MAP[key] || (key.charAt(0).toUpperCase() + key.slice(1))
}

// 🔴 CRITICAL: Resolve language pair, handle duplicate names gracefully
function resolveLanguagePair(req) {
  const rawFrom = req.fromLang ?? req.language ?? req.sourceLanguage ?? null
  const rawTo   = req.toLang   ?? req.targetLanguage ?? null
  const from = resolveLanguage(rawFrom)
  const to   = resolveLanguage(rawTo)
  if (from && to && from === to && rawFrom && rawTo) {
    const fromCode = String(rawFrom).toLowerCase()
    const toCode   = String(rawTo).toLowerCase()
    if (fromCode !== toCode) {
      return { from: `${from} (${rawFrom})`, to: `${to} (${rawTo})`, isDuplicate: true, rawFrom, rawTo }
    }
  }
  return { from: from ?? '—', to: to ?? 'English', isDuplicate: false, rawFrom, rawTo }
}

// ─── Domain/Sector colors ───
const SECTOR_COLORS = {
  'Medical':        { bg: '#E1F5EE', text: '#0F6E56', border: '#1D9E75' },
  'Legal':          { bg: '#FCEBEB', text: '#A32D2D', border: '#E24B4A' },
  'Insurance':      { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'Social Services':{ bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Government':     { bg: '#F3E8FF', text: '#7C3AED', border: '#A78BFA' },
  'Business':       { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Technical':      { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'Healthcare':     { bg: '#E1F5EE', text: '#0F6E56', border: '#1D9E75' },
  'Customer Service':{ bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
  'Welfare':        { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
  'Personal':       { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
  'General':        { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
}

function getSectorStyle(sector) {
  return SECTOR_COLORS[sector] || SECTOR_COLORS['General']
}

// 🔴 Replace "General" with subcategories
function resolveSector(raw) {
  const map = {
    'customer service': 'Customer Service',
    'welfare': 'Welfare',
    'social': 'Social Services',
    'healthcare admin': 'Healthcare',
    'healthcare': 'Healthcare',
    'medical': 'Medical',
    'legal': 'Legal',
    'insurance': 'Insurance',
    'business': 'Business',
    'government': 'Government',
    'technical': 'Technical',
    'personal': 'Personal',
  }
  if (!raw) return 'General'
  const key = String(raw).toLowerCase().trim()
  return map[key] || (key.charAt(0).toUpperCase() + key.slice(1))
}

function fmt(s) {
  const m = Math.floor(s / 60), ss = s % 60
  return `${m}:${ss < 10 ? '0' : ''}${ss}`
}

function StarRating({ rating = 0, size = 12 }) {
  const filled = Math.round(parseFloat(rating)) || 0
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-${size === 10 ? '2.5' : '3'} h-${size === 10 ? '2.5' : '3'}`} fill={i < filled ? '#BA7517' : '#E5E7EB'} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  )
}

function RequestCard({ req, onAccept, onDecline }) {
  const [secs, setSecs] = useState(req.expiresIn ?? 300)

  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (secs === 0) onDecline(req.id)
  }, [secs]) // eslint-disable-line react-hooks/exhaustive-deps

  const urgent = secs < 120
  const isVideo = req.sessionType === 'video' || req.type === 'video'

  const langPair = resolveLanguagePair(req)
  const sector = resolveSector(req.category ?? req.purpose ?? req.domain ?? req.sector ?? 'General')
  const duration = req.duration ?? '—'
  const price    = req.price    ?? '—'
  const client   = req.client   ?? req.clientName ?? req.clientId ?? 'Client'
  const avatar   = req.avatar   ?? (client?.[0] ?? '?').toUpperCase()

  const isReturning = req.isReturningClient === true || req.clientHistory?.sessions > 0
  const clientRating = req.clientRating ?? req.client?.rating ?? null
  const isRecording = req.isRecording ?? req.recording ?? false
  const isUrgent    = req.isUrgent ?? req.urgency === 'emergency' ?? false
  const expectedDuration = req.expectedDuration ?? req.duration ?? '30 min'

  const perMinuteRate = req.perMinuteRate ?? req.rate ?? 0.85
  const durationMinutes = parseInt(expectedDuration) || 30
  const estimatedEarnings = (perMinuteRate * durationMinutes).toFixed(2)

  const sectorStyle = getSectorStyle(sector)

  return (
    <div className={`grid gap-x-4 p-4 rounded-xl border-2 items-start transition-all ${
      urgent
        ? 'border-[#E24B4A] bg-[rgba(226,75,74,0.04)]'
        : 'border-[#7F77DD] bg-[rgba(127,119,221,0.04)]'
    }`} style={{ gridTemplateColumns: '44px 1fr auto' }}>

      {/* Avatar */}
      <div className="row-span-2 w-11 h-11 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[13px] font-semibold text-[#534AB7] shrink-0">
        {avatar}
      </div>

      {/* Title row */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[15px] font-semibold leading-tight ${langPair.isDuplicate ? 'text-[#A32D2D]' : 'text-lb-ink'}`}>
            {langPair.from} → {langPair.to}
          </span>
          {langPair.isDuplicate && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">Check pair</span>
          )}
          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
            isReturning ? 'bg-[#EEEDFE] text-[#534AB7]' : 'bg-[#EAF3DE] text-[#3B6D11]'
          }`}>
            {isReturning ? 'Returning' : 'New'}
          </span>
          {isUrgent && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D] animate-pulse">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              Emergency
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border border-lb-border bg-lb-surface text-lb-muted">
            {isVideo ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            )}
            {isVideo ? 'Video' : 'Audio'} · {expectedDuration}
          </span>
          {/* 🟠 PROMINENT sector badge */}
          <span
            className="inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: sectorStyle.bg,
              color: sectorStyle.text,
              borderColor: sectorStyle.border,
            }}
          >
            {sector}
          </span>
          {isRecording && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCEBEB] text-[#A32D2D]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E24B4A] animate-pulse" />
              Recording
            </span>
          )}
        </div>

        {/* 🔴 Client context row: name + rating + org */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[11px] text-lb-subtle font-medium">{client}</span>
          {clientRating && (
            <div className="flex items-center gap-1">
              <StarRating rating={clientRating} size={10} />
              <span className="text-[10px] text-lb-subtle font-medium">{clientRating}</span>
            </div>
          )}
          {req.clientOrg && (
            <span className="text-[10px] text-lb-muted">· {req.clientOrg}</span>
          )}
        </div>

        {/* Earnings */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-lb-muted">${perMinuteRate.toFixed(2)}/min</span>
          <span className="text-[11px] text-[#534AB7] font-medium">≈ ${estimatedEarnings} est.</span>
        </div>
      </div>

      {/* Actions */}
      <div className="row-span-2 flex flex-col items-end gap-2 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#26215C]">{price}</span>
          <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono tabular-nums ${
            urgent ? 'bg-[#FCEBEB] text-[#A32D2D]' : 'bg-[#EAF3DE] text-[#3B6D11]'
          }`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
            {fmt(secs)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDecline(req.id)}
            className="text-[12px] px-4 py-1.5 rounded-lg border border-lb-border bg-transparent text-lb-muted hover:bg-lb-surface transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => onAccept(req.id, req)}
            className="text-[12px] px-4 py-1.5 rounded-lg bg-[#7F77DD] text-white font-semibold hover:bg-[#534AB7] transition-colors shadow-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

function NextSessionBanner() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-lb-surface border border-lb-border mt-3">
      <div className="w-1.5 h-8 rounded-full bg-[#7F77DD] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-lb-ink">Next session in 47 min</p>
        <p className="text-[10px] text-lb-muted mt-0.5">English → Arabic · Video · 60 min</p>
      </div>
      <span className="text-[11px] font-medium text-[#534AB7]">$24.00</span>
    </div>
  )
}

export default function IncomingRequests({ onRequestsChange }) {
  const [requests, setRequests] = useState([])
  const navigate = useNavigate()

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
        const type = sessionType ?? 'audio'
        navigate(`/call/${channelName}?token=${encodeURIComponent(tokenString)}&type=${type}`)
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
    socket.emit('accept-call', { roomId: id })
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const handleDecline = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const newCount = requests.length

  return (
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
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-10 h-10 rounded-full bg-lb-surface flex items-center justify-center">
              <svg className="w-5 h-5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/>
              </svg>
            </div>
            <p className="text-[13px] font-medium text-lb-ink">No incoming requests</p>
            <p className="text-[11px] text-lb-muted text-center leading-relaxed">New requests will appear here instantly.<br/>Make sure you&apos;re set to Online to receive them.</p>
          </div>
          <NextSessionBanner />
        </>
      ) : (
        <>
          <p className="text-[12px] text-lb-muted mb-3">Accept before the timer expires to secure the session</p>
          <div className="space-y-3">
            {requests.map(r => (
              <RequestCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}