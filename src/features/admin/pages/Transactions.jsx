// src/features/admin/pages/Transactions.jsx
// Wired to real API. Uses React Query with 30s staleTime.

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import ErrorState from '../../components/ui/ErrorState'

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

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: () => api.get('/v1/admin/transactions'),
    staleTime: 30000,
  })

  const filtered = useMemo(() => transactions?.filter(t =>
    filter === 'All' || t.status === filter.toLowerCase()
  ) ?? [], [transactions, filter])

  const totalRevenue = useMemo(() =>
    transactions?.filter(t => t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0) ?? 0,
  [transactions])

  const platformCut = useMemo(() =>
    transactions?.filter(t => t.status === 'completed').reduce((s, t) => s + (t.platform || 0), 0) ?? 0,
  [transactions])

  const pendingAmt = useMemo(() =>
    transactions?.filter(t => t.status === 'pending').reduce((s, t) => s + (t.amount || 0), 0) ?? 0,
  [transactions])

  const refundedAmt = useMemo(() =>
    transactions?.filter(t => t.status === 'refunded').reduce((s, t) => s + (t.amount || 0), 0) ?? 0,
  [transactions])

  const handleExport = () => {
    window.open(`${import.meta.env.VITE_API_URL}/v1/admin/transactions/export`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-lb-border rounded w-40 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-lb-border rounded-lg animate-pulse" />)}
        </div>
        <div className="h-96 bg-lb-border rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Platform operations</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Transactions</h1>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-lb-muted border border-lb-border rounded-lg bg-white hover:bg-lb-surface transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: 'Gross revenue',    value: `$${totalRevenue.toFixed(2)}`,  delta: '+15.3% this week', accent: true },
          { label: 'Platform revenue', value: `$${platformCut.toFixed(2)}`,  delta: '10% commission',   accent: true },
          { label: 'Pending payout',   value: `$${pendingAmt.toFixed(2)}`,    delta: 'to process',       accent: false },
          { label: 'Refunded',         value: `$${refundedAmt.toFixed(2)}`,   delta: 'this week',        accent: false },
        ].map(c => (
          <div key={c.label} className={`rounded-lg px-4 py-3.5 ${c.accent ? 'bg-[#EEEDFE]' : 'bg-lb-surface'}`}>
            <p className={`text-[11px] mb-1.5 ${c.accent ? 'text-[#534AB7]' : 'text-lb-muted'}`}>{c.label}</p>
            <p className={`text-[22px] font-medium leading-none ${c.accent ? 'text-[#26215C]' : 'text-lb-ink'}`}>{c.value}</p>
            <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {c.delta}</p>
          </div>
        ))}
      </div>

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

        {transactions?.length === 0 ? (
          <p className="text-[12px] text-lb-muted text-center py-8">No transactions yet</p>
        ) : (
          <div className="divide-y divide-lb-border">
            {filtered.map(t => {
              const sc = STATUS_CFG[t.status]
              return (
                <div key={t.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex -space-x-1.5 shrink-0">
                    <div className="w-7 h-7 rounded-full bg-lb-surface flex items-center justify-center text-[9px] font-medium text-lb-muted border-2 border-white z-10">
                      {t.clientInit}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[9px] font-medium text-[#534AB7] border-2 border-white">
                      {t.interpInit}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-lb-subtle">{t.ref}</span>
                      <span className="text-lb-muted">{t.type === 'video' ? <VideoIcon /> : <AudioIcon />}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">{t.category}</span>
                    </div>
                    <p className="text-[11px] text-lb-muted mt-0.5">{t.client} ↔ {t.interpreter} · {t.date}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-right shrink-0">
                    <div>
                      <p className="text-[11px] text-lb-muted">Platform</p>
                      <p className="text-[12px] font-medium text-lb-ink">+${(t.platform || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-lb-muted">Interpreter</p>
                      <p className="text-[12px] font-medium text-lb-ink">${(t.net || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[13px] font-medium text-lb-ink">${(t.amount || 0).toFixed(2)}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sc.cls}`}>{sc.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && transactions?.length > 0 && (
          <p className="text-[12px] text-lb-muted text-center py-8">No transactions match this filter</p>
        )}
      </div>
    </div>
  )
}