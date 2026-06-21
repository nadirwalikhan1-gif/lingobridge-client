import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import { useFallbackTimeout } from '../../../hooks/useFallbackTimeout'
import CommandCenter, { PerformanceTrendPanel } from '../components/dashboard/CommandCenter'
import IncomingRequests from '../components/dashboard/IncomingRequests'

// ─── Below-the-fold: lazy loaded ─────────────────────────────────────────────
import EarningsChart    from '../components/dashboard/EarningsChart'
const TodaysSchedule  = lazy(() => import('../components/dashboard/TodaysSchedule'))
const RecentSessions  = lazy(() => import('../components/dashboard/RecentSessions'))
const RecentReviews   = lazy(() => import('../components/dashboard/RecentReviews'))
const WalletSummary   = lazy(() => import('../components/dashboard/WalletSummary'))
const RatingCard      = lazy(() => import('../components/dashboard/RatingCard'))

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

const SESSION_GOAL    = 15
const EARNINGS_GOAL   = 150

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function fmt(dollars) {
  if (dollars == null) return '—'
  return `$${Number(dollars).toFixed(2)}`
}

function fmtMinutes(mins) {
  if (!mins) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function DailyGoalBanner({ sessionsToday = 0, earningsToday = 0 }) {
  const sessionPct  = Math.min(100, Math.round((sessionsToday  / SESSION_GOAL)  * 100))
  const earningsPct = Math.min(100, Math.round((earningsToday  / EARNINGS_GOAL) * 100))

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
          <div className="flex items-center gap-2 min-w-[160px]">
            <span className="text-[11px] text-lb-muted whitespace-nowrap">Sessions {sessionsToday}/{SESSION_GOAL}</span>
            <div className="flex-1 h-1.5 bg-lb-border rounded-full overflow-hidden min-w-[80px]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${sessionPct}%`, backgroundColor: sessionPct >= 100 ? '#1D9E75' : '#7F77DD' }}
              />
            </div>
            <span className="text-[10px] font-semibold text-[#534AB7]">{sessionPct}%</span>
          </div>
          <div className="flex items-center gap-2 min-w-[160px]">
            <span className="text-[11px] text-lb-muted whitespace-nowrap">Earnings ${earningsToday}/${EARNINGS_GOAL}</span>
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

  const [isLoading,            setIsLoading]            = useState(true)
  const [availability,         setAvailability]         = useState(STATUS.ONLINE)
  const [hasIncomingRequests,  setHasIncomingRequests]  = useState(false)
  const [dashStats,            setDashStats]            = useState(null)
  const [performanceStats,     setPerformanceStats]     = useState(null)
  const [walletData,           setWalletData]           = useState(null)
  const [ratingData,           setRatingData]           = useState(null)

  const incomingRef = useRef(null)

  // ── Socket listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user?.id) return

    socket.emit('get-dashboard-stats',   { userId: user.id })
    socket.emit('get-performance-stats', { userId: user.id })
    socket.emit('get-balance',           { userId: user.id, vaultType: 'interpreter' })
    socket.emit('get-rating-summary',    { userId: user.id })

    const onDashStats = (data) => {
      if (data.userId === user.id || !data.userId) setDashStats(data)
    }

    const onPerfStats = (data) => {
      if (data.userId === user.id || !data.userId) setPerformanceStats(data)
    }

    const onBalance = (data) => {
      if (data.userId === user.id || !data.userId) setWalletData(data)
    }

    const onRating = (data) => {
      if (data.userId === user.id || !data.userId) setRatingData(data)
    }

    const onNewRequest    = () => setHasIncomingRequests(true)
    const onRequestGone   = () => setHasIncomingRequests(false)

    socket.on('dashboard-stats',   onDashStats)
    socket.on('performance-stats', onPerfStats)
    socket.on('balance-update',    onBalance)
    socket.on('rating-update',     onRating)
    socket.on('new-request',       onNewRequest)
    socket.on('request-cancelled', onRequestGone)
    socket.on('call-accepted',     onRequestGone)

    return () => {
      socket.off('dashboard-stats',   onDashStats)
      socket.off('performance-stats', onPerfStats)
      socket.off('balance-update',    onBalance)
      socket.off('rating-update',     onRating)
      socket.off('new-request',       onNewRequest)
      socket.off('request-cancelled', onRequestGone)
      socket.off('call-accepted',     onRequestGone)
    }
  }, [user?.id])

  useFallbackTimeout(dashStats, setIsLoading)

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

  const handleWaitingClick = useCallback(() => {
    incomingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleRequestsChange = useCallback((hasRequests) => {
    setHasIncomingRequests(hasRequests)
  }, [])

  if (isLoading) return <DashboardSkeleton />

  const displayName = user?.displayName ?? user?.name ?? user?.user_metadata?.name ?? 'Interpreter'

  const sessionsToday  = dashStats?.sessionsToday  ?? 0
  const earningsToday  = dashStats?.earningsToday  ?? 0
  const callsReceived  = dashStats?.callsReceived  ?? 0
  const callsAccepted  = dashStats?.callsAccepted  ?? 0
  const callsMissed    = dashStats?.callsMissed    ?? 0
  const sessionsTrend  = dashStats?.sessionsTrend  ?? null
  const earningsTrend  = dashStats?.earningsTrend  ?? null
  const minutesToday   = dashStats?.minutesToday   ?? 0
  const hoursTrend     = dashStats?.hoursTrend     ?? null

  const acceptanceRate = callsReceived > 0
    ? `${Math.round((callsAccepted / callsReceived) * 100)}%`
    : '—'
  const acceptanceTrend = dashStats?.acceptanceTrend ?? null

  const avgRating   = ratingData?.average    ?? null
  const prevRating  = ratingData?.previous   ?? null
  const reviewCount = ratingData?.count      ?? 0
  const ratingTrend = ratingData?.trend      ?? null

  const walletBalance = walletData?.balance ?? null
  const walletToday   = walletData?.today   ?? null
  const walletWeek    = walletData?.week    ?? null
  const walletMonth   = walletData?.month   ?? null

  const perfAcceptance    = performanceStats?.acceptanceRate    ?? null
  const perfAccTrend      = performanceStats?.acceptanceTrend   ?? null
  const perfResponseTime  = performanceStats?.avgResponseTime   ?? null
  const perfRespTrend     = performanceStats?.responseTrend     ?? null
  const perfCompleted     = performanceStats?.completedSessions ?? null
  const perfSessionsTrend = performanceStats?.sessionsTrend     ?? null
  const perfOnTime        = performanceStats?.onTimeRate        ?? null
  const perfOnTimeTrend   = performanceStats?.onTimeTrend       ?? null

  return (
    <div className="space-y-4 relative">

      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="lb-page-eyebrow">{getGreeting()}, {displayName}</p>
          <h1 className="lb-page-title mt-0.5">Interpreter workspace</h1>
          <p className="text-[11px] text-lb-subtle mt-0.5">English → Pashto · Punjabi</p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-lb-surface border border-lb-border shadow-sm">
            {Object.values(STATUS).map((statusKey) => {
              const meta     = STATUS_META[statusKey]
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

      <DailyGoalBanner sessionsToday={sessionsToday} earningsToday={earningsToday} />

      <CommandCenter
        status={availability}
        callsReceived={callsReceived}
        callsAccepted={callsAccepted}
        callsMissed={callsMissed}
        acceptanceRate={acceptanceRate}
        acceptanceTrend={acceptanceTrend}
        sessionsToday={sessionsToday}
        sessionsTrend={sessionsTrend}
        todayEarnings={fmt(earningsToday)}
        earningsTrend={earningsTrend}
        avgRating={avgRating ?? '—'}
        ratingTrend={ratingTrend}
        hoursToday={fmtMinutes(minutesToday)}
        hoursTrend={hoursTrend}
        callsWaiting={hasIncomingRequests ? 1 : 0}
        onWaitingClick={handleWaitingClick}
      />

      <div ref={incomingRef}>
        <IncomingRequests onRequestsChange={handleRequestsChange} />
      </div>

      <div className={`space-y-4 transition-opacity duration-500 ${
        hasIncomingRequests ? 'opacity-30 pointer-events-none select-none blur-[1px]' : 'opacity-100'
      }`}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <Suspense fallback={<div className="h-48 bg-lb-border rounded-xl animate-pulse" />}>
              <TodaysSchedule />
            </Suspense>
            <Suspense fallback={<div className="h-48 bg-lb-border rounded-xl animate-pulse" />}>
              <RecentSessions />
            </Suspense>
            <Suspense fallback={<div className="h-48 bg-lb-border rounded-xl animate-pulse" />}>
              <EarningsChart />
            </Suspense>
          </div>
          <div className="space-y-4">
            <PerformanceTrendPanel
              acceptanceRate={perfAcceptance}
              acceptanceTrend={perfAccTrend}
              avgResponseTime={perfResponseTime}
              responseTrend={perfRespTrend}
              completedSessions={perfCompleted}
              sessionsTrend={perfSessionsTrend}
              onTimeRate={perfOnTime}
              onTimeTrend={perfOnTimeTrend}
            />
            <Suspense fallback={<div className="h-32 bg-lb-border rounded-xl animate-pulse" />}>
              <RatingCard
                rating={avgRating}
                previousRating={prevRating}
                reviewCount={reviewCount}
              />
            </Suspense>
            <Suspense fallback={<div className="h-40 bg-lb-border rounded-xl animate-pulse" />}>
              <WalletSummary
                balance={walletBalance != null ? fmt(walletBalance) : null}
                today={walletToday   != null ? fmt(walletToday)   : null}
                week={walletWeek     != null ? fmt(walletWeek)    : null}
                month={walletMonth   != null ? fmt(walletMonth)   : null}
              />
            </Suspense>
            <Suspense fallback={<div className="h-40 bg-lb-border rounded-xl animate-pulse" />}>
              <RecentReviews />
            </Suspense>
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