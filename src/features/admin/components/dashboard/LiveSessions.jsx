// LiveSessions.jsx — Admin real-time session monitor
// Motion: staggered slide-in on mount, pulse dots on live/escalated, ticking elapsed timers
// Fix #8: aligned to platform language pairs (Pashto/Punjabi) with South Asian names

import { useState, useEffect, useRef } from 'react'

const MOCK_SESSIONS = [
  {
    id: 1,
    interpreterInitials: 'KA',
    interpreterName: 'Khalid Ahmadzai',
    fromLang: 'English (Canada)',
    toLang: 'Pashto (Eastern)',
    category: 'Medical',
    type: 'video',
    client: 'Nasrin A.',
    note: 'Toronto General · Room 302',
    startedSecsAgo: 18 * 60 + 42,
    status: 'live',
  },
  {
    id: 2,
    interpreterInitials: 'RS',
    interpreterName: 'Rajinder Singh',
    fromLang: 'English (US)',
    toLang: 'Punjabi (Gurmukhi)',
    category: 'Legal',
    type: 'audio',
    client: 'Gurjeet K.',
    note: 'Immigration hearing #7821',
    startedSecsAgo: 34 * 60 + 9,
    status: 'live',
  },
  {
    id: 3,
    interpreterInitials: 'SB',
    interpreterName: 'Sadia Butt',
    fromLang: 'English (UK)',
    toLang: 'Punjabi (Shahmukhi)',
    category: 'Emergency',
    type: 'video',
    client: 'ICU Team',
    note: 'Patient unresponsive · Ward 4',
    startedSecsAgo: 2 * 60 + 14,
    status: 'escalated',
  },
  {
    id: 4,
    interpreterInitials: 'NW',
    interpreterName: 'Noorullah Wardak',
    fromLang: 'English (US)',
    toLang: 'Pashto (Western)',
    category: 'Immigration',
    type: 'audio',
    client: 'Tariq W.',
    note: '',
    startedSecsAgo: 7 * 60 + 55,
    status: 'hold',
  },
]

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function VideoIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    </svg>
  )
}

function AudioIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function SessionRow({ session, index }) {
  const [elapsed, setElapsed] = useState(session.startedSecsAgo)
  const [visible, setVisible] = useState(false)

  // Tick elapsed timer every second
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Staggered slide-in on mount — each row delays by 60ms × index
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60)
    return () => clearTimeout(t)
  }, [index])

  const isEscalated = session.status === 'escalated'

  const statusConfig = {
    live: {
      dot: 'bg-[#1D9E75] animate-pulse',
      pill: 'bg-[#E1F5EE] text-[#0F6E56]',
      pillLabel: 'Live',
      avatarBg: 'bg-[#EEEDFE]',
      avatarText: 'text-[#534AB7]',
      timerColor: 'text-lb-ink',
    },
    escalated: {
      dot: 'bg-[#E24B4A] animate-pulse',
      pill: 'bg-[#FCEBEB] text-[#A32D2D]',
      pillLabel: 'Escalated',
      avatarBg: 'bg-[#FCEBEB]',
      avatarText: 'text-[#A32D2D]',
      timerColor: 'text-[#A32D2D]',
    },
    hold: {
      dot: 'bg-[#7F77DD]',
      pill: 'bg-[#EEEDFE] text-[#534AB7]',
      pillLabel: 'On hold',
      avatarBg: 'bg-[#EEEDFE]',
      avatarText: 'text-[#534AB7]',
      timerColor: 'text-lb-ink',
    },
  }
  const cfg = statusConfig[session.status] || statusConfig.live

  return (
    <div
      style={{
        transition: 'opacity 280ms ease, transform 280ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-10px)',
      }}
      className={`flex items-center gap-2.5 py-2 border-b border-lb-border last:border-0 ${
        isEscalated ? 'bg-[#FCEBEB]/5 -mx-3 px-3 rounded' : ''
      }`}
    >
      {/* Status dot — pulses on live + escalated */}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />

      {/* Avatar */}
      <div className={`w-[26px] h-[26px] rounded-full ${cfg.avatarBg} flex items-center justify-center text-[10px] font-semibold ${cfg.avatarText} shrink-0`}>
        {session.interpreterInitials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-lb-ink">{session.interpreterName}</span>
          <span className="text-[11px] text-lb-muted">{session.fromLang} → {session.toLang}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted flex items-center gap-1">
            {session.type === 'video' ? <VideoIcon /> : <AudioIcon />}
            {session.category} · {session.type === 'video' ? 'Video' : 'Audio'}
          </span>
          <span className="text-[10px] text-lb-muted truncate">
            {session.client}{session.note ? ` · ${session.note}` : ''}
          </span>
        </div>
      </div>

      {/* Status pill */}
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.pill}`}>
        {cfg.pillLabel}
      </span>

      {/* Elapsed timer — ticking every second, mono */}
      <span className={`text-[12px] font-semibold shrink-0 font-mono tabular-nums ${cfg.timerColor}`}>
        {fmt(elapsed)}
      </span>
    </div>
  )
}

export default function LiveSessions({ sessions: ext }) {
  const [sessions, setSessions] = useState(ext ?? MOCK_SESSIONS)
  const prevIdsRef = useRef(new Set(sessions.map((s) => s.id)))

  // Detect newly pushed sessions and slide them in
  useEffect(() => {
    if (!ext) return
    const hasNew = ext.some((s) => !prevIdsRef.current.has(s.id))
    if (hasNew) {
      prevIdsRef.current = new Set(ext.map((s) => s.id))
      setSessions(ext)
    }
  }, [ext])

  const liveCount = sessions.filter((s) => s.status === 'live' || s.status === 'escalated').length

  return (
    <div className="lb-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-lb-border">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-semibold text-lb-ink">Live Sessions</h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse inline-block" />
              {liveCount} active
            </span>
          </div>
          <p className="text-[10.5px] text-lb-muted mt-0.5">Real-time session monitoring</p>
        </div>
        <button className="text-[11.5px] font-medium text-[#7F77DD]">View all</button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-[12px] text-lb-muted text-center py-6">No active sessions</p>
      ) : (
        <div className="px-4">
          {sessions.map((s, i) => (
            <SessionRow key={s.id} session={s} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}