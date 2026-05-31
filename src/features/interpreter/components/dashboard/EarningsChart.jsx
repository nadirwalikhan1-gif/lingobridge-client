// EarningsChart.jsx — dark header band, stronger visual presence

import { useState, useEffect, useRef } from 'react'

const DATA_SETS = {
  'This week': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data:   [98, 142, 87, 210, 163, 45, 300],
    total: '$1,045',
    range: 'Mon 12 – Sun 18 May',
    todayIdx: 6,
    bestIdx: 3,
  },
  'Last week': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data:   [90, 140, 110, 175, 130, 60, 160],
    total: '$865',
    range: 'Mon 5 – Sun 11 May',
    todayIdx: -1,
    bestIdx: 3,
  },
  'This month': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    data:   [680, 820, 750, 960],
    total: '$3,210',
    range: 'May 2026',
    todayIdx: 3,
    bestIdx: 3,
  },
  'Last month': {
    labels: ['W1', 'W2', 'W3', 'W4'],
    data:   [590, 700, 680, 830],
    total: '$2,800',
    range: 'Apr 2026',
    todayIdx: -1,
    bestIdx: 3,
  },
}

const FILTERS = Object.keys(DATA_SETS)

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
            tooltip: { callbacks: { label: (c) => ` $${c.parsed.y}` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#888780', autoSkip: false } },
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
        {/* Period filter */}
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
        {/* Legend */}
        <div className="flex gap-4 mb-3">
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
        <div className="relative w-full h-44">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  )
}