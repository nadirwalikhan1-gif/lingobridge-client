// src/features/admin/context/AdminDataContext.jsx
// Real-time admin state using the existing Socket.IO singleton (getSocket).
// Emits data requests on mount. Listens for responses via useSocket.

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getSocket } from "../../../lib/socket";
import { useSocket } from "../../../hooks/useSocket";

const AdminDataContext = createContext(null)

export function useAdminData() {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error('useAdminData must be inside AdminDataProvider')
  return ctx
}

export function AdminDataProvider({ children }) {
  const [platformStats, setPlatformStats] = useState(null)
  const [liveSessions, setLiveSessions] = useState([])
  const [requestQueue, setRequestQueue] = useState([])
  const [interpreterPresence, setInterpreterPresence] = useState([])
  const [activeDisputes, setActiveDisputes] = useState([])
  const [payoutQueue, setPayoutQueue] = useState([])
  const [alerts, setAlerts] = useState([])
  const [systemHealth, setSystemHealth] = useState([])
  const [snapshot, setSnapshot] = useState(null)
  const [isSocketReady, setIsSocketReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Emit data requests once socket is connected
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onConnect = () => {
      console.log('🔌 Admin socket connected')
      socket.emit('get-platform-stats')
      socket.emit('get-live-sessions')
      socket.emit('get-request-queue')
      socket.emit('get-interpreter-presence')
      socket.emit('get-active-disputes')
      socket.emit('get-payout-queue')
      socket.emit('get-alerts')
      socket.emit('get-system-health')
      socket.emit('get-snapshot')
      setIsSocketReady(true)
      setHasError(false)
    }

    const onDisconnect = () => {
      setIsSocketReady(false)
    }

    if (socket.connected) {
      onConnect()
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    // 10s timeout: if no data arrives, show error state
    const timeout = setTimeout(() => {
      if (!isSocketReady) setHasError(true)
    }, 10000)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      clearTimeout(timeout)
    }
  }, [])

  // Response listeners
  useSocket('platform-stats', setPlatformStats)
  useSocket('live-sessions', setLiveSessions)
  useSocket('request-queue', setRequestQueue)
  useSocket('interpreter-presence', setInterpreterPresence)
  useSocket('active-disputes', setActiveDisputes)
  useSocket('payout-queue', setPayoutQueue)
  useSocket('operational-alerts', setAlerts)
  useSocket('system-health', setSystemHealth)
  useSocket('snapshot', setSnapshot)

  // Push events that mutate state
  useSocket('new-request', (req) => {
    setRequestQueue(prev => [req, ...prev])
  })

  useSocket('call-accepted', ({ requestId, session }) => {
    setRequestQueue(prev => prev.filter(r => r.id !== requestId))
    if (session) setLiveSessions(prev => [session, ...prev])
  })

  useSocket('request-cancelled', ({ requestId }) => {
    setRequestQueue(prev => prev.filter(r => r.id !== requestId))
  })

  useSocket('session-ended', ({ id }) => {
    setLiveSessions(prev => prev.filter(s => s.id !== id))
    setPlatformStats(prev => prev ? { ...prev, activeSessions: Math.max(0, (prev.activeSessions || 0) - 1) } : prev)
  })

  useSocket('new-dispute', (dispute) => {
    setActiveDisputes(prev => [dispute, ...prev])
  })

  useSocket('payout-approved', ({ id }) => {
    setPayoutQueue(prev => prev.filter(p => p.id !== id))
  })

  useSocket('assignment-confirmed', ({ requestId }) => {
    setRequestQueue(prev => prev.filter(r => r.id !== requestId))
  })

  const refresh = useCallback(() => {
    const socket = getSocket()
    if (!socket) return
    setHasError(false)
    socket.emit('get-platform-stats')
    socket.emit('get-live-sessions')
    socket.emit('get-request-queue')
    socket.emit('get-interpreter-presence')
    socket.emit('get-active-disputes')
    socket.emit('get-payout-queue')
    socket.emit('get-alerts')
    socket.emit('get-system-health')
    socket.emit('get-snapshot')
  }, [])

  const value = {
    platformStats,
    liveSessions,
    requestQueue,
    interpreterPresence,
    activeDisputes,
    payoutQueue,
    alerts,
    systemHealth,
    snapshot,
    isSocketReady,
    hasError,
    refresh,
  }

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}