// EarningsChart.jsx — 10/10: Hover tooltips, data export, chart padding fix, Saturday insight

import { useState, useEffect, useRef } from 'react'

function getCurrentWeekRange() {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `Mon ${fmt(monday)} – Sun ${fmt(sunday)}`
}

function getLastWeekRange() {
  const now = new Date()
  const thisMonday = new Date(now)
  thisMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)
  const lastSunday = new Date(lastMonday)
  lastSunday.setDate(lastMonday.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `Mon ${fmt(lastMonday)} – Sun ${fmt(lastSunday)}`
}

function getCurrentMonthRange() {
  const now = new Date()
  return now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function getLastMonthRange() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return lastMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function getTodayIndex() {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
}

const DATA_SETS = {
  'This week': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data:   [98, 142, 87, 210, 163, 45, 300],
    total: '$1,045',
    range: getCurrentWeekRange(),
    todayIdx: getTodayIndex(),
    bestIdx: 6,
    insight: 'Saturday earnings are low — consider opening more availability or checking your schedule settings.',
  },
  'Last week': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data:   [90, 140, 110, 175, 130, 60, 160],
    total: '$865',
    range: getLastWeekRange(),
    todayIdx: -1,
    bestIdx: 3,
    insight: null,
  },
  'This month': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    data:   [680, 820, 750, 960],
    total: '$3,210',
    range: getCurrentMonthRange(),
    todayIdx: 3,
    bestIdx: 3,
    insight: null,
  },
  'Last month': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    data:   [590, 700, 680, 830],
    total: '$2,800',
    range: getLastMonthRange(),
    todayIdx: -1,
    bestIdx: 3,
    insight: null,
  },
}

const FILTERS = Object.keys(DATA_SETS)

function exportCSV(active, ds) {
  const rows = [['Period', active], ['Range', ds.range], ['Total', ds.total], [''], ['Day/Period', 'Earnings']]
  ds.labels.forEach((label, i) => rows.push([label, `$${ds.data[i]}`]))
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `earnings-${active.toLowerCase().replace(/ /g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function EarningsChart() {
  const [active, setActive] = useState('This week')
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  const ds = DATA_SETS[active]

  useEffect(() => {
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
          labels: ds.labels,
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
                  const i = items[0].dataIndex
                  const labels = []
                  if (i === ds.bestIdx) labels.push('🏆 Best day')
                  if (i === ds.todayIdx) labels.push('📅 Today')
                  return labels.length ? `${ds.labels[i]} — ${labels.join(', ')}` : ds.labels[i]
                },
              },
              backgroundColor: '#1a1635',
              titleColor: '#fff',
              bodyColor: '#AFA9EC',
              padding: 10,
              cornerRadius: 8,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: '#888780', autoSkip: false },
              // 🔴 FIX: padding so Sunday bar isn't cut off
              afterFit: (scale) => { scale.paddingRight = 8 },
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: { font: { size: 10 }, color: '#888780', callback: (v) => `$${v}` },
              border: { display: false },
            },
          },
        },
      })
    }

    if (window.Chart) {
      buildChart()
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
      script.onload = buildChart
      document.head.appendChild(script)
    }

    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [active])

  return (
    <div className="lb-card overflow-hidden p-0">
      {/* Dark header band */}
      <div className="bg-[#1a1635] px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Earnings</p>
          <p className="text-[28px] font-semibold text-white leading-none mt-1">{ds.total}</p>
          <p className="text-[11px] text-white/40 mt-1">{ds.range}</p>
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActive(f)}
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
          {/* 🔴 FIX: Export button */}
          <button
            onClick={() => exportCSV(active, ds)}
            className="flex items-center gap-1 text-[10px] text-lb-muted hover:text-[#534AB7] transition-colors px-2 py-1 rounded border border-lb-border hover:border-[#7F77DD] hover:bg-[#EEEDFE]"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export CSV
          </button>
        </div>

        <div className="relative w-full h-44 pr-2">
          <canvas ref={canvasRef} />
        </div>

        {/* 🔴 FIX: Low-earnings insight banner */}
        {ds.insight && (
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
