// EarningsChart.jsx — real earnings data via socket, graceful empty state

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../../providers/AuthProvider'
import { getSocket } from '../../../../lib/socket'

// ── Date range label helpers ────────────────────────────────────────────────
function getCurrentWeekRange() {
  const now     = new Date()
  const monday  = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const sunday  = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `Mon ${fmt(monday)} – Sun ${fmt(sunday)}`
}

function getLastWeekRange() {
  const now         = new Date()
  const thisMonday  = new Date(now)
  thisMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const lastMonday  = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)
  const lastSunday  = new Date(lastMonday)
  lastSunday.setDate(lastMonday.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `Mon ${fmt(lastMonday)} – Sun ${fmt(lastSunday)}`
}

function getCurrentMonthRange() {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function getLastMonthRange() {
  const now       = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return lastMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function getTodayIndex() {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}

const FILTERS = ['This week', 'Last week', 'This month', 'Last month']

const RANGE_LABELS = {
  'This week':  getCurrentWeekRange(),
  'Last week':  getLastWeekRange(),
  'This month': getCurrentMonthRange(),
  'Last month': getLastMonthRange(),
}

// Map filter name → socket period token expected by the backend
const PERIOD_KEY = {
  'This week':  'current_week',
  'Last week':  'last_week',
  'This month': 'current_month',
  'Last month': 'last_month',
}

function fmtTotal(values = []) {
  const sum = values.reduce((a, b) => a + b, 0)
  if (!sum) return '$0'
  return `$${sum.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function exportCSV(active, ds) {
  const rows = [
    ['Period', active],
    ['Range',  RANGE_LABELS[active]],
    ['Total',  fmtTotal(ds.data)],
    [''],
    ['Day/Period', 'Earnings'],
  ]
  ds.labels.forEach((label, i) => rows.push([label, `$${ds.data[i]}`]))
  const csv  = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `earnings-${active.toLowerCase().replace(/ /g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Empty chart placeholder ─────────────────────────────────────────────────
function EmptyChart({ labels }) {
  return (
    <div className="relative w-full h-44 pr-2 flex flex-col items-center justify-center gap-2">
      <svg className="w-8 h-8 text-lb-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" d="M3 3v18h18M7 16v-4M12 16V8M17 16v-7"/>
      </svg>
      <p className="text-[12px] text-lb-muted">No earnings data for this period</p>
      <div className="absolute bottom-0 left-0 right-2 flex items-end gap-1 h-8 pointer-events-none">
        {(labels ?? []).map((l) => (
          <div key={l} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-sm bg-lb-border/40 h-4" />
            <span className="text-[9px] text-lb-border">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Chart skeleton ──────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="lb-card overflow-hidden p-0 animate-pulse">
      <div className="bg-[#1a1635] px-5 py-4 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-2.5 bg-white/10 rounded w-16" />
          <div className="h-7 bg-white/10 rounded w-24" />
          <div className="h-2 bg-white/10 rounded w-32" />
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          {FILTERS.map((f) => (
            <div key={f} className="h-5 bg-white/10 rounded w-20" />
          ))}
        </div>
      </div>
      <div className="px-5 pt-4 pb-5">
        <div className="h-44 bg-lb-border/30 rounded" />
      </div>
    </div>
  )
}

export default function EarningsChart() {
  const { user } = useAuth()

  const [active,   setActive]   = useState('This week')
  const [datasets, setDatasets] = useState({})   // keyed by filter name
  const [loading,  setLoading]  = useState(true)

  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  // ── Fetch on filter change ───────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user?.id) return

    // Already cached — no refetch
    if (datasets[active]) return

    socket.emit('get-earnings-chart', {
      userId: user.id,
      period: PERIOD_KEY[active],
    })

    const onChartData = (data) => {
      if (data.userId && data.userId !== user.id) return
      if (data.period !== PERIOD_KEY[active] && data.period) return

      // Backend shape: { period, labels: string[], data: number[], bestIdx?: number, insight?: string }
      const labels  = Array.isArray(data.labels) ? data.labels : []
      const values  = Array.isArray(data.data)   ? data.data   : []
      const bestIdx = data.bestIdx ?? (values.length ? values.indexOf(Math.max(...values)) : -1)

      setDatasets((prev) => ({
        ...prev,
        [active]: {
          labels,
          data:     values,
          bestIdx,
          todayIdx: active === 'This week' ? getTodayIndex() : -1,
          insight:  data.insight ?? null,
        },
      }))
      setLoading(false)
    }

    socket.on('earnings-chart-data', onChartData)

    // Timeout so we don't spin indefinitely
    const timer = setTimeout(() => {
      setDatasets((prev) => prev[active] ? prev : { ...prev, [active]: null })
      setLoading(false)
    }, 4000)

    return () => {
      socket.off('earnings-chart-data', onChartData)
      clearTimeout(timer)
    }
  }, [user?.id, active, datasets])

  // ── Build/rebuild chart ──────────────────────────────────────────────────
  useEffect(() => {
    const ds = datasets[active]
    if (!ds || !ds.data?.length) return

    const buildChart = () => {
      if (!canvasRef.current) return
      if (chartRef.current) chartRef.current.destroy()

      const colors = ds.data.map((_, i) => {
        if (i === ds.bestIdx)  return '#7F77DD'
        if (i === ds.todayIdx) return '#AFA9EC'
        return '#EEEDFE'
      })

      chartRef.current = new window.Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels:   ds.labels,
          datasets: [{ data: ds.data, backgroundColor: colors, borderRadius: 6, borderSkipped: false }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` $${c.parsed.y}`,
                title: (items) => {
                  const i      = items[0].dataIndex
                  const labels = []
                  if (i === ds.bestIdx)  labels.push('🏆 Best day')
                  if (i === ds.todayIdx) labels.push('📅 Today')
                  return labels.length ? `${ds.labels[i]} — ${labels.join(', ')}` : ds.labels[i]
                },
              },
              backgroundColor: '#1a1635',
              titleColor:      '#fff',
              bodyColor:       '#AFA9EC',
              padding:          10,
              cornerRadius:      8,
            },
          },
          scales: {
            x: {
              grid:    { display: false },
              ticks:   { font: { size: 11 }, color: '#888780', autoSkip: false },
              afterFit: (scale) => { scale.paddingRight = 8 },
            },
            y: {
              grid:   { color: 'rgba(0,0,0,0.04)' },
              ticks:  { font: { size: 10 }, color: '#888780', callback: (v) => `$${v}` },
              border: { display: false },
            },
          },
        },
      })
    }

    if (window.Chart) {
      buildChart()
    } else {
      const script    = document.createElement('script')
      script.src      = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
      script.onload   = buildChart
      document.head.appendChild(script)
    }

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [active, datasets])

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading && !datasets[active]) return <ChartSkeleton />

  const ds    = datasets[active]
  const total = ds?.data?.length ? fmtTotal(ds.data) : '—'
  const range = RANGE_LABELS[active]

  return (
    <div className="lb-card overflow-hidden p-0">
      {/* Dark header band */}
      <div className="bg-[#1a1635] px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Earnings</p>
          <p className="text-[28px] font-semibold text-white leading-none mt-1">{total}</p>
          <p className="text-[11px] text-white/40 mt-1">{range}</p>
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setActive(f); setLoading(!datasets[f]) }}
              className={`text-[11px] px-2.5 py-1 rounded transition-colors ${
                active === f
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="px-5 pt-4 pb-5">
        {/* Legend + Export */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-lb-muted">
              <span className="w-2.5 h-2.5 rounded-[2px] inline-block bg-[#7F77DD]" />Best day
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-lb-muted">
              <span className="w-2.5 h-2.5 rounded-[2px] inline-block bg-[#AFA9EC]" />Today
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-lb-muted">
              <span className="w-2.5 h-2.5 rounded-[2px] inline-block bg-[#EEEDFE] border border-[#CECBF6]" />Other days
            </span>
          </div>
          {ds?.data?.length > 0 && (
            <button
              onClick={() => exportCSV(active, ds)}
              className="flex items-center gap-1 text-[10px] text-lb-muted hover:text-[#534AB7] transition-colors px-2 py-1 rounded border border-lb-border hover:border-[#7F77DD] hover:bg-[#EEEDFE]"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export CSV
            </button>
          )}
        </div>

        {/* Chart or empty */}
        {ds?.data?.length > 0 ? (
          <div className="relative w-full h-44 pr-2">
            <canvas ref={canvasRef} />
          </div>
        ) : (
          <EmptyChart labels={
            active.includes('week')
              ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              : ['W1', 'W2', 'W3', 'W4']
          } />
        )}

        {/* Insight banner */}
        {ds?.insight && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-[#FAEEDA] border border-[#F5D0A9]">
            <svg className="w-3.5 h-3.5 text-[#854F0B] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-[10px] text-[#854F0B]">{ds.insight}</p>
          </div>
        )}
      </div>
    </div>
  )
}
