import { DollarSign, Banknote, ArrowUpRight, Clock } from 'lucide-react'

const payouts = [
  { id: 1, amount: 450.00, method: 'Bank Transfer', date: 'May 1, 2026',  status: 'completed', account: '**** 4242' },
  { id: 2, amount: 380.50, method: 'PayPal',         date: 'Apr 15, 2026', status: 'completed', account: 'nadir@email.com' },
  { id: 3, amount: 520.00, method: 'Bank Transfer', date: 'Apr 1, 2026',  status: 'completed', account: '**** 4242' },
]

export default function Payouts() {
  const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-lg font-bold text-slate-800">Payouts</h1>

      {/* Balance Card — uses interpreter-sidebar bg token to match sidebar theme */}
      <div className="bg-interpreter-sidebar p-5 rounded-xl text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/80">Available Balance</span>
            </div>
            <p className="text-3xl font-bold">$284.50</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button className="flex items-center gap-2 px-3 py-2 bg-white text-interpreter-sidebar text-xs font-medium rounded-lg hover:bg-white/90 transition-colors">
            <Banknote className="w-4 h-4" />
            Withdraw
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
            View History
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Total Paid Out</p>
          <p className="text-xl font-bold text-slate-800">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-slate-800">$28.00</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Next Payout</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <p className="text-xl font-bold text-slate-800">May 30</p>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Payout History</h3>
        <div className="space-y-2">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-interpreter-accent/10 flex items-center justify-center flex-shrink-0">
                <Banknote className="w-4 h-4 text-interpreter-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{p.method}</p>
                <p className="text-xs text-slate-400">{p.account} · {p.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-slate-800">${p.amount.toFixed(2)}</p>
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}