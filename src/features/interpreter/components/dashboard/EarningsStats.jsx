import { DollarSign, Star, Calendar, Clock } from 'lucide-react'

function MiniSparkline({ data }) {
  const max = Math.max(...data)
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ')
  return (
    <svg className="w-16 h-6" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="4" points={points} className="text-emerald-400" />
    </svg>
  )
}

const stats = [
  { title: "Today's Earnings", value: '$124.50', trend: '+12.5%', trendLabel: 'from yesterday', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Rating', value: '4.8', trend: 'Based on 128 reviews', icon: Star, color: 'text-violet-600', bg: 'bg-violet-50' },
  { title: 'Sessions Today', value: '6', trend: '+2', trendLabel: 'from yesterday', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Hours Today', value: '3h 20m', trend: '+45m', trendLabel: 'from yesterday', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function EarningsStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.title} className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">{s.title}</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{s.value}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">
              {s.trend.startsWith('+') ? '↑ ' : ''}{s.trend}
              {s.trendLabel && <span className="text-slate-400"> {s.trendLabel}</span>}
            </p>
          </div>
        )
      })}

      {/* Total Earnings Card */}
      <div className="card p-3 col-span-2 lg:col-span-1 flex flex-col justify-between">
        <p className="text-[10px] text-slate-500">Total Earnings (This Month)</p>
        <p className="text-xl font-bold text-emerald-600 mt-1">$1,245.75</p>
        <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          <span>+18.6%</span>
          <span className="text-slate-400"> from last month</span>
        </div>
        <MiniSparkline data={[30, 45, 35, 55, 48, 62, 58, 75, 68, 82]} />
      </div>
    </div>
  )
}