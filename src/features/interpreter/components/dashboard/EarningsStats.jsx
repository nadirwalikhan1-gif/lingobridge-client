import { DollarSign, Star, Calendar, Clock } from 'lucide-react'

function MiniSparkline({ data }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ')
  return (
    <svg className="w-16 h-6" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="4" points={points} className="text-interpreter-accent" />
    </svg>
  )
}

export default function EarningsStats({ stats = {}, sparkline = [] }) {
  const {
    todayEarnings = '—', todayEarningsTrend = null,
    rating = '—',        ratingCount = null,
    sessionsToday = '—', sessionsTrend = null,
    hoursToday = '—',    hoursTrend = null,
    monthEarnings = '—', monthGrowth = null,
  } = stats

  const cards = [
    {
      title: "Today's Earnings",
      value: todayEarnings,
      trend: todayEarningsTrend,
      trendLabel: 'from yesterday',
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Rating',
      value: rating,
      trend: ratingCount ? `Based on ${ratingCount} reviews` : null,
      icon: Star,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Sessions Today',
      value: sessionsToday,
      trend: sessionsTrend,
      trendLabel: 'from yesterday',
      icon: Calendar,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      title: 'Hours Today',
      value: hoursToday,
      trend: hoursTrend,
      trendLabel: 'from yesterday',
      icon: Clock,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.title} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">{s.title}</p>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                {s.trend && (
                  <p className="text-xs font-medium mt-1.5 text-emerald-600">
                    {String(s.trend).startsWith('+') ? '↑ ' : ''}{s.trend}
                    {s.trendLabel && <span className="text-slate-400 font-normal"> {s.trendLabel}</span>}
                  </p>
                )}
              </div>
              <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}

      {/* Monthly Earnings Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
        <p className="text-xs text-slate-500">This Month</p>
        <p className="text-xl font-bold text-emerald-600 mt-1">{monthEarnings}</p>
        {monthGrowth && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>{monthGrowth}</span>
            <span className="text-slate-400"> vs last month</span>
          </div>
        )}
        <MiniSparkline data={sparkline} />
      </div>
    </div>
  )
}