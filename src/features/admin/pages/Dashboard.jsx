// Dashboard.jsx — Admin Mission Control
// Refactored to match LingoBridge ecosystem: same lb-* tokens, card anatomy,
// spacing rhythm, and interaction philosophy as interpreter/client dashboards.
// FOCUS: operational oversight, live dispatch, session monitoring — not analytics.

import { useEffect, useState } from 'react'
import LiveSessions from '../components/dashboard/LiveSessions'
import RequestQueue from '../components/dashboard/RequestQueue'
import InterpreterPresence from '../components/dashboard/InterpreterPresence'
import ActiveDisputes from '../components/dashboard/ActiveDisputes'
import PayoutQueue from '../components/dashboard/PayoutQueue'
import OperationalAlerts from '../components/dashboard/OperationalAlerts'
import SystemHealth from '../components/dashboard/SystemHealth'
import OperationalSnapshot from '../components/dashboard/OperationalSnapshot'

const MOCK_PLATFORM_STATS = {
  activeSessions: 4,
  interpretersOnline: 12,
  requestsQueued: 7,
  openDisputes: 3,
}

// ─── Platform Stats Strip ──────────────────────────────────────────────────────
function PlatformStats({ stats }) {
  // Primary card is visually dominant; secondary/tertiary progressively smaller
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* PRIMARY — Active sessions: dark hero, col-span-2 on lg */}
      <div className="rounded-lg px-4 py-3.5 bg-[#1a1635] lg:col-span-2">
        <p className="text-[11px] mb-1.5 text-[#A9A4E0]">Active sessions</p>
        <p className="text-[32px] font-medium leading-none text-white">{stats.activeSessions}</p>
        <p className="text-[11px] mt-1.5 text-[#6EE7B7]">↑ 2 since 1h ago</p>
      </div>
      {/* SECONDARY — Interpreters online */}
      <div className="rounded-lg px-4 py-3.5 bg-[#E1F5EE]">
        <p className="text-[11px] mb-1.5 text-[#0F6E56]">Interpreters online</p>
        <p className="text-[22px] font-medium leading-none text-[#085041]">{stats.interpretersOnline}</p>
        <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ 3 from daily avg</p>
      </div>
      {/* TERTIARY — Requests + disputes stacked in 4th column on lg */}
      <div className="rounded-lg px-4 py-3.5 bg-[#FAEEDA]">
        <p className="text-[11px] mb-1.5 text-[#BA7517]">Open disputes</p>
        <p className="text-[22px] font-medium leading-none text-[#633806]">{stats.openDisputes}</p>
        <p className="text-[11px] mt-1.5 text-[#A32D2D]">1 escalated</p>
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

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(MOCK_PLATFORM_STATS)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <DashboardSkeleton />

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-3">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">{today} · Mission Control</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Platform overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-lb-border text-xs font-medium text-lb-ink bg-white hover:bg-lb-surface transition-colors">
            Export ops report
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1a1635] text-white hover:bg-[#26215C] transition-colors">
            + Assign session
          </button>
        </div>
      </div>

      {/* ── Platform stats strip ── */}
      <PlatformStats stats={stats} />

      {/* ── Main 2/3 + 1/3 grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">

        {/* Left: primary operational column */}
        <div className="xl:col-span-2 space-y-3">
          <LiveSessions />
          <RequestQueue />
        </div>

        {/* Right: secondary sidebar column */}
        <div className="space-y-3">
          <InterpreterPresence />
          <ActiveDisputes />
          <PayoutQueue />
        </div>

      </div>

      {/* ── Bottom: alerts + health + snapshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <OperationalAlerts />
        <SystemHealth />
        <OperationalSnapshot />
      </div>

    </div>
  )
}