// EarningsChart.jsx — Chart.js bar chart matching reference HTML exactly

import { useState, useEffect, useRef } from 'react'

const DATA_SETS = {
  'This week': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data:   [98, 142, 87, 210, 163, 45, 300],
    total: '$1,045',
    range: 'Mon 12 – Sun 18 May',
    todayIdx: 6,  // Sun = today
    bestIdx: 3,   // Thu = best
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
    // Dynamically load Chart.js if needed (it may already be in window from CDN)
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
          datasets: [{ data: ds.data, backgroundColor: colors, borderRadius: 4, borderSkipped: false }],
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
              grid: { color: 'rgba(0,0,0,0.025)' },
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
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-medium text-lb-ink">Earnings this week</h3>
          <p className="text-[11px] text-lb-muted mt-0.5">{ds.range}</p>
        </div>
        <span className="text-[22px] font-medium text-[#26215C]">{ds.total}</span>
      </div>

      {/* Period filter */}
      <div className="flex gap-1.5 mb-3">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
              active === f
                ? 'bg-[#EEEDFE] text-[#534AB7] border-[#EEEDFE] font-medium'
                : 'bg-transparent text-lb-muted border-lb-border hover:bg-lb-surface'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3.5 mb-2.5">
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
  )
}
