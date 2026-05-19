// EarningsStats.jsx — 4-stat grid with visual hierarchy: primary > secondary > tertiary

export default function EarningsStats({ stats = {} }) {
  const {
    todayEarnings = '—', todayEarningsTrend = null,
    monthEarnings = '—', monthGrowth = null,
    sessionsToday = '—', sessionsTrend = null,
    hoursToday = '—',   hoursTrend = null,
  } = stats

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* PRIMARY — Today's earnings: largest, strongest accent */}
      <div className="rounded-lg px-4 py-3.5 bg-[#EEEDFE]">
        <p className="text-[11px] mb-1.5 text-[#534AB7]">Today's earnings</p>
        <p className="text-[28px] font-medium leading-none text-[#26215C]">{todayEarnings}</p>
        {todayEarningsTrend && (
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {todayEarningsTrend} vs yesterday</p>
        )}
      </div>

      {/* SECONDARY — This month: medium size */}
      <div className="rounded-lg px-4 py-3.5 bg-[#EEEDFE]">
        <p className="text-[11px] mb-1.5 text-[#534AB7]">This month</p>
        <p className="text-[22px] font-medium leading-none text-[#26215C]">{monthEarnings}</p>
        {monthGrowth && (
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {monthGrowth} vs last month</p>
        )}
      </div>

      {/* TERTIARY — Sessions today */}
      <div className="rounded-lg px-4 py-3.5 bg-lb-surface">
        <p className="text-[11px] mb-1.5 text-lb-muted">Sessions today</p>
        <p className="text-[18px] font-medium leading-none text-lb-ink">{sessionsToday}</p>
        {sessionsTrend && (
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">{sessionsTrend} from yesterday</p>
        )}
      </div>

      {/* TERTIARY — Hours today */}
      <div className="rounded-lg px-4 py-3.5 bg-lb-surface">
        <p className="text-[11px] mb-1.5 text-lb-muted">Hours today</p>
        <p className="text-[18px] font-medium leading-none text-lb-ink">{hoursToday}</p>
        {hoursTrend && (
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">+{hoursTrend.replace('+', '')}</p>
        )}
      </div>
    </div>
  )
}
