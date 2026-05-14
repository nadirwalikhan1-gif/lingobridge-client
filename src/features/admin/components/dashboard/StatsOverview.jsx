import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react'

const stats = [
  { title: 'Total Users', value: '12,450', trend: '+8.2%', trendLabel: 'this week', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', sparkline: [20, 35, 25, 45, 30, 50, 40, 55] },
  { title: 'Total Revenue', value: '$45,200', trend: '+15.3%', trendLabel: 'this week', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', sparkline: [30, 40, 35, 50, 45, 60, 55, 65] },
  { title: 'Total Sessions', value: '3,200', trend: '+11.7%', trendLabel: 'this week', icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50', sparkline: [25, 30, 40, 35, 45, 40, 50, 55] },
  { title: 'Conversion Rate', value: '24%', trend: '+4.5%', trendLabel: 'this week', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', sparkline: [40, 35, 45, 40, 50, 45, 55, 50] },
]

function MiniSparkline({ data, color }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ')
  
  return (
    <svg className="w-20 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        points={points}
        className={color}
      />
    </svg>
  )
}

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.title} className="card p-4 flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">{s.title}</p>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-[10px] text-emerald-600 mt-1 font-medium">↑ {s.trend} <span className="text-slate-400 font-normal">{s.trendLabel}</span></p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <MiniSparkline data={s.sparkline} color={s.color} />
            </div>
          </div>
        )
      })}
    </div>
  )
}