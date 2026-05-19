const payouts = [
  { id: 1, amount: 450.00, method: 'Bank transfer', date: 'May 1, 2026',  status: 'completed', account: '**** 4242' },
  { id: 2, amount: 380.50, method: 'PayPal',         date: 'Apr 15, 2026', status: 'completed', account: 'maria@email.com' },
  { id: 3, amount: 520.00, method: 'Bank transfer', date: 'Apr 1, 2026',  status: 'completed', account: '**** 4242' },
]

const totalPaid = payouts.reduce((s, p) => s + p.amount, 0)

export default function Payouts() {
  return (
    <div className="space-y-3 max-w-2xl">
      <h1 className="text-lg font-medium text-lb-ink pb-1">Payouts</h1>

      {/* Balance card */}
      <div className="lb-card !bg-[#26215C] text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] text-white/60 mb-1">Available balance</p>
            <p className="text-[32px] font-medium leading-none">$284.50</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#26215C] text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Withdraw
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white/20 text-white text-[12px] font-medium rounded-lg hover:bg-white/30 transition-colors">
            View history
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="lb-card">
          <p className="text-[11px] text-lb-muted mb-1.5">Total paid out</p>
          <p className="text-[20px] font-medium text-lb-ink">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="lb-card">
          <p className="text-[11px] text-lb-muted mb-1.5">Pending</p>
          <p className="text-[20px] font-medium text-lb-ink">$28.00</p>
        </div>
        <div className="lb-card">
          <p className="text-[11px] text-lb-muted mb-1.5">Next payout</p>
          <p className="text-[20px] font-medium text-lb-ink">May 30</p>
        </div>
      </div>

      {/* History */}
      <div className="lb-card">
        <h3 className="text-[14px] font-medium text-lb-ink mb-3">Payout history</h3>
        <div className="divide-y divide-lb-border">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="w-9 h-9 rounded-full bg-[#EEEDFE] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#534AB7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-lb-ink">{p.method}</p>
                <p className="text-[11px] text-lb-muted">{p.account} · {p.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-medium text-lb-ink">${p.amount.toFixed(2)}</p>
                <span className="text-[10px] font-medium bg-[#EAF3DE] text-[#3B6D11] px-1.5 py-0.5 rounded">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
