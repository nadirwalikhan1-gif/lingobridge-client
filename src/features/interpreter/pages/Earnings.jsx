import { useState } from 'react'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'
import EarningsChart from '../components/dashboard/EarningsChart'

const transactions = [
  { id: 1, client: 'John Doe', amount: 45.00, date: 'May 15, 2026', status: 'completed', type: 'Video Call' },
  { id: 2, client: 'Sarah Smith', amount: 32.50, date: 'May 14, 2026', status: 'completed', type: 'Audio Call' },
  { id: 3, client: 'Ali Khan', amount: 67.00, date: 'May 14, 2026', status: 'completed', type: 'Video Call' },
  { id: 4, client: 'Maria Garcia', amount: 28.00, date: 'May 13, 2026', status: 'pending', type: 'Audio Call' },
  { id: 5, client: 'David Lee', amount: 55.00, date: 'May 12, 2026', status: 'completed', type: 'Video Call' },
]

export default function Earnings() {
  const [filter, setFilter] = useState('This Week')

  const totalEarnings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
          <p className="text-sm text-slate-500 mt-1">View your revenue and payment history</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-emerald-600 font-medium">Total Earnings</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-xs text-violet-600 font-medium">Growth</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">+18.5%</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Sessions</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">23</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs text-amber-600 font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">$28.00</p>
        </div>
      </div>

      {/* Chart */}
      <EarningsChart />

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  t.status === 'completed' ? 'bg-emerald-50' : 'bg-amber-50'
                }`}>
                  <span className={`text-sm font-bold ${
                    t.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {t.client[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{t.client}</p>
                  <p className="text-xs text-slate-500">{t.type} • {t.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">${t.amount.toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  t.status === 'completed' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
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
