import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import CommandCenter, { PerformanceTrendPanel } from '../components/dashboard/CommandCenter'
import IncomingRequests from '../components/dashboard/IncomingRequests'
import EarningsChart from '../components/dashboard/EarningsChart'
import TodaysSchedule from '../components/dashboard/TodaysSchedule'
import RecentSessions from '../components/dashboard/RecentSessions'
import RecentReviews from '../components/dashboard/RecentReviews'
import WalletSummary from '../components/dashboard/WalletSummary'
import RatingCard from '../components/dashboard/RatingCard'

const STATUS = {
  ONLINE:  'online',
  BREAK:   'break',
  OFFLINE: 'offline',
}

const STATUS_META = {
  [STATUS.ONLINE]:  { label: 'Online',  color: '#1D9E75', bg: '#E1F5EE', text: '#0F6E56', socket: 'register' },
  [STATUS.BREAK]:   { label: 'Break',   color: '#BA7517', bg: '#FAEEDA', text: '#854F0B', socket: 'go-on-break' },
  [STATUS.OFFLINE]: { label: 'Offline', color: '#9CA3AF', bg: '#F3F4F6', text: '#4B5563', socket: 'go-offline' },
}

// 🔴 FIX: Motivational greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// 🔴 FIX: Daily goal progress banner
function DailyGoalBanner({ sessionsToday = 12, earningsToday = 124.50 }) {
  const sessionGoal = 15
  const earningsGoal = 150
  const sessionPct = Math.min(100, Math.round((sessionsToday / sessionGoal) * 100))
  const earningsPct = Math.min(100, Math.round((earningsToday / earningsGoal) * 100))

  return (
    <div className="lb-card !py-3 !px-4">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <svg className="w-3.5 h-3.5 text-[#534AB7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span className="text-[11px] font-semibold text-lb-ink">Today's goals</span>
        </div>
        <div className="flex-1 flex items-center gap-6 flex-wrap">
          {/* Sessions goal */}
          <div className="flex items-center gap-2 min-w-[160px]">
            <span className="text-[11px] text-lb-muted whitespace-nowrap">Sessions {sessionsToday}/{sessionGoal}</span>
            <div className="flex-1 h-1.5 bg-lb-border rounded-full overflow-hidden min-w-[80px]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${sessionPct}%`, backgroundColor: sessionPct >= 100 ? '#1D9E75' : '#7F77DD' }}
              />
            </div>
            <span className="text-[10px] font-semibold text-[#534AB7]">{sessionPct}%</span>
          </div>
          {/* Earnings goal */}
          <div className="flex items-center gap-2 min-w-[160px]">
            <span className="text-[11px] text-lb-muted whitespace-nowrap">Earnings ${earningsToday}/${earningsGoal}</span>
            <div className="flex-1 h-1.5 bg-lb-border rounded-full overflow-hidden min-w-[80px]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${earningsPct}%`, backgroundColor: earningsPct >= 100 ? '#1D9E75' : '#BA7517' }}
              />
            </div>
            <span className="text-[10px] font-semibold text-[#854F0B]">{earningsPct}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InterpreterDashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading]           = useState(true)
  const [availability, setAvailability]     = useState(STATUS.ONLINE)
  const [hasIncomingRequests, setHasIncomingRequests] = useState(false)
  const [activeRequest, setActiveRequest]   = useState(null)
  const incomingRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onNew       = () => setHasIncomingRequests(true)
    const onCancelled = () => {
      setHasIncomingRequests(false)
      setActiveRequest(null)
    }
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
    const meta = STATUS_META[availability]
    if (meta.socket === 'register') {
      socket.emit('register', { role: 'interpreter' })
    } else {
      socket.emit(meta.socket)
    }
  }, [availability])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onReconnect = () => {
      const meta = STATUS_META[availability]
      if (meta.socket === 'register') socket.emit('register', { role: 'interpreter' })
    }
    socket.on('connect', onReconnect)
    return () => socket.off('connect', onReconnect)
  }, [availability])

  const handleWaitingClick = () => {
    if (incomingRef.current) {
      incomingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleRequestsChange = (hasRequests, requests) => {
    setHasIncomingRequests(hasRequests)
    if (hasRequests && requests?.length > 0) {
      setActiveRequest(requests[0])
    } else {
      setActiveRequest(null)
    }
  }

  if (isLoading) return <DashboardSkeleton />

  const displayName = user?.displayName ?? user?.name ?? user?.user_metadata?.name ?? 'Interpreter'

  return (
    <div className="space-y-4 relative">

      {/* Header — 🔴 FIX: Time-aware greeting + language pair sub-hint */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">{getGreeting()}, {displayName}</p>
          <h1 className="text-lg font-semibold text-lb-ink mt-0.5">Interpreter workspace</h1>
          <p className="text-[11px] text-lb-subtle mt-0.5">English → Pashto · Punjabi</p>
        </div>

        {/* 3-state toggle */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-lb-surface border border-lb-border shadow-sm">
            {Object.values(STATUS).map((statusKey) => {
              const meta = STATUS_META[statusKey]
              const isActive = availability === statusKey
              return (
                <button
                  key={statusKey}
                  onClick={() => setAvailability(statusKey)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                    isActive ? 'shadow-sm' : 'text-lb-muted hover:text-lb-ink hover:bg-white/50'
                  }`}
                  style={isActive ? { backgroundColor: meta.bg, color: meta.text } : {}}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: meta.color }}
                  />
                  {meta.label}
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-lb-subtle">
            {availability === STATUS.ONLINE  && 'You are visible to clients and will receive calls'}
            {availability === STATUS.BREAK   && 'You are on break — no calls, metrics preserved'}
            {availability === STATUS.OFFLINE && 'You are hidden from clients'}
          </p>
        </div>
      </div>

      {/* 🔴 FIX: Daily goal progress banner */}
      <DailyGoalBanner sessionsToday={12} earningsToday={124.50} />

      {/* COMMAND CENTER */}
      <CommandCenter
        status={availability}
        callsReceived={18}
        callsAccepted={17}
        callsMissed={1}
        acceptanceRate="94%"
        acceptanceTrend="+3%"
        sessionsToday={12}
        sessionsTrend="2"
        todayEarnings="$124.50"
        earningsTrend="+12.5%"
        avgRating="4.8"
        ratingTrend="+0.2"
        hoursToday="3h 20m"
        hoursTrend="+45m"
        callsWaiting={hasIncomingRequests ? 1 : 0}
        onWaitingClick={handleWaitingClick}
      />

      {/* INCOMING REQUESTS */}
      <div ref={incomingRef}>
        <IncomingRequests onRequestsChange={handleRequestsChange} />
      </div>

      {/* REST OF DASHBOARD */}
      <div className={`space-y-4 transition-opacity duration-500 ${
        hasIncomingRequests ? 'opacity-30 pointer-events-none select-none blur-[1px]' : 'opacity-100'
      }`}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <TodaysSchedule />
            <RecentSessions />
            <EarningsChart />
          </div>
          <div className="space-y-4">
            <PerformanceTrendPanel
              acceptanceRate="94%"
              acceptanceTrend="+3%"
              avgResponseTime="8s"
              responseTrend="faster"
              completedSessions={89}
              sessionsTrend="+12"
              onTimeRate="97%"
              onTimeTrend="+2%"
            />
            <RatingCard rating="4.8" previousRating="4.6" reviewCount={128} />
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
      <div className="h-8 bg-lb-border rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-lb-border rounded-xl overflow-hidden">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="h-48 bg-lb-border rounded-xl" />
          <div className="h-48 bg-lb-border rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-lb-border rounded-xl" />
          <div className="h-40 bg-lb-border rounded-xl" />
        </div>
      </div>
    </div>
  )
}
