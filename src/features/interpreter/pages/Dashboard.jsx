import { useEffect, useState } from 'react'
import { getSocket } from '../../../lib/socket'
import EarningsStats from '../components/dashboard/EarningsStats'
import IncomingRequests from '../components/dashboard/IncomingRequests'
import EarningsChart from '../components/dashboard/EarningsChart'
import TodaysSchedule from '../components/dashboard/TodaysSchedule'
import RecentSessions from '../components/dashboard/RecentSessions'
import RecentReviews from '../components/dashboard/RecentReviews'
import WalletSummary from '../components/dashboard/WalletSummary'

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
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)

  // ── Register with server on mount ────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // ── Register/deregister with socket when online state changes ─
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    if (isOnline) {
      socket.emit('register', { role: 'interpreter' })
    } else {
      socket.emit('go-offline')
    }
  }, [isOnline])

  // ── Also register on socket reconnect if already online ──────
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
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Welcome back, Maria</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Interpreter workspace</h1>
        </div>
        <button
          onClick={() => setIsOnline(o => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            isOnline ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-lb-surface text-lb-muted'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#1D9E75]' : 'bg-lb-muted'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      <EarningsStats stats={MOCK_STATS} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 space-y-3">
          <IncomingRequests />
          <EarningsChart />
          <RecentSessions />
        </div>
        <div className="space-y-3">
          <TodaysSchedule />
          <WalletSummary />
          <RecentReviews />
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 bg-lb-border rounded w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-lb-border rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 h-72 bg-lb-border rounded-xl" />
        <div className="h-72 bg-lb-border rounded-xl" />
      </div>
    </div>
  )
}