const data = [
  { label: 'Audio Call', value: 1600, percent: 50, color: 'bg-blue-500' },
  { label: 'Video Call', value: 1300, percent: 40.6, color: 'bg-emerald-500' },
  { label: 'Chat', value: 300, percent: 9.4, color: 'bg-orange-400' },
]

export default function SessionsByType() {
  const total = data.reduce((a, b) => a + b.value, 0)
  
  // Calculate donut segments
  let cumulativePercent = 0
  const segments = data.map(d => {
    const start = cumulativePercent
    cumulativePercent += d.percent
    return { ...d, start, end: cumulativePercent }
  })

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Sessions by Type</h3>
      
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            {segments.map((s, i) => (
              <circle
                key={i}
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className={s.color}
                strokeDasharray={`${s.percent} ${100 - s.percent}`}
                strokeDashoffset={`${-s.start}`}
              />
            ))}
            <circle cx="18" cy="18" r="12" fill="white" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-slate-900">{total.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${d.color}`} />
                <span className="text-slate-600">{d.label}</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-slate-900">{d.value.toLocaleString()}</span>
                <span className="text-slate-400 ml-1">({d.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}