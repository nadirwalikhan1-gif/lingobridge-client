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
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-lb-ink">{fromLang} → {toLang}</span>
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] uppercase tracking-wide">New</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border border-lb-border bg-lb-surface text-lb-muted">
            {isVideo ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            )}
            {isVideo ? 'Video' : 'Audio'} · {duration}
          </span>
          <span className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EEEDFE] text-[#534AB7]">{category}</span>
          <span className="text-[11px] text-lb-subtle">{client}</span>
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

export default function IncomingRequests({ onRequestsChange }) {
  const [requests, setRequests] = useState([])
  const navigate = useNavigate()

  // Notify parent whenever request count changes
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
        <p className="text-sm text-lb-muted text-center py-4">No incoming requests right now</p>
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