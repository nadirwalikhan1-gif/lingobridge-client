import { DollarSign, Banknote, ArrowUpRight, Clock } from 'lucide-react'

const payouts = [
  { id: 1, amount: 450.00, method: 'Bank Transfer', date: 'May 1, 2026', status: 'completed', account: '**** 4242' },
  { id: 2, amount: 380.50, method: 'PayPal', date: 'Apr 15, 2026', status: 'completed', account: 'nadir@email.com' },
  { id: 3, amount: 520.00, method: 'Bank Transfer', date: 'Apr 1, 2026', status: 'completed', account: '**** 4242' },
]

export default function Payouts() {
  const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payouts</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your payment methods and withdrawals</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-violet-200 mb-1">Available Balance</p>
            <p className="text-3xl font-bold">$284.50</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-violet-700 text-sm font-medium rounded-xl hover:bg-violet-50 transition-colors">
            <Banknote className="w-4 h-4" />
            Withdraw
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/30 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
            View History
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 mb-1">Total Paid Out</p>
          <p className="text-xl font-bold text-slate-900">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-slate-900">$28.00</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <p className="text-xs text-slate-500 mb-1">Next Payout</p>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <p className="text-xl font-bold text-slate-900">May 30</p>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Payout History</h2>
        <div className="space-y-3">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.method}</p>
                  <p className="text-xs text-slate-500">{p.account} • {p.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">${p.amount.toFixed(2)}</p>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
