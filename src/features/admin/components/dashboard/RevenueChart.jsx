import { ChevronDown } from 'lucide-react'

const data = [
  { day: 'May 12', value: 10000 },
  { day: 'May 13', value: 20000 },
  { day: 'May 14', value: 15000 },
  { day: 'May 15', value: 24500 },
  { day: 'May 16', value: 28000 },
  { day: 'May 17', value: 25000 },
  { day: 'May 18', value: 35000 },
]

export default function RevenueChart() {
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Revenue Overview</h3>
        <button className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
          This Week
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="relative h-48">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[10px] text-slate-400 text-right pr-2">
          <span>$40K</span>
          <span>$30K</span>
          <span>$20K</span>
          <span>$10K</span>
          <span>$0</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 h-full relative">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(pct => (
            <div key={pct} className="absolute w-full border-t border-slate-100" style={{ bottom: `${pct}%` }} />
          ))}

          {/* Area fill */}
          <svg className="absolute inset-0 w-full h-[calc(100%-24px)]" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              fill="url(#revenueGradient)"
              points={`0,100 ${data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d.value - min) / range) * 100}`).join(' ')} 100,100`}
            />
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.5"
              points={data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d.value - min) / range) * 100}`).join(' ')}
            />
            {data.map((d, i) => (
              <circle
                key={i}
                cx={`${(i / (data.length - 1)) * 100}`}
                cy={`${100 - ((d.value - min) / range) * 100}`}
                r="1.5"
                fill="#3b82f6"
              />
            ))}
          </svg>

          {/* Tooltip for May 15 */}
          <div className="absolute top-[35%] left-[43%] bg-white shadow-lg rounded-lg p-2 text-xs border border-slate-100 z-10">
            <p className="text-slate-500 text-[10px]">May 15, 2024</p>
            <p className="font-semibold text-slate-900">Revenue: $24,500</p>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="ml-10 flex justify-between mt-1 text-[10px] text-slate-400">
          {data.map(d => <span key={d.day}>{d.day}</span>)}
        </div>
      </div>
    </div>
  )
}