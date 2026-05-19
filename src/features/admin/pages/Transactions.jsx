// Transactions.jsx — Admin financial oversight
// Matches interpreter Earnings page structure — same stat strip, same list rows

import { useState } from 'react'

const TRANSACTIONS = [
  { id: 1, ref: 'TXN-12458', client: 'John Doe',     clientInit: 'JD', interpreter: 'Maria G.',  interpInit: 'MG', type: 'video', amount: 32.50, platform: 3.25, net: 29.25, status: 'completed', date: 'Today, 10:30 AM',    category: 'Medical' },
  { id: 2, ref: 'TXN-12457', client: 'Clara Reyes',  clientInit: 'CR', interpreter: 'Chen W.',   interpInit: 'CW', type: 'video', amount: 90.00, platform: 9.00, net: 81.00, status: 'completed', date: 'Today, 09:00 AM',    category: 'Business' },
  { id: 3, ref: 'TXN-12456', client: 'Ali Khan',     clientInit: 'AK', interpreter: 'Raza M.',   interpInit: 'RM', type: 'audio', amount: 18.00, platform: 1.80, net: 16.20, status: 'completed', date: 'Yesterday, 4:30 PM', category: 'Legal' },
  { id: 4, ref: 'TXN-12455', client: 'Tom Hughes',   clientInit: 'TH', interpreter: 'Aisha K.',  interpInit: 'AK', type: 'video', amount: 45.00, platform: 4.50, net: 40.50, status: 'refunded',  date: 'Yesterday, 2:00 PM', category: 'Medical' },
  { id: 5, ref: 'TXN-12454', client: 'Sara Moni',    clientInit: 'SM', interpreter: 'Laila S.',  interpInit: 'LS', type: 'audio', amount: 24.00, platform: 2.40, net: 21.60, status: 'completed', date: 'May 15, 3:00 PM',    category: 'Legal' },
  { id: 6, ref: 'TXN-12453', client: 'Emma Ross',    clientInit: 'ER', interpreter: 'Maria G.',  interpInit: 'MG', type: 'video', amount: 28.00, platform: 2.80, net: 25.20, status: 'pending',   date: 'May 15, 11:00 AM',   category: 'Medical' },
  { id: 7, ref: 'TXN-12452', client: 'David Lee',    clientInit: 'DL', interpreter: 'Chen W.',   interpInit: 'CW', type: 'video', amount: 55.00, platform: 5.50, net: 49.50, status: 'completed', date: 'May 14, 9:00 AM',    category: 'Business' },
]

const STATUS_CFG = {
  completed: { cls: 'bg-[#E1F5EE] text-[#0F6E56]',  label: 'Completed' },
  pending:   { cls: 'bg-[#FFF8E6] text-[#BA7517]',  label: 'Pending'   },
  refunded:  { cls: 'bg-[#EEEDFE] text-[#534AB7]',  label: 'Refunded'  },
  failed:    { cls: 'bg-[#FCEBEB] text-[#A32D2D]',  label: 'Failed'    },
}

const FILTERS = ['All', 'Completed', 'Pending', 'Refunded']

function VideoIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    </svg>
  )
}
function AudioIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

export default function Transactions() {
  const [filter, setFilter] = useState('All')

  const filtered = TRANSACTIONS.filter(t =>
    filter === 'All' || t.status === filter.toLowerCase()
  )

  const totalRevenue   = TRANSACTIONS.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const platformCut    = TRANSACTIONS.filter(t => t.status === 'completed').reduce((s, t) => s + t.platform, 0)
  const pendingAmt     = TRANSACTIONS.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)
  const refundedAmt    = TRANSACTIONS.filter(t => t.status === 'refunded').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Platform operations</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Transactions</h1>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-lb-muted border border-lb-border rounded-lg bg-white hover:bg-lb-surface transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: 'Gross revenue',   value: `$${totalRevenue.toFixed(2)}`,  delta: '+15.3% this week', accent: true },
          { label: 'Platform revenue', value: `$${platformCut.toFixed(2)}`,  delta: '10% commission',   accent: true },
          { label: 'Pending payout',  value: `$${pendingAmt.toFixed(2)}`,    delta: 'to process',       accent: false },
          { label: 'Refunded',        value: `$${refundedAmt.toFixed(2)}`,   delta: 'this week',        accent: false },
        ].map(c => (
          <div key={c.label} className={`rounded-lg px-4 py-3.5 ${c.accent ? 'bg-[#EEEDFE]' : 'bg-lb-surface'}`}>
            <p className={`text-[11px] mb-1.5 ${c.accent ? 'text-[#534AB7]' : 'text-lb-muted'}`}>{c.label}</p>
            <p className={`text-[22px] font-medium leading-none ${c.accent ? 'text-[#26215C]' : 'text-lb-ink'}`}>{c.value}</p>
            <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {c.delta}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="lb-card">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1.5 text-[11px] font-medium rounded border transition-colors ${
                  filter === f
                    ? 'bg-[#7F77DD] text-white border-[#7F77DD]'
                    : 'bg-white text-lb-muted border-lb-border hover:bg-lb-surface'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-lb-border">
          {filtered.map(t => {
            const sc = STATUS_CFG[t.status]
            return (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                {/* Pair avatars */}
                <div className="flex -space-x-1.5 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-lb-surface flex items-center justify-center text-[9px] font-medium text-lb-muted border-2 border-white z-10">
                    {t.clientInit}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[9px] font-medium text-[#534AB7] border-2 border-white">
                    {t.interpInit}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-lb-subtle">{t.ref}</span>
                    <span className="text-lb-muted">{t.type === 'video' ? <VideoIcon /> : <AudioIcon />}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">{t.category}</span>
                  </div>
                  <p className="text-[11px] text-lb-muted mt-0.5">{t.client} ↔ {t.interpreter} · {t.date}</p>
                </div>

                {/* Breakdown */}
                <div className="hidden md:flex items-center gap-4 text-right shrink-0">
                  <div>
                    <p className="text-[11px] text-lb-muted">Platform</p>
                    <p className="text-[12px] font-medium text-lb-ink">+${t.platform.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-lb-muted">Interpreter</p>
                    <p className="text-[12px] font-medium text-lb-ink">${t.net.toFixed(2)}</p>
                  </div>
                </div>

                {/* Total + status */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[13px] font-medium text-lb-ink">${t.amount.toFixed(2)}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sc.cls}`}>{sc.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}