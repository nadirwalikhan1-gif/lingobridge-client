// LiveSessions.jsx — Admin real-time session monitor
// Motion: staggered slide-in on mount, pulse dots on live/escalated, ticking elapsed timers

import { useState, useEffect } from 'react'

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
  const initialSecs = typeof session.startedSecsAgo === 'number' ? session.startedSecsAgo : 0
  const [elapsed, setElapsed] = useState(initialSecs)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

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
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <div className={`w-[26px] h-[26px] rounded-full ${cfg.avatarBg} flex items-center justify-center text-[10px] font-semibold ${cfg.avatarText} shrink-0`}>
        {session.interpreterInitials}
      </div>
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
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.pill}`}>
        {cfg.pillLabel}
      </span>
      <span className={`text-[12px] font-semibold shrink-0 font-mono tabular-nums ${cfg.timerColor}`}>
        {fmt(elapsed)}
      </span>
    </div>
  )
}

export default function LiveSessions({ sessions = [] }) {
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
