import { useEffect, useState } from 'react'
import { getSocket } from '../../../lib/socket'
import EarningsStats from '../components/dashboard/EarningsStats'
import IncomingRequests from '../components/dashboard/IncomingRequests'
import EarningsChart from '../components/dashboard/EarningsChart'
import TodaysSchedule from '../components/dashboard/TodaysSchedule'
import RecentSessions from '../components/dashboard/RecentSessions'
import RecentReviews from '../components/dashboard/RecentReviews'
import WalletSummary from '../components/dashboard/WalletSummary'
import RatingCard from '../components/dashboard/RatingCard'

const MOCK_STATS = {
  todayEarnings: '$124.50',
  todayEarningsTrend: '+12.5%',
  monthEarnings: '$1,245',
  monthGrowth: '+18.6%',
  sessionsToday: '6',
  sessionsTrend: '+2',
  hoursToday: '3h 20m',
  hoursTrend: '+45m',
}

export default function InterpreterDashboard() {
  const [isLoading, setIsLoading]                     = useState(true)
  const [isOnline, setIsOnline]                       = useState(false)
  const [hasIncomingRequests, setHasIncomingRequests] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onNew      = () => setHasIncomingRequests(true)
    const onCancelled = () => setHasIncomingRequests(false)
    socket.on('new-request',       onNew)
    socket.on('request-cancelled', onCancelled)
    socket.on('call-accepted',     onCancelled)
    return () => {
      socket.off('new-request',       onNew)
      socket.off('request-cancelled', onCancelled)
      socket.off('call-accepted',     onCancelled)
    }
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    if (isOnline) {
      socket.emit('register', { role: 'interpreter' })
    } else {
      socket.emit('go-offline')
    }
  }, [isOnline])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onReconnect = () => {
      if (isOnline) socket.emit('register', { role: 'interpreter' })
    }
    socket.on('connect', onReconnect)
    return () => socket.off('connect', onReconnect)
  }, [isOnline])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-4 relative">

      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Welcome back, Maria</p>
          <h1 className="text-lg font-semibold text-lb-ink mt-0.5">Interpreter workspace</h1>
        </div>
        <button
          onClick={() => setIsOnline(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            isOnline ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-lb-surface text-lb-muted border border-lb-border'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#1D9E75] animate-pulse' : 'bg-lb-muted'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* ── INCOMING REQUEST HIGHLIGHT ── */}
      <div className={`transition-all duration-500 ${
        hasIncomingRequests
          ? 'ring-2 ring-[#7F77DD] ring-offset-2 ring-offset-lb-canvas rounded-2xl shadow-[0_0_40px_rgba(127,119,221,0.25)]'
          : ''
      }`}>
        {hasIncomingRequests && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#534AB7] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#7F77DD] animate-ping inline-block" />
              Incoming call — respond now
            </span>
          </div>
        )}
        <IncomingRequests onRequestsChange={setHasIncomingRequests} />
      </div>

      {/* ── REST OF DASHBOARD ── */}
      <div className={`space-y-4 transition-opacity duration-500 ${hasIncomingRequests ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>

        <EarningsStats stats={MOCK_STATS} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <EarningsChart />
            <RecentSessions />
          </div>
          <div className="space-y-4">
            <TodaysSchedule />
            <RatingCard />
            <WalletSummary />
            <RecentReviews />
          </div>
        </div>

      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 bg-lb-border rounded w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-lb-border rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 h-72 bg-lb-border rounded-xl" />
        <div className="h-72 bg-lb-border rounded-xl" />
      </div>
    </div>
  )
}