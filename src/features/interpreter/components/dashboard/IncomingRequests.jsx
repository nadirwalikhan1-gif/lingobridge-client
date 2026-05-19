// IncomingRequests.jsx — live countdown timers, urgent border state, pill system

import { useState, useEffect } from 'react'

const MOCK_REQUESTS = [
  {
    id: 1, fromLang: 'English', toLang: 'Spanish', sessionType: 'video',
    duration: '30 min', category: 'Medical', price: '$12.00',
    client: 'John Doe', timeAgo: '2 min ago', avatar: 'JD',
    expiresIn: 272, // seconds — starts urgent (under 120s = red)
  },
  {
    id: 2, fromLang: 'Urdu', toLang: 'English', sessionType: 'audio',
    duration: '15 min', category: 'Legal', price: '$6.00',
    client: 'Ali Khan', timeAgo: '5 min ago', avatar: 'AK',
    expiresIn: 438,
  },
]

function fmt(s) {
  const m = Math.floor(s / 60), ss = s % 60
  return `${m}:${ss < 10 ? '0' : ''}${ss}`
}

function RequestCard({ req, onAccept, onDecline }) {
  const [secs, setSecs] = useState(req.expiresIn)

  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const urgent = secs < 120
  const isVideo = req.sessionType === 'video'

  return (
    <div className={`grid gap-x-3 p-3 rounded-lg border items-start transition-colors ${
      urgent
        ? 'border-[#F7C1C1] bg-[rgba(252,235,235,0.04)]'
        : 'border-lb-border'
    }`} style={{ gridTemplateColumns: '34px 1fr auto' }}>

      {/* Avatar spans 2 rows */}
      <div className="row-span-2 w-[34px] h-[34px] rounded-full bg-[#EEEDFE] flex items-center justify-center text-[11px] font-medium text-[#534AB7] shrink-0">
        {req.avatar}
      </div>

      {/* Title row */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-lb-ink">{req.fromLang} → {req.toLang}</span>
          <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EAF3DE] text-[#3B6D11]">New</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted">
            {isVideo ? (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
            ) : (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            )}
            {isVideo ? 'Video' : 'Audio'} · {req.duration}
          </span>
          <span className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">{req.category}</span>
          <span className="text-[11px] text-lb-subtle">{req.client} · {req.timeAgo}</span>
        </div>
      </div>

      {/* Actions row */}
      <div className="row-span-2 flex flex-col items-end gap-1.5 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#26215C]">{req.price}</span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1 font-mono tabular-nums ${
            urgent ? 'bg-[#FCEBEB] text-[#A32D2D]' : 'bg-[#EAF3DE] text-[#3B6D11]'
          }`}>
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
            {fmt(secs)}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onDecline(req.id)}
            className="text-[11px] px-3 py-1 rounded border border-lb-border bg-transparent text-lb-muted hover:bg-lb-surface transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => onAccept(req.id)}
            className="text-[11px] px-3 py-1 rounded bg-[#7F77DD] text-white font-medium hover:bg-[#534AB7] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IncomingRequests({ requests: ext, onAccept, onDecline }) {
  const [local, setLocal] = useState(MOCK_REQUESTS)
  const requests = ext ?? local

  const handleAccept  = (id) => { if (onAccept)  { onAccept(id);  return } setLocal(p => p.filter(r => r.id !== id)) }
  const handleDecline = (id) => { if (onDecline) { onDecline(id); return } setLocal(p => p.filter(r => r.id !== id)) }
  const newCount = requests.filter(r => r.expiresIn !== undefined).length

  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-medium text-lb-ink">Incoming requests</h3>
            {newCount > 0 && (
              <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#7F77DD] text-white text-[10px] font-medium">
                {newCount}
              </span>
            )}
          </div>
          <p className="text-[11px] text-lb-muted mt-0.5">Accept before the timer expires to secure the session</p>
        </div>
        <button className="text-[12px] text-[#7F77DD] font-medium">View all</button>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-lb-muted text-center py-6">No incoming requests right now</p>
      ) : (
        <div className="space-y-2.5">
          {requests.map(r => (
            <RequestCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline} />
          ))}
        </div>
      )}
    </div>
  )
}
