// EarningsStats.jsx — hero earnings card dark + supporting stats

export default function EarningsStats({ stats = {} }) {
  const {
    todayEarnings = '—', todayEarningsTrend = null,
    monthEarnings = '—', monthGrowth = null,
    sessionsToday = '—', sessionsTrend = null,
    hoursToday = '—',   hoursTrend = null,
  } = stats

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

      {/* PRIMARY — dark hero card */}
      <div className="lg:col-span-2 rounded-xl px-6 py-5 bg-[#1a1635] flex flex-col justify-between min-h-[110px]">
        <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Today's earnings</p>
        <div className="mt-2">
          <p className="text-[48px] font-semibold leading-none text-white tracking-tight">{todayEarnings}</p>
          {todayEarningsTrend && (
            <p className="text-[12px] mt-2 text-[#4ade80] flex items-center gap-1">
              <span className="text-[10px]">↑</span> {todayEarningsTrend} vs yesterday
            </p>
          )}
        </div>
      </div>

      {/* SECONDARY — this month */}
      <div className="rounded-xl px-4 py-4 bg-[#EEEDFE] flex flex-col justify-between min-h-[110px]">
        <p className="text-[11px] text-[#534AB7] uppercase tracking-widest font-medium">This month</p>
        <div className="mt-2">
          <p className="text-[28px] font-semibold leading-none text-[#26215C]">{monthEarnings}</p>
          {monthGrowth && (
            <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {monthGrowth} vs last month</p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN — sessions + hours stacked */}
      <div className="flex flex-col gap-3">
        <div className="rounded-xl px-4 py-3 bg-lb-surface border border-lb-border flex-1">
          <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-1">Sessions today</p>
          <p className="text-[22px] font-semibold text-lb-ink leading-none">{sessionsToday}</p>
          {sessionsTrend && <p className="text-[11px] mt-1 text-[#0F6E56]">{sessionsTrend} from yesterday</p>}
        </div>
        <div className="rounded-xl px-4 py-3 bg-lb-surface border border-lb-border flex-1">
          <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-1">Hours today</p>
          <p className="text-[22px] font-semibold text-lb-ink leading-none">{hoursToday}</p>
          {hoursTrend && <p className="text-[11px] mt-1 text-[#0F6E56]">+{hoursTrend.replace('+', '')}</p>}
        </div>
      </div>

    </div>
  )
}