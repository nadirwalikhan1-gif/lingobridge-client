import StatCard from '../../../../components/ui/StatCard'

export default function StatsGrid({ stats = [] }) {
  if (stats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          trend={stat.trend}
          trendValue={stat.trendValue}
          icon={stat.icon}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  )
}
