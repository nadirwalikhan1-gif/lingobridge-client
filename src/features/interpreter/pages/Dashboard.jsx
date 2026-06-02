import { useEffect, useState } from 'react'
import { getSocket } from '../../../lib/socket'
import CommandCenter from '../components/dashboard/CommandCenter'
import IncomingRequests from '../components/dashboard/IncomingRequests'
import EarningsChart from '../components/dashboard/EarningsChart'
import TodaysSchedule from '../components/dashboard/TodaysSchedule'
import RecentSessions from '../components/dashboard/RecentSessions'
import RecentReviews from '../components/dashboard/RecentReviews'
import WalletSummary from '../components/dashboard/WalletSummary'
import RatingCard from '../components/dashboard/RatingCard'

// 🔴 3-state availability constants
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

export default function InterpreterDashboard() {
  const [isLoading, setIsLoading]                     = useState(true)
  const [availability, setAvailability]                 = useState(STATUS.ONLINE)
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
      if (meta.socket === 'register') {
        socket.emit('register', { role: 'interpreter' })
      }
    }
    socket.on('connect', onReconnect)
    return () => socket.off('connect', onReconnect)
  }, [availability])

  if (isLoading) return <DashboardSkeleton />

  const currentMeta = STATUS_META[availability]

  return (
    <div className="space-y-4 relative">

      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Welcome back, Maria</p>
          <h1 className="text-lg font-semibold text-lb-ink mt-0.5">Interpreter workspace</h1>
        </div>

        {/* 🔴 PROMINENT 3-state toggle */}
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
                    isActive
                      ? 'shadow-sm'
                      : 'text-lb-muted hover:text-lb-ink hover:bg-white/50'
                  }`}
                  style={isActive ? {
                    backgroundColor: meta.bg,
                    color: meta.text,
                  } : {}}
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
            {availability === STATUS.ONLINE && 'You are visible to clients and will receive calls'}
            {availability === STATUS.BREAK && 'You are on break — no calls, metrics preserved'}
            {availability === STATUS.OFFLINE && 'You are hidden from clients'}
          </p>
        </div>
      </div>

      {/* ── COMMAND CENTER: operations-first KPI bar ── */}
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
      />

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

      {/* ── REST OF DASHBOARD: 70% Operations / 30% Finance ── */}
      <div className={`space-y-4 transition-opacity duration-500 ${hasIncomingRequests ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* LEFT COLUMN (Operations — 70%) */}
          <div className="xl:col-span-2 space-y-4">
            {/* 1. Today's Schedule — enriched with domain/client org */}
            <TodaysSchedule />
            {/* 2. Recent Sessions */}
            <RecentSessions />
            {/* 3. Earnings Analytics — moved DOWN, finance is last */}
            <EarningsChart />
          </div>

          {/* RIGHT COLUMN (Finance + Profile — 30%) */}
          <div className="space-y-4">
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
      {/* Command center skeleton */}
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