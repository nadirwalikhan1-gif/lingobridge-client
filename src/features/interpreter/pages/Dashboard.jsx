import { useEffect, useState } from 'react'
import EarningsStats from '../components/dashboard/EarningsStats'
import IncomingRequests from '../components/dashboard/IncomingRequests'
import EarningsChart from '../components/dashboard/EarningsChart'
import TodaysSchedule from '../components/dashboard/TodaysSchedule'
import RecentSessions from '../components/dashboard/RecentSessions'
import AvailabilitySchedule from '../components/dashboard/AvailabilitySchedule'
import RecentReviews from '../components/dashboard/RecentReviews'

const MOCK_STATS = {
  todayEarnings: '$124.50',
  todayEarningsTrend: '+12.5%',
  rating: '4.8',
  ratingCount: 128,
  sessionsToday: '6',
  sessionsTrend: '+2',
  hoursToday: '3h 20m',
  hoursTrend: '+45m',
  monthEarnings: '$1,245.75',
  monthGrowth: '+18.6%',
}

const MOCK_SPARKLINE = [30, 45, 35, 55, 48, 62, 58, 75, 68, 82]

export default function InterpreterDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-4">
      {/* Header — matches client dashboard header scale */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Welcome back</p>
          <h1 className="text-lg font-bold text-slate-800 mt-0.5">Interpreter Workspace</h1>
        </div>
        <button
          onClick={() => setIsOnline(o => !o)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </span>
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Stats Row */}
      <EarningsStats stats={MOCK_STATS} sparkline={MOCK_SPARKLINE} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-4">
          <IncomingRequests />
          <EarningsChart />
          <RecentSessions />
        </div>
        {/* Right Column */}
        <div className="space-y-4">
          <TodaysSchedule />
          <AvailabilitySchedule />
          <RecentReviews />
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded-lg w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 h-80 bg-slate-200 rounded-xl" />
        <div className="h-80 bg-slate-200 rounded-xl" />
      </div>
    </div>
  )
}