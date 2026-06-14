export default function BottomStatsGrid({ stats = [] }) {
  if (stats.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-4 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
            <div className="min-w-0 space-y-2">
              <div className="h-3 bg-slate-100 rounded w-20" />
              <div className="h-5 bg-slate-100 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">{stat.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
              {stat.online && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
            </div>
            <p className="text-xs text-slate-400">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
