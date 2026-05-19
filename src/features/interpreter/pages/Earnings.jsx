import { useState } from 'react'
import EarningsChart from '../components/dashboard/EarningsChart'

const transactions = [
  { id: 1, client: 'John Doe',     amount: 45.00, date: 'May 15, 2026', status: 'completed', type: 'Video call', avatar: 'JD' },
  { id: 2, client: 'Sarah Smith',  amount: 32.50, date: 'May 14, 2026', status: 'completed', type: 'Audio call', avatar: 'SS' },
  { id: 3, client: 'Ali Khan',     amount: 67.00, date: 'May 14, 2026', status: 'completed', type: 'Video call', avatar: 'AK' },
  { id: 4, client: 'Maria Garcia', amount: 28.00, date: 'May 13, 2026', status: 'pending',   type: 'Audio call', avatar: 'MG' },
  { id: 5, client: 'David Lee',    amount: 55.00, date: 'May 12, 2026', status: 'completed', type: 'Video call', avatar: 'DL' },
]

const totalEarnings = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0)

export default function Earnings() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-lg font-medium text-lb-ink">Earnings</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-lb-muted border border-lb-border rounded-lg bg-white hover:bg-lb-surface transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'Total earnings', value: `$${totalEarnings.toFixed(2)}`, accent: true },
          { label: 'Growth',         value: '+18.5%', accent: true },
          { label: 'Sessions',       value: '23',     accent: false },
          { label: 'Pending',        value: '$28.00', accent: false },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg px-4 py-3.5 ${s.accent ? 'bg-[#EEEDFE]' : 'bg-lb-surface'}`}>
            <p className={`text-[11px] mb-1.5 ${s.accent ? 'text-[#534AB7]' : 'text-lb-muted'}`}>{s.label}</p>
            <p className={`text-[21px] font-medium leading-none ${s.accent ? 'text-[#26215C]' : 'text-lb-ink'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <EarningsChart />

      {/* Transactions */}
      <div className="lb-card">
        <h3 className="text-[14px] font-medium text-lb-ink mb-3">Recent transactions</h3>
        <div className="divide-y divide-lb-border">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="w-9 h-9 rounded-full bg-lb-surface flex items-center justify-center text-[11px] font-medium text-lb-muted shrink-0">
                {t.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-lb-ink truncate">{t.client}</p>
                <p className="text-[11px] text-lb-muted">{t.type} · {t.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-medium text-lb-ink">${t.amount.toFixed(2)}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  t.status === 'completed' ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-[#FAEEDA] text-[#854F0B]'
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
