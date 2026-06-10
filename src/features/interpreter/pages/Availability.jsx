import { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { getSocket } from '../../lib/socket'
import AvailabilitySchedule from '../components/dashboard/AvailabilitySchedule'

export default function Availability() {
  const { user }  = useAuth()
  const [isOnline,  setIsOnline]  = useState(false)
  const [schedule,  setSchedule]  = useState([])
  const [loading,   setLoading]   = useState(true)

  // ── Fetch real schedule from API ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/interpreter/schedule')
      .then(r => r.json())
      .then(({ schedule = [], isOnline: online = false }) => {
        setSchedule(schedule)
        setIsOnline(online)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // ── Persist online toggle via socket ───────────────────────────────────
  const handleToggleOnline = () => {
    const next = !isOnline
    setIsOnline(next)
    const socket = getSocket()
    if (socket) {
      socket.emit(next ? 'register' : 'go-offline', { role: 'interpreter' })
    }
    // Also persist to API
    fetch('/api/interpreter/schedule/online', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline: next }),
    }).catch(() => {})
  }

  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-lg font-medium text-lb-ink pb-1">Availability</h1>

      {/* Online toggle */}
      <div className="lb-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isOnline ? 'bg-[#E1F5EE]' : 'bg-lb-surface'}`}>
            <svg className={`w-4 h-4 ${isOnline ? 'text-[#0F6E56]' : 'text-lb-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-lb-ink">Online status</p>
            <p className="text-[11px] text-lb-muted">{isOnline ? 'You are visible to clients' : 'You are hidden from clients'}</p>
          </div>
        </div>
        <button
          onClick={handleToggleOnline}
          className={`relative w-10 h-6 rounded-full transition-colors ${isOnline ? 'bg-[#7F77DD]' : 'bg-lb-border'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isOnline ? 'left-[18px]' : 'left-0.5'}`} />
        </button>
      </div>

      {loading ? (
        <div className="lb-card h-32 animate-pulse" />
      ) : (
        <AvailabilitySchedule schedule={schedule} onEdit={() => {}} />
      )}

      <div className="lb-card text-center py-6">
        <p className="text-[13px] text-lb-muted">Full schedule editor coming soon</p>
      </div>
    </div>
  )
}