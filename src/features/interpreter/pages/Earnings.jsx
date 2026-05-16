import { useState } from 'react'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'
import EarningsChart from '../components/dashboard/EarningsChart'

const transactions = [
  { id: 1, client: 'John Doe',     amount: 45.00, date: 'May 15, 2026', status: 'completed', type: 'Video Call' },
  { id: 2, client: 'Sarah Smith',  amount: 32.50, date: 'May 14, 2026', status: 'completed', type: 'Audio Call' },
  { id: 3, client: 'Ali Khan',     amount: 67.00, date: 'May 14, 2026', status: 'completed', type: 'Video Call' },
  { id: 4, client: 'Maria Garcia', amount: 28.00, date: 'May 13, 2026', status: 'pending',   type: 'Audio Call' },
  { id: 5, client: 'David Lee',    amount: 55.00, date: 'May 12, 2026', status: 'completed', type: 'Video Call' },
]

const statCards = [
  { label: 'Total Earnings', value: null,    icon: DollarSign, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Growth',         value: '+18.5%', icon: TrendingUp,  iconBg: 'bg-interpreter-accent/10', iconColor: 'text-interpreter-accent' },
  { label: 'Sessions',       value: '23',     icon: Calendar,    iconBg: 'bg-slate-100',  iconColor: 'text-slate-600' },
  { label: 'Pending',        value: '$28.00', icon: DollarSign,  iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
]

export default function Earnings() {
  const totalEarnings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Earnings</h1>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className="text-xl font-bold text-slate-800">
                  {s.label === 'Total Earnings' ? `$${totalEarnings.toFixed(2)}` : s.value}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <EarningsChart />

      {/* Transactions */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                t.status === 'completed' ? 'bg-emerald-50' : 'bg-amber-50'
              }`}>
                <span className={`text-xs font-bold ${
                  t.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {t.client[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{t.client}</p>
                <p className="text-xs text-slate-500">{t.type} · {t.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-slate-800">${t.amount.toFixed(2)}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  t.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}