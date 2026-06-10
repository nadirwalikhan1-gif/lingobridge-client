// WalletSummary.jsx — real props only; null-safe rendering throughout

export default function WalletSummary({
  balance   = null,
  today     = null,
  week      = null,
  month     = null,
  onWithdraw,
}) {
  const display = (v) => (v != null ? v : '—')

  const rows = [
    { label: 'Today',      value: today, Icon: CalIcon },
    { label: 'This week',  value: week,  Icon: BarIcon },
    { label: 'This month', value: month, Icon: MonthIcon },
  ]

  const canWithdraw = balance != null

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Wallet summary</h3>

      <div className="divide-y divide-lb-border">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <span className="flex items-center gap-1.5 text-[12px] text-lb-muted">
              <r.Icon />
              {r.label}
            </span>
            <span className={`text-[12px] font-medium ${r.value != null ? 'text-lb-ink' : 'text-lb-muted'}`}>
              {display(r.value)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-lb-border">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="text-[11px] text-lb-muted">Wallet balance</span>
          <span className={`text-[20px] font-semibold ${balance != null ? 'text-[#26215C]' : 'text-lb-muted'}`}>
            {display(balance)}
          </span>
        </div>
        <p className="text-[10px] text-lb-subtle text-right mb-3">Available for withdrawal</p>
        <button
          onClick={onWithdraw}
          disabled={!canWithdraw}
          className={`w-full text-white text-[13px] font-medium rounded-lg py-2.5 transition-colors ${
            canWithdraw
              ? 'bg-[#1a1635] hover:bg-[#26215C]'
              : 'bg-lb-border text-lb-muted cursor-not-allowed'
          }`}
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