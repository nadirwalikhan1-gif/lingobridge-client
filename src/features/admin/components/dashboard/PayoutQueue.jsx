// PayoutQueue.jsx — Admin payout review panel
// Mirrors interpreter WalletSummary card — same compact row anatomy

const MOCK_PAYOUTS = [
  {
    id: 1,
    initials: 'MG',
    name: 'Maria Gonzalez',
    period: 'Weekly',
    sessions: 14,
    amount: '$342.00',
    status: 'pending',
  },
  {
    id: 2,
    initials: 'FA',
    name: 'Fatima Al-Said',
    period: 'Weekly',
    sessions: 9,
    amount: '$198.50',
    status: 'approved',
  },
  {
    id: 3,
    initials: 'PT',
    name: 'Pavel Tran',
    period: 'Weekly',
    sessions: 6,
    amount: '$115.00',
    status: 'pending',
  },
]

const payoutStatus = {
  pending: { bg: 'bg-[#FAEEDA]', text: 'text-[#BA7517]', label: 'Pending' },
  approved: { bg: 'bg-[#E1F5EE]', text: 'text-[#0F6E56]', label: 'Approved' },
}

export function PayoutQueue({ payouts: ext }) {
  const payouts = ext ?? MOCK_PAYOUTS

  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-medium text-lb-ink">Payout queue</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">Review all</button>
      </div>

      <div className="divide-y divide-lb-border">
        {payouts.map((p) => {
          const cfg = payoutStatus[p.status]
          return (
            <div key={p.id} className="flex items-center gap-2.5 py-2">
              {/* Avatar */}
              <div className="w-[26px] h-[26px] rounded-full bg-[#E1F5EE] flex items-center justify-center text-[9px] font-medium text-[#0F6E56] shrink-0">
                {p.initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-lb-ink truncate">{p.name}</p>
                <p className="text-[10px] text-lb-muted mt-0.5">{p.period} · {p.sessions} sessions</p>
              </div>

              {/* Amount */}
              <span className="text-[12px] font-medium text-lb-ink shrink-0">{p.amount}</span>

              {/* Status */}
              <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Total pending */}
      <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-lb-border">
        <span className="text-[11px] text-lb-muted">Pending total</span>
        <span className="text-[15px] font-medium text-[#26215C]">$457.00</span>
      </div>
    </div>
  )
}

export default PayoutQueue