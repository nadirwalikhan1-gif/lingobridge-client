// WalletSummary.jsx — new component replacing AvailabilitySchedule on dashboard
// Matches reference HTML wallet card with "available for withdrawal" microcopy

export default function WalletSummary({
  balance = '$124.75',
  today = '$124.50',
  week = '$1,045',
  month = '$1,245',
  rating = '4.8',
  reviewCount = 128,
  onWithdraw,
}) {
  const rows = [
    { label: 'Today',      value: today, icon: CalIcon },
    { label: 'This week',  value: week,  icon: BarIcon },
    { label: 'This month', value: month, icon: MonthIcon },
    { label: 'Rating',     isRating: true },
  ]

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Wallet summary</h3>

      <div className="divide-y divide-lb-border">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-1.5">
            <span className="flex items-center gap-1.5 text-[12px] text-lb-muted">
              {r.icon && <r.icon />}
              {r.label}
            </span>
            {r.isRating ? (
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[12px] text-[#BA7517] tracking-wide">★★★★★</span>
                <span className="text-[10px] text-lb-muted">{rating} · {reviewCount} reviews</span>
              </div>
            ) : (
              <span className="text-[12px] font-medium text-lb-ink">{r.value}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-lb-border">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="text-[11px] text-lb-muted">Wallet balance</span>
          <span className="text-[17px] font-medium text-[#26215C]">{balance}</span>
        </div>
        <p className="text-[10px] text-lb-subtle text-right mb-2">Available for withdrawal</p>
        <button
          onClick={onWithdraw}
          className="w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[13px] font-medium rounded-lg py-2 transition-colors"
        >
          ↑ Withdraw funds
        </button>
      </div>
    </div>
  )
}

function CalIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}
function BarIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" d="M3 3v18h18M7 16v-4M12 16V8M17 16v-7"/>
    </svg>
  )
}
function MonthIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  )
}
