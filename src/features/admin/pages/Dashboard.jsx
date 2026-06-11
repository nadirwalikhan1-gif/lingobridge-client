// src/features/admin/pages/Dashboard.jsx
// Admin Mission Control — wired to AdminDataContext + Socket.IO singleton.
// No mock data. All child components receive ext props.

import { useAdminData } from '../context/AdminDataContext'
import { getSocket } from '../../../lib/socket'
import LiveSessions from '../components/dashboard/LiveSessions'
import RequestQueue from '../components/dashboard/RequestQueue'
import InterpreterPresence from '../components/dashboard/InterpreterPresence'
import ActiveDisputes from '../components/dashboard/ActiveDisputes'
import PayoutQueue from '../components/dashboard/PayoutQueue'
import OperationalAlerts from '../components/dashboard/OperationalAlerts'
import SystemHealth from '../components/dashboard/SystemHealth'
import OperationalSnapshot from '../components/dashboard/OperationalSnapshot'
import ErrorState from '../../../components/ui/ErrorState'

// ─── Platform Stats Strip ──────────────────────────────────────────────────────
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
      <div className="rounded-lg px-4 py-3.5 bg-[#1a1635] lg:col-span-2">
        <p className="text-[11px] mb-1.5 text-[#A9A4E0]">Active sessions</p>
        <p className="text-[32px] font-medium leading-none text-white">{stats.activeSessions ?? 0}</p>
        {stats.activeSessionsDelta && (
          <p className="text-[11px] mt-1.5 text-[#6EE7B7]">{stats.activeSessionsDelta}</p>
        )}
      </div>
      <div className="rounded-lg px-4 py-3.5 bg-[#E1F5EE]">
        <p className="text-[11px] mb-1.5 text-[#0F6E56]">Interpreters online</p>
        <p className="text-[22px] font-medium leading-none text-[#085041]">{stats.interpretersOnline ?? 0}</p>
        {stats.interpretersOnlineDelta && (
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">{stats.interpretersOnlineDelta}</p>
        )}
      </div>
      <div className="rounded-lg px-4 py-3.5 bg-[#FAEEDA]">
        <p className="text-[11px] mb-1.5 text-[#BA7517]">Open disputes</p>
        <p className="text-[22px] font-medium leading-none text-[#633806]">{stats.openDisputes ?? 0}</p>
        {stats.openDisputesDelta && (
          <p className="text-[11px] mt-1.5 text-[#A32D2D]">{stats.openDisputesDelta}</p>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
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
          <p className="text-xs text-lb-muted">{today} · Mission Control</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Platform overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-lb-border text-xs font-medium text-lb-ink bg-white hover:bg-lb-surface transition-colors"
          >
            Refresh
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1a1635] text-white hover:bg-[#26215C] transition-colors">
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
          <InterpreterPresence ext={interpreterPresence} />
          <ActiveDisputes
            ext={activeDisputes}
            onResolve={handleResolveDispute}
            onEscalate={handleEscalateDispute}
          />
          <PayoutQueue ext={payoutQueue} onApprove={handleApprovePayout} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <OperationalAlerts ext={alerts} />
        <SystemHealth ext={systemHealth} />
        <OperationalSnapshot ext={snapshot} />
      </div>
    </div>
  )
}