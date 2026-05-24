// IncomingRequests.jsx — live socket data, countdown timers, urgent border state

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocket } from '../../../../lib/socket'

function fmt(s) {
  const m = Math.floor(s / 60), ss = s % 60
  return `${m}:${ss < 10 ? '0' : ''}${ss}`
}

function RequestCard({ req, onAccept, onDecline }) {
  const [secs, setSecs] = useState(req.expiresIn ?? 300)

  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-expire: remove card when timer hits zero
  useEffect(() => {
    if (secs === 0) onDecline(req.id)
  }, [secs]) // eslint-disable-line react-hooks/exhaustive-deps

  const urgent = secs < 120
  const isVideo = req.sessionType === 'video' || req.type === 'video'
  const fromLang = req.fromLang ?? req.language ?? '—'
  const toLang   = req.toLang   ?? 'English'
  const category = req.category ?? req.purpose ?? 'General'
  const duration = req.duration ?? '—'
  const price    = req.price    ?? '—'
  const client   = req.client   ?? req.clientId ?? 'Client'
  const avatar   = req.avatar   ?? (client?.[0] ?? '?').toUpperCase()

  return (
    <div className={`grid gap-x-3 p-3 rounded-lg border items-start transition-colors ${
      urgent
        ? 'border-[#F7C1C1] bg-[rgba(252,235,235,0.04)]'
        : 'border-lb-border'
    }`} style={{ gridTemplateColumns: '34px 1fr auto' }}>

      {/* Avatar spans 2 rows */}
      <div className="row-span-2 w-[34px] h-[34px] rounded-full bg-[#EEEDFE] flex items-center justify-center text-[11px] font-medium text-[#534AB7] shrink-0">
        {avatar}
      </div>

      {/* Title row */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-lb-ink">{fromLang} → {toLang}</span>
          <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EAF3DE] text-[#3B6D11]">New</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted">
            {isVideo ? (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
            ) : (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            )}
            {isVideo ? 'Video' : 'Audio'} · {duration}
          </span>
          <span className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">{category}</span>
          <span className="text-[11px] text-lb-subtle">{client}</span>
        </div>
      </div>

      {/* Actions row */}
      <div className="row-span-2 flex flex-col items-end gap-1.5 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#26215C]">{price}</span>
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
            onClick={() => onAccept(req.id, req)}
            className="text-[11px] px-3 py-1 rounded bg-[#7F77DD] text-white font-medium hover:bg-[#534AB7] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IncomingRequests() {
  const [requests, setRequests] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // ── Incoming new request from a client ───────────────────────
    const onNewRequest = (data) => {
      setRequests(prev => {
        // Deduplicate by roomId
        if (prev.some(r => r.id === data.roomId)) return prev
        return [...prev, { ...data, id: data.roomId, expiresIn: 300 }]
      })
    }

    // ── Replay of pending requests on connect ────────────────────
    const onPendingRequests = (list) => {
      setRequests(
        list.map(r => ({ ...r, id: r.roomId, expiresIn: 300 }))
      )
    }

    // ── Client cancelled before interpreter accepted ─────────────
    const onRequestCancelled = ({ roomId }) => {
      setRequests(prev => prev.filter(r => r.id !== roomId))
    }

    // ── Interpreter accepted on another device/tab ───────────────
   const onCallAccepted = ({ roomId, channelName, agoraToken }) => {
  setRequests(prev => {
    // FIX: find the request BEFORE filtering so we can get sessionType
    const req = prev.find(r => r.id === roomId)
    const type = req?.type ?? req?.sessionType ?? 'audio'
    if (channelName) {
      const tokenString = agoraToken?.token ?? agoraToken ?? ''
      navigate(`/call/${channelName}?token=${tokenString}&type=${type}`)
    }
    return prev.filter(r => r.id !== roomId)
  })
}

    socket.on('new-request',        onNewRequest)
    socket.on('pending-requests',   onPendingRequests)
    socket.on('request-cancelled',  onRequestCancelled)
    socket.on('call-accepted',      onCallAccepted)

    return () => {
      socket.off('new-request',       onNewRequest)
      socket.off('pending-requests',  onPendingRequests)
      socket.off('request-cancelled', onRequestCancelled)
      socket.off('call-accepted',     onCallAccepted)
    }
  }, [navigate])

  const handleAccept = (id, req) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('accept-call', { roomId: id })
    // Optimistically remove from list — server will confirm via call-accepted
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const handleDecline = (id) => {
    // Interpreter declining just removes the card locally — no server event needed
    // (interpreter is not obligated; client will time out or another interpreter accepts)
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const newCount = requests.length

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