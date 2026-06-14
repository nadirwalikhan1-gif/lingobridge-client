// src/features/admin/components/dashboard/RequestQueue.jsx
// Wired to parent via onAssign/onSkip props. No local state mutation.
// Pending spinner per card. Waits for socket confirmation to disappear.

import { useState, useEffect, useRef } from 'react'

function fmt(s) {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${ss < 10 ? '0' : ''}${ss}`
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

function RequestCard({ req, onAssign, onSkip, index, isPending }) {
  const [secs, setSecs] = useState(req.expiresIn ?? 0)
  const [visible, setVisible] = useState(false)
  const [flash, setFlash] = useState(false)
  const prevUrgentRef = useRef((req.expiresIn ?? 0) < 120)

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80)
    return () => clearTimeout(t)
  }, [index])

  useEffect(() => {
    const isUrgent = secs < 120
    if (isUrgent && !prevUrgentRef.current) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 600)
      prevUrgentRef.current = true
      return () => clearTimeout(t)
    }
  }, [secs])

  const urgent = secs < 120
  const critical = secs < 60
  const isVideo = req.type === 'video'
  const noMatch = req.availableInterpreters === 0

  return (
    <div
      style={{
        transition: 'opacity 300ms ease, transform 300ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
      }}
      className={`p-3 rounded-lg border mb-2 last:mb-0 transition-colors duration-200 ${
        flash
          ? 'border-[#E24B4A] bg-[#FCEBEB]/40'
          : urgent || noMatch
          ? 'border-[#F7C1C1] bg-[#FCEBEB]/20'
          : 'border-lb-border hover:border-[#7F77DD]'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-lb-ink">
            {req.fromLang} ? {req.toLang}
          </span>
          {noMatch && (
            <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">
              No match
            </span>
          )}
        </div>
        <span className="text-[13px] font-semibold text-[#26215C] shrink-0">{req.price}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted">
          {isVideo ? <VideoIcon /> : <AudioIcon />}
          {isVideo ? 'Video' : 'Audio'} · {req.duration}
        </span>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">
          {req.category}
        </span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 font-mono tabular-nums transition-colors duration-300 ${
          critical
            ? 'bg-[#FCEBEB] text-[#A32D2D] animate-pulse'
            : urgent
            ? 'bg-[#FCEBEB] text-[#A32D2D]'
            : 'bg-[#EAF3DE] text-[#3B6D11]'
        }`}>
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
          </svg>
          {fmt(secs)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-lb-muted truncate">
          {req.client} · {req.timeAgo} · {req.note}
        </p>
        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={() => onSkip?.(req.id)}
            disabled={isPending}
            className="text-[10.5px] px-3 py-1 rounded border border-lb-border bg-transparent text-lb-muted hover:bg-lb-surface transition-colors font-medium disabled:opacity-50"
          >
            Skip
          </button>
          <button
            onClick={() => onAssign?.(req.id)}
            disabled={isPending}
            className={`text-[10.5px] px-3 py-1 rounded text-white font-semibold transition-colors disabled:opacity-50 ${
              noMatch
                ? 'bg-[#A32D2D] hover:bg-[#791F1F]'
                : 'bg-[#7F77DD] hover:bg-[#534AB7]'
            }`}
          >
            {isPending ? '…' : noMatch ? 'Force assign' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

// FIX: prop was `ext: requests` — renamed to `requests` to match what parent passes
export default function RequestQueue({ requests = [], onAssign, onSkip }) {
  const [pendingIds, setPendingIds] = useState(new Set())

  const handleAssign = (id) => {
    setPendingIds(prev => new Set(prev).add(id))
    onAssign?.(id)
  }

  const handleSkip = (id) => {
    setPendingIds(prev => new Set(prev).add(id))
    onSkip?.(id)
  }

  return (
    <div className="lb-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-lb-border">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-semibold text-lb-ink">Incoming Requests</h3>
            {requests.length > 0 && (
              <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#7F77DD] text-white text-[10px] font-semibold">
                {requests.length}
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-lb-muted mt-0.5">
            Assign to available interpreters before timer expires
          </p>
        </div>
        <button className="text-[11.5px] font-medium text-[#7F77DD]">Dispatch view</button>
      </div>

      {requests.length === 0 ? (
        <p className="text-[12px] text-lb-muted text-center py-6">No requests in queue</p>
      ) : (
        <div className="px-4 py-3">
          {requests.map((r, i) => (
            <RequestCard
              key={r.id}
              req={r}
              onAssign={handleAssign}
              onSkip={handleSkip}
              index={i}
              isPending={pendingIds.has(r.id)}  // FIX: pass per-card pending state
            />
          ))}
        </div>
      )}
    </div>
  )
}
