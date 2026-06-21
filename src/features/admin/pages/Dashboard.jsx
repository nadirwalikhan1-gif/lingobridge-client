// src/features/admin/pages/Dashboard.jsx
// Admin Mission Control — wired to AdminDataContext + Socket.IO singleton.
// No mock data. All child components receive ext props.

import { lazy, Suspense } from 'react'
import { useAdminData } from '../context/AdminDataContext'
import { getSocket } from '../../../lib/socket'
import LiveSessions from '../components/dashboard/LiveSessions'
import RequestQueue from '../components/dashboard/RequestQueue'
import ErrorState from '../../../components/ui/ErrorState'

// ─── Below-the-fold: lazy loaded ─────────────────────────────────────────────
const InterpreterPresence   = lazy(() => import('../components/dashboard/InterpreterPresence'))
const ActiveDisputes        = lazy(() => import('../components/dashboard/ActiveDisputes'))
const PayoutQueue           = lazy(() => import('../components/dashboard/PayoutQueue'))
const OperationalAlerts     = lazy(() => import('../components/dashboard/OperationalAlerts'))
const SystemHealth          = lazy(() => import('../components/dashboard/SystemHealth'))
const OperationalSnapshot   = lazy(() => import('../components/dashboard/OperationalSnapshot'))

// --- Platform Stats Strip ------------------------------------------------------
function PlatformStats({ stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
        <div className="h-24 bg-lb-border rounded-lg lg:col-span-2" />
        <div className="h-24 bg-lb-border rounded-lg" />
        <div className="h-24 bg-lb-border rounded-lg" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="rounded-xl px-4 py-4 bg-[#1a1635] lg:col-span-2">
        <p className="lb-label mb-2 !text-[#A9A4E0]">Active sessions</p>
        <p className="text-[32px] font-bold leading-none text-white lb-stat-num">{stats.activeSessions ?? 0}</p>
        {stats.activeSessionsDelta && (
          <p className="text-[11px] mt-1.5 text-[#6EE7B7]">{stats.activeSessionsDelta}</p>
        )}
      </div>
      <div className="rounded-xl px-4 py-4 bg-[#E1F5EE]">
        <p className="lb-label mb-2 !text-[#0F6E56]">Interpreters online</p>
        <p className="text-[22px] font-bold leading-none text-[#085041] lb-stat-num">{stats.interpretersOnline ?? 0}</p>
        {stats.interpretersOnlineDelta && (
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">{stats.interpretersOnlineDelta}</p>
        )}
      </div>
      <div className="rounded-xl px-4 py-4 bg-[#FAEEDA]">
        <p className="lb-label mb-2 !text-[#BA7517]">Open disputes</p>
        <p className="text-[22px] font-bold leading-none text-[#633806] lb-stat-num">{stats.openDisputes ?? 0}</p>
        {stats.openDisputesDelta && (
          <p className="text-[11px] mt-1.5 text-[#A32D2D]">{stats.openDisputesDelta}</p>
        )}
      </div>
    </div>
  )
}

// --- Skeleton ----------------------------------------------------------------
function DashboardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 bg-lb-border rounded w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-lb-border rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 space-y-3">
          <div className="h-52 bg-lb-border rounded-xl" />
          <div className="h-64 bg-lb-border rounded-xl" />
        </div>
        <div className="space-y-3">
          <div className="h-52 bg-lb-border rounded-xl" />
          <div className="h-44 bg-lb-border rounded-xl" />
          <div className="h-36 bg-lb-border rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-lb-border rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/** Reusable lazy-card fallback matching the skeleton aesthetic */
function CardFallback({ className = '' }) {
  return <div className={`bg-lb-border rounded-xl animate-pulse ${className}`} />
}

export default function AdminDashboard() {
  const {
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
  } = useAdminData()

  const handleAssign = (requestId) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('admin-assign-interpreter', { requestId })
  }

  const handleSkip = (requestId) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('admin-skip-request', { requestId })
  }

  const handleApprovePayout = (payoutId) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit('admin-approve-payout', { payoutId })
  }

  const handleResolveDispute = (id) => {
    if (!window.confirm('Resolve this dispute?')) return
    const socket = getSocket()
    if (!socket) return
    socket.emit('admin-resolve-dispute', { disputeId: id })
  }

  const handleEscalateDispute = (id) => {
    if (!window.confirm('Escalate this dispute?')) return
    const socket = getSocket()
    if (!socket) return
    socket.emit('admin-escalate-dispute', { disputeId: id })
  }

  if (hasError) {
    return <ErrorState message="Couldn't connect to mission control. Check your connection." onRetry={refresh} />
  }

  if (!isSocketReady) return <DashboardSkeleton />

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="lb-page-eyebrow">{today} — Mission Control</p>
          <h1 className="lb-page-title">Platform overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-lb-border text-xs font-semibold text-lb-ink bg-white hover:bg-lb-surface active:scale-[0.97] transition-all"
          >
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1a1635] text-white hover:bg-[#26215C] active:scale-[0.97] transition-all shadow-sm">
            + Assign session
          </button>
        </div>
      </div>

      <PlatformStats stats={platformStats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 space-y-3">
          <LiveSessions ext={liveSessions} />
          <RequestQueue
            ext={requestQueue}
            onAssign={handleAssign}
            onSkip={handleSkip}
          />
        </div>
        <div className="space-y-3">
          <Suspense fallback={<CardFallback className="h-52" />}>
            <InterpreterPresence ext={interpreterPresence} />
          </Suspense>
          <Suspense fallback={<CardFallback className="h-44" />}>
            <ActiveDisputes
              ext={activeDisputes}
              onResolve={handleResolveDispute}
              onEscalate={handleEscalateDispute}
            />
          </Suspense>
          <Suspense fallback={<CardFallback className="h-36" />}>
            <PayoutQueue ext={payoutQueue} onApprove={handleApprovePayout} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Suspense fallback={<CardFallback className="h-32" />}>
          <OperationalAlerts ext={alerts} />
        </Suspense>
        <Suspense fallback={<CardFallback className="h-32" />}>
          <SystemHealth ext={systemHealth} />
        </Suspense>
        <Suspense fallback={<CardFallback className="h-32" />}>
          <OperationalSnapshot ext={snapshot} />
        </Suspense>
      </div>
    </div>
  )
}