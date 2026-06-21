// EarningsStats.jsx — hero earnings card dark + supporting stats
// All values via real props. Safe fallback: '—' for missing data.

export default function EarningsStats({ stats = {} }) {
  const {
    todayEarnings      = null,  todayEarningsTrend = null,
    monthEarnings      = null,  monthGrowth        = null,
    sessionsToday      = null,  sessionsTrend      = null,
    hoursToday         = null,  hoursTrend         = null,
    acceptanceRate     = null,  acceptanceTrend    = null,
    certHours          = null,  certTarget         = null,
  } = stats

  const display = (v) => (v != null ? v : '—')

  // Certification progress — only when both values are real numbers
  const certProgress = (() => {
    if (!certHours || !certTarget) return 0
    const hours  = parseFloat(String(certHours).replace(/[^0-9.]/g, ''))  || 0
    const target = parseFloat(String(certTarget).replace(/[^0-9.]/g, '')) || 0
    if (!target) return 0
    return Math.min(100, Math.round((hours / target) * 100))
  })()

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

      {/* PRIMARY — dark hero card */}
      <div className="lg:col-span-2 rounded-xl px-6 py-5 bg-[#1a1635] flex flex-col justify-between min-h-[110px]">
        <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Today's earnings</p>
        <div className="mt-2">
          <p className="text-[48px] font-semibold leading-none text-white tracking-tight">
            {display(todayEarnings)}
          </p>
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
          <p className="text-[28px] font-semibold leading-none text-[#26215C]">
            {display(monthEarnings)}
          </p>
          {monthGrowth && (
            <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {monthGrowth} vs last month</p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN — sessions + hours stacked */}
      <div className="flex flex-col gap-3">
        <div className="rounded-xl px-4 py-3 bg-lb-surface border border-lb-border flex-1">
          <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-1">Sessions today</p>
          <p className="text-[22px] font-semibold text-lb-ink leading-none">{display(sessionsToday)}</p>
          {sessionsTrend && (
            <p className="text-[11px] mt-1 text-[#0F6E56]">{sessionsTrend} from yesterday</p>
          )}
        </div>
        <div className="rounded-xl px-4 py-3 bg-lb-surface border border-lb-border flex-1">
          <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-1">Hours today</p>
          <p className="text-[22px] font-semibold text-lb-ink leading-none">{display(hoursToday)}</p>
          {hoursTrend && (
            <p className="text-[11px] mt-1 text-[#0F6E56]">+{String(hoursTrend).replace('+', '')}</p>
          )}
        </div>
      </div>

      {/* Acceptance rate */}
      <div className="col-span-2 lg:col-span-1 rounded-xl px-4 py-4 bg-[#E1F5EE] border border-[#CECBF6] flex flex-col justify-between min-h-[110px]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[#0F6E56] uppercase tracking-widest font-medium">Acceptance rate</p>
          {acceptanceRate && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#0F6E56] text-white">
              {acceptanceRate}
            </span>
          )}
        </div>
        <div className="mt-2">
          <p className="text-[28px] font-semibold leading-none text-[#0F6E56]">
            {display(acceptanceRate)}
          </p>
          {acceptanceTrend && (
            <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {acceptanceTrend} this week</p>
          )}
        </div>
        <p className="text-[10px] text-[#0F6E56]/70 mt-1">Target: 85% minimum</p>
      </div>

      {/* Certification hours */}
      <div className="col-span-2 lg:col-span-1 rounded-xl px-4 py-4 bg-[#FAEEDA] border border-[#F5D0A9] flex flex-col justify-between min-h-[110px]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[#854F0B] uppercase tracking-widest font-medium">Cert. hours</p>
          {certHours && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#854F0B] text-white">
              {certHours}
            </span>
          )}
        </div>
        <div className="mt-2">
          <p className="text-[28px] font-semibold leading-none text-[#854F0B]">
            {display(certHours)}
          </p>
          {certTarget && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#854F0B]/70">{certTarget} target</span>
                <span className="text-[10px] text-[#854F0B] font-medium">{certProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#F5D0A9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#BA7517] rounded-full transition-all"
                  style={{ width: `${certProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
