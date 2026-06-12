// src/features/admin/components/dashboard/PayoutQueue.jsx
// Wired to parent via onApprove prop. Added per-row Approve button.

// ✅ FIX: added 'rejected' status + safe fallback so unknown statuses don't crash
const payoutStatus = {
  pending:  { bg: 'bg-[#FAEEDA]', text: 'text-[#BA7517]', label: 'Pending' },
  approved: { bg: 'bg-[#E1F5EE]', text: 'text-[#0F6E56]', label: 'Approved' },
  rejected: { bg: 'bg-lb-surface', text: 'text-lb-muted',  label: 'Rejected' },
}

function parseAmount(amount) {
  if (typeof amount === 'number') return amount
  if (typeof amount === 'string') {
    const num = parseFloat(amount.replace(/[$,]/g, ''))
    return isNaN(num) ? 0 : num
  }
  return 0
}

export default function PayoutQueue({ ext: payouts = [], onApprove }) {
  const pendingTotal = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + parseAmount(p.amount), 0)

  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-medium text-lb-ink">Payout queue</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">Review all</button>
      </div>

      {payouts.length === 0 ? (
        <p className="text-[12px] text-lb-muted text-center py-4">No payouts in queue</p>
      ) : (
        <>
          <div className="divide-y divide-lb-border">
            {payouts.map((p) => {
              const cfg = payoutStatus[p.status] || payoutStatus.rejected // ✅ FIX: fallback
              return (
                <div key={p.id} className="flex items-center gap-2.5 py-2">
                  <div className="w-[26px] h-[26px] rounded-full bg-[#E1F5EE] flex items-center justify-center text-[9px] font-medium text-[#0F6E56] shrink-0">
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-lb-ink truncate">{p.name}</p>
                    <p className="text-[10px] text-lb-muted mt-0.5">{p.period} · {p.sessions} sessions</p>
                  </div>
                  <span className="text-[12px] font-medium text-lb-ink shrink-0">{p.amount}</span>
                  <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  {p.status === 'pending' && onApprove && (
                    <button
                      onClick={() => onApprove(p.id)}
                      className="text-[10px] px-2 py-1 rounded bg-[#E1F5EE] text-[#0F6E56] font-medium hover:bg-[#c8ede2] transition-colors shrink-0"
                    >
                      Approve
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-lb-border">
            <span className="text-[11px] text-lb-muted">Pending total</span>
            <span className="text-[15px] font-medium text-[#26215C]">${pendingTotal.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  )
}