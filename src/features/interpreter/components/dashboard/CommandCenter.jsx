// CommandCenter.jsx — real-time operational KPIs for interpreters
// FIXES: Reviewer "Problem 1" — Call queue info at top. "Problem 4" — Performance dashboard.

export default function CommandCenter({
  status = 'online',
  callsReceived = 18,
  callsAccepted = 17,
  callsMissed = 1,
  acceptanceRate = '94%',
  acceptanceTrend = '+3%',
  sessionsToday = 12,
  sessionsTrend = '+2',
  todayEarnings = '$124.50',
  earningsTrend = '+12.5%',
  avgRating = '4.8',
  ratingTrend = '+0.2',
  hoursToday = '3h 20m',
  hoursTrend = '+45m',
  callsWaiting = 0,
}) {
  const statusMeta = {
    online:  { dot: '#1D9E75', label: 'Online',  sub: 'Receiving calls' },
    break:   { dot: '#BA7517', label: 'Break',   sub: 'Paused — metrics preserved' },
    offline: { dot: '#9CA3AF', label: 'Offline', sub: 'Hidden from clients' },
  }
  const meta = statusMeta[status] || statusMeta.online

  return (
    <div className="lb-card !p-0 overflow-hidden">
      {/* Top row: Status + Call queue + Acceptance + Rating */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-lb-border">

        {/* Status */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: meta.dot }} />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lb-muted">Status</span>
          </div>
          <p className="text-[22px] font-semibold text-lb-ink leading-none">{meta.label}</p>
          <p className="text-[11px] text-lb-subtle mt-1">{meta.sub}</p>
        </div>

        {/* Call Queue */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lb-muted">Call queue</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-[22px] font-semibold text-lb-ink leading-none">{callsReceived}</p>
            <span className="text-[11px] text-lb-subtle">received</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-[#0F6E56] font-medium">{callsAccepted} accepted</span>
            <span className="text-[11px] text-lb-subtle">·</span>
            <span className="text-[11px] text-[#A32D2D] font-medium">{callsMissed} missed</span>
            {callsWaiting > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D] animate-pulse ml-1">
                {callsWaiting} waiting
              </span>
            )}
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lb-muted">Acceptance</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-[22px] font-semibold text-[#0F6E56] leading-none">{acceptanceRate}</p>
            {acceptanceTrend && (
              <span className="text-[11px] text-[#0F6E56] font-medium">↑ {acceptanceTrend}</span>
            )}
          </div>
          <p className="text-[11px] text-lb-subtle mt-1">Target: 85% minimum</p>
        </div>

        {/* Rating */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-lb-muted">Avg rating</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-[22px] font-semibold text-[#BA7517] leading-none">{avgRating}</p>
            {ratingTrend && (
              <span className="text-[11px] text-[#0F6E56] font-medium">↑ {ratingTrend}</span>
            )}
          </div>
          <p className="text-[11px] text-lb-subtle mt-1">Based on 128 reviews</p>
        </div>
      </div>

      {/* Bottom row: Earnings + Sessions + Hours + Utilization */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-lb-border border-t border-lb-border">
        <div className="bg-[#1a1635] p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Today's earnings</span>
          <p className="text-[24px] font-semibold text-white leading-none mt-1">{todayEarnings}</p>
          {earningsTrend && <p className="text-[11px] text-[#4ade80] mt-1">↑ {earningsTrend} vs yesterday</p>}
        </div>
        <div className="bg-white p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-lb-muted uppercase tracking-widest">Sessions today</span>
          <p className="text-[24px] font-semibold text-lb-ink leading-none mt-1">{sessionsToday}</p>
          {sessionsTrend && <p className="text-[11px] text-[#0F6E56] mt-1">+{sessionsTrend} from yesterday</p>}
        </div>
        <div className="bg-white p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-lb-muted uppercase tracking-widest">Hours today</span>
          <p className="text-[24px] font-semibold text-lb-ink leading-none mt-1">{hoursToday}</p>
          {hoursTrend && <p className="text-[11px] text-[#0F6E56] mt-1">+{hoursTrend.replace('+','')} vs yesterday</p>}
        </div>
        <div className="bg-white p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-lb-muted uppercase tracking-widest">Utilization</span>
          <p className="text-[24px] font-semibold text-lb-ink leading-none mt-1">68%</p>
          <p className="text-[11px] text-lb-subtle mt-1">Time in calls / online</p>
        </div>
      </div>
    </div>
  )
}