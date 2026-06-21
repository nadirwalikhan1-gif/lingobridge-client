// Earnings.jsx — full production page
// Hero metrics, chart, breakdowns by language/type/client, filterable transactions table

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import { FALLBACK_TIMEOUT_MS } from '../../../hooks/useFallbackTimeout'
import { INTERPRETER_EARN_RATES } from '../../../config/constants'
import EarningsChart from '../components/dashboard/EarningsChart'

// ── Constants ────────────────────────────────────────────────────────────────

const MIN_PAYOUT = 50.00

const HOLD_RATE = 0.10

const STATUS_STYLE = {
  completed: { bg: '#EAF3DE', text: '#3B6D11' },
  paid:      { bg: '#EAF3DE', text: '#3B6D11' },
  pending:   { bg: '#FAEEDA', text: '#854F0B' },
  processing:{ bg: '#FAEEDA', text: '#854F0B' },
  failed:    { bg: '#FCEBEB', text: '#A32D2D' },
}

const TX_FILTERS = ['All', 'Completed', 'Pending', 'Failed']

const PERIOD_LABELS = {
  today:  'Today',
  week:   'This week',
  month:  'This month',
  all:    'All time',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n == null) return '—'
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) + ' · ' + new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`rounded-xl px-5 py-4 ${i === 0 ? 'lg:col-span-2 bg-[#1a1635]/10 h-28' : 'bg-lb-surface h-24'}`} />
      ))}
    </div>
  )
}

function TransactionSkeleton() {
  return (
    <div className="divide-y divide-lb-border animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="w-9 h-9 rounded-full bg-lb-border shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-lb-border rounded w-36" />
            <div className="h-2.5 bg-lb-border rounded w-52" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-3 bg-lb-border rounded w-16" />
            <div className="h-2.5 bg-lb-border rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Hero metrics ──────────────────────────────────────────────────────────────

function HeroMetrics({ summary }) {
  const today    = summary?.today    ?? null
  const week     = summary?.week     ?? null
  const month    = summary?.month    ?? null
  const lifetime = summary?.lifetime ?? null
  const growth   = summary?.monthGrowth ?? null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Primary dark card */}
      <div className="lg:col-span-2 rounded-xl px-6 py-5 bg-[#1a1635] flex flex-col justify-between min-h-[110px]">
        <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest">This month</p>
        <div>
          <p className="text-[44px] font-semibold leading-none text-white tracking-tight mt-2">
            {month != null ? fmt(month) : <span className="text-white/20">—</span>}
          </p>
          {growth != null && (
            <p className="text-[12px] mt-2 text-[#4ade80] flex items-center gap-1">
              <span className="text-[10px]">↑</span> {growth}% vs last month
            </p>
          )}
        </div>
      </div>

      {/* Today */}
      <div className="rounded-xl px-4 py-4 bg-[#EEEDFE] flex flex-col justify-between min-h-[110px]">
        <p className="text-[11px] text-[#534AB7] uppercase tracking-widest font-medium">Today</p>
        <div>
          <p className="text-[26px] font-semibold leading-none text-[#26215C] mt-2">
            {today != null ? fmt(today) : <span className="text-[#534AB7]/30">—</span>}
          </p>
        </div>
      </div>

      {/* This week + Lifetime stacked */}
      <div className="flex flex-col gap-3">
        <div className="rounded-xl px-4 py-3 bg-lb-surface border border-lb-border flex-1">
          <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-1">This week</p>
          <p className="text-[20px] font-semibold text-lb-ink leading-none">
            {week != null ? fmt(week) : '—'}
          </p>
        </div>
        <div className="rounded-xl px-4 py-3 bg-lb-surface border border-lb-border flex-1">
          <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium mb-1">All time</p>
          <p className="text-[20px] font-semibold text-lb-ink leading-none">
            {lifetime != null ? fmt(lifetime) : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Rate cards ────────────────────────────────────────────────────────────────

function RateCards({ rates }) {
  const audioRate = rates?.audio ?? INTERPRETER_EARN_RATES?.audio ?? null
  const videoRate = rates?.video ?? INTERPRETER_EARN_RATES?.video ?? null

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <div className="rounded-xl px-4 py-3 bg-[#EEEDFE]">
        <p className="text-[11px] text-[#534AB7] font-medium mb-1">Audio rate</p>
        <p className="text-[20px] font-semibold leading-none text-[#26215C]">
          {audioRate != null ? `$${audioRate}` : '—'}
          <span className="text-[12px] font-normal text-[#534AB7]">/min</span>
        </p>
      </div>
      <div className="rounded-xl px-4 py-3 bg-[#E1F5EE]">
        <p className="text-[11px] text-[#0F6E56] font-medium mb-1">Video rate</p>
        <p className="text-[20px] font-semibold leading-none text-[#0F6E56]">
          {videoRate != null ? `$${videoRate}` : '—'}
          <span className="text-[12px] font-normal">/min</span>
        </p>
      </div>
      <div className="rounded-xl px-4 py-3 bg-[#FAEEDA]">
        <p className="text-[11px] text-[#854F0B] font-medium mb-1">Hold pay</p>
        <p className="text-[20px] font-semibold leading-none text-[#854F0B]">
          ${HOLD_RATE}<span className="text-[12px] font-normal">/min</span>
        </p>
        <p className="text-[10px] text-[#BA7517] mt-1">Paid during hold time</p>
      </div>
    </div>
  )
}

// ── Breakdown section ─────────────────────────────────────────────────────────

function BreakdownBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] text-lb-ink">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-lb-muted">{pct}%</span>
          <span className="text-[12px] font-medium text-lb-ink">{fmt(value)}</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-lb-surface rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function EarningsBreakdown({ breakdown }) {
  if (!breakdown) {
    return (
      <div className="lb-card">
        <h3 className="text-[13px] font-medium text-lb-ink mb-3">Earnings breakdown</h3>
        <div className="py-6 text-center">
          <p className="text-[12px] text-lb-muted">No breakdown data available yet</p>
        </div>
      </div>
    )
  }

  const byLanguage   = breakdown.byLanguage   ?? []
  const byType       = breakdown.byType       ?? []
  const byClient     = breakdown.byClient     ?? []

  const langTotal    = byLanguage.reduce((s, r) => s + (r.amount ?? 0), 0)
  const typeTotal    = byType.reduce((s, r) => s + (r.amount ?? 0), 0)
  const clientTotal  = byClient.reduce((s, r) => s + (r.amount ?? 0), 0)

  const TYPE_COLORS  = { audio: '#7F77DD', video: '#1D9E75', default: '#BA7517' }
  const LANG_COLORS  = ['#7F77DD', '#1D9E75', '#BA7517', '#E24B4A', '#0EA5E9']
  const CLIENT_COLORS = ['#534AB7', '#0F6E56', '#854F0B', '#A32D2D', '#0369A1']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

      {/* By language */}
      <div className="lb-card">
        <h3 className="text-[13px] font-medium text-lb-ink mb-3">By language</h3>
        {byLanguage.length === 0 ? (
          <p className="text-[12px] text-lb-muted text-center py-4">No data</p>
        ) : (
          <div className="space-y-3">
            {byLanguage.slice(0, 5).map((r, i) => (
              <BreakdownBar
                key={r.language ?? i}
                label={r.language ?? '—'}
                value={r.amount}
                total={langTotal}
                color={LANG_COLORS[i % LANG_COLORS.length]}
              />
            ))}
          </div>
        )}
      </div>

      {/* By session type */}
      <div className="lb-card">
        <h3 className="text-[13px] font-medium text-lb-ink mb-3">By session type</h3>
        {byType.length === 0 ? (
          <p className="text-[12px] text-lb-muted text-center py-4">No data</p>
        ) : (
          <div className="space-y-3">
            {byType.map((r, i) => (
              <BreakdownBar
                key={r.type ?? i}
                label={(r.type ?? 'Unknown').charAt(0).toUpperCase() + (r.type ?? 'unknown').slice(1)}
                value={r.amount}
                total={typeTotal}
                color={TYPE_COLORS[r.type] ?? TYPE_COLORS.default}
              />
            ))}
          </div>
        )}
      </div>

      {/* By client */}
      <div className="lb-card">
        <h3 className="text-[13px] font-medium text-lb-ink mb-3">By client</h3>
        {byClient.length === 0 ? (
          <p className="text-[12px] text-lb-muted text-center py-4">No data</p>
        ) : (
          <div className="space-y-3">
            {byClient.slice(0, 5).map((r, i) => (
              <BreakdownBar
                key={r.client ?? i}
                label={r.client ?? '—'}
                value={r.amount}
                total={clientTotal}
                color={CLIENT_COLORS[i % CLIENT_COLORS.length]}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

// ── Transactions table ────────────────────────────────────────────────────────

function TransactionsTable({ transactions, loading }) {
  const [filter,  setFilter]  = useState('All')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(0)
  const PAGE_SIZE = 10

  const filtered = transactions.filter((t) => {
    const matchFilter = filter === 'All' || (t.status ?? '').toLowerCase() === filter.toLowerCase()
    const matchSearch = !search ||
      (t.clientName ?? t.client ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.language ?? t.fromLang ?? '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const paged    = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const maxPage  = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1)

  const exportCSV = () => {
    const rows = [
      ['Date', 'Client', 'Session Type', 'Duration', 'Amount', 'Status'],
      ...filtered.map((t) => [
        t.date ?? t.createdAt ?? '',
        t.clientName ?? t.client ?? '',
        t.type ?? t.sessionType ?? '',
        t.duration ?? '',
        t.amount ?? '',
        t.status ?? '',
      ]),
    ]
    const csv  = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'earnings-transactions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="lb-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-[13px] font-medium text-lb-ink">Transactions</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 text-[11px] text-lb-muted hover:text-[#534AB7] px-2.5 py-1.5 rounded-lg border border-lb-border hover:border-[#7F77DD] hover:bg-[#EEEDFE] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter + search */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-lb-surface rounded-xl">
          {TX_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0) }}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
                filter === f ? 'bg-white text-lb-ink shadow-sm' : 'text-lb-muted hover:text-lb-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[160px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-lb-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            aria-label="Search client or language"
            placeholder="Search client or language…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-9 pr-3 py-1.5 text-[12px] text-lb-ink bg-white border border-lb-border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7F77DD] placeholder:text-lb-subtle"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TransactionSkeleton />
      ) : paged.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[13px] text-lb-muted">No transactions found</p>
          <p className="text-[11px] text-lb-subtle mt-1">Try a different filter or search term</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-lb-border">
            {paged.map((t, i) => {
              const style    = STATUS_STYLE[t.status?.toLowerCase()] ?? STATUS_STYLE.pending
              const initials = t.avatar ?? getInitials(t.clientName ?? t.client ?? '')
              const date     = t.date ?? t.createdAt ?? null
              const type     = t.type ?? t.sessionType ?? 'Session'
              const duration = t.duration ?? t.expectedDuration ?? null

              return (
                <div key={t.id ?? i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-lb-surface flex items-center justify-center text-[11px] font-medium text-lb-muted shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-lb-ink truncate">
                      {t.clientName ?? t.client ?? 'Client'}
                    </p>
                    <p className="text-[11px] text-lb-muted truncate">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                      {duration ? ` · ${duration}` : ''}
                      {date ? ` · ${fmtDateTime(date)}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-medium text-lb-ink">{fmt(t.amount)}</p>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {(t.status ?? 'pending').charAt(0).toUpperCase() + (t.status ?? 'pending').slice(1)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-lb-border">
              <p className="text-[11px] text-lb-muted">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-[11px] rounded-lg border border-lb-border text-lb-muted hover:bg-lb-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  disabled={page >= maxPage}
                  className="px-3 py-1.5 text-[11px] rounded-lg border border-lb-border text-lb-muted hover:bg-lb-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Payout request card ───────────────────────────────────────────────────────

function PayoutCard({ balance, onRequest }) {
  const [amount,       setAmount]       = useState('')
  const [payoutStatus, setPayoutStatus] = useState(null)
  const { user }                        = useAuth()

  const canRequest    = balance != null && balance >= MIN_PAYOUT
  const parsed        = parseFloat(amount)
  const validRequest  = !isNaN(parsed) && parsed >= MIN_PAYOUT && parsed <= (balance ?? 0)

  const handleRequest = useCallback(() => {
    if (!validRequest) return
    const socket = getSocket()
    socket?.emit('request-payout', { interpreterId: user.id, amount: parsed })
    setPayoutStatus(null)
    onRequest?.()

    const socket2 = getSocket()
    if (!socket2) return
    const onResponse = (data) => {
      setPayoutStatus({
        ok: data.ok,
        message: data.ok
          ? `Payout of ${fmt(data.request?.amount ?? parsed)} submitted — arrives in 3 business days`
          : (data.reason ?? 'Payout request failed. Please try again.'),
      })
      if (data.ok) {
        setAmount('')
        socket2.emit('get-balance', { userId: user.id, vaultType: 'interpreter' })
      }
      socket2.off('payout-response', onResponse)
    }
    socket2.on('payout-response', onResponse)
  }, [validRequest, parsed, user?.id, onRequest])

  return (
    <div className="lb-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-medium text-lb-ink">Request payout</h3>
        {balance != null && (
          <span className="text-[12px] font-semibold text-[#26215C] bg-[#EEEDFE] px-2.5 py-1 rounded-lg">
            {fmt(balance)} available
          </span>
        )}
      </div>

      {balance === null ? (
        <div className="h-14 bg-lb-border rounded-xl animate-pulse" />
      ) : canRequest ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-lb-muted">$</span>
              <input
                type="number"
                aria-label="Payout amount"
                min={MIN_PAYOUT}
                max={balance}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${MIN_PAYOUT} minimum`}
                className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-lb-border bg-white text-[13px] text-lb-ink focus:outline-none focus:ring-1 focus:ring-[#7F77DD]"
              />
            </div>
            <button
              disabled={!validRequest}
              onClick={handleRequest}
              className="px-5 py-2.5 rounded-xl bg-[#7F77DD] text-white text-[13px] font-medium hover:bg-[#534AB7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Request
            </button>
          </div>
          <p className="text-[11px] text-lb-muted">
            Minimum {fmt(MIN_PAYOUT)} · Paid via bank transfer or Wise within 3 business days
          </p>
          {payoutStatus && (
            <div className={`flex items-start gap-2 text-[12px] px-3 py-2.5 rounded-xl ${
              payoutStatus.ok ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-[#FCEBEB] text-[#A32D2D]'
            }`}>
              {payoutStatus.ok
                ? <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                : <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              }
              {payoutStatus.message}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-lb-surface">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] text-lb-ink font-medium">Minimum payout: {fmt(MIN_PAYOUT)}</p>
            <p className="text-[11px] text-lb-muted">
              Current balance: {fmt(balance)}
              {balance != null && balance < MIN_PAYOUT && ` · Need ${fmt(MIN_PAYOUT - balance)} more`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Earnings() {
  const { user } = useAuth()

  const [summary,      setSummary]      = useState(null)
  const [balance,      setBalance]      = useState(null)
  const [breakdown,    setBreakdown]    = useState(null)
  const [transactions, setTransactions] = useState([])
  const [txLoading,    setTxLoading]    = useState(true)
  const [heroLoading,  setHeroLoading]  = useState(true)
  const [rates,        setRates]        = useState(null)

  // ── Socket: all earnings data ──────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user?.id) return

    socket.emit('get-balance',           { userId: user.id, vaultType: 'interpreter' })
    socket.emit('get-earnings-summary',  { userId: user.id })
    socket.emit('get-earnings-breakdown',{ userId: user.id })
    socket.emit('get-transactions',      { userId: user.id, role: 'interpreter', limit: 100 })
    socket.emit('get-interpreter-rates', { userId: user.id })

    const onBalance = (data) => {
      if (data.userId && data.userId !== user.id) return
      setBalance(data.balance ?? null)
      if (data.summary) { setSummary(data.summary); setHeroLoading(false) }
    }

    const onSummary = (data) => {
      if (data.userId && data.userId !== user.id) return
      setSummary(data)
      setHeroLoading(false)
    }

    const onBreakdown = (data) => {
      if (data.userId && data.userId !== user.id) return
      setBreakdown(data)
    }

    const onTransactions = (data) => {
      const list = Array.isArray(data) ? data : (data?.transactions ?? [])
      setTransactions(list)
      setTxLoading(false)
    }

    const onRates = (data) => {
      if (data.userId && data.userId !== user.id) return
      setRates(data.rates ?? data)
    }

    // Fallback timeout so hero doesn't spin forever
    const heroTimer = setTimeout(() => setHeroLoading(false), FALLBACK_TIMEOUT_MS)
    const txTimer   = setTimeout(() => setTxLoading(false), FALLBACK_TIMEOUT_MS)

    socket.on('balance-update',         onBalance)
    socket.on('earnings-summary',       onSummary)
    socket.on('earnings-breakdown',     onBreakdown)
    socket.on('transactions',           onTransactions)
    socket.on('interpreter-rates',      onRates)

    return () => {
      socket.off('balance-update',      onBalance)
      socket.off('earnings-summary',    onSummary)
      socket.off('earnings-breakdown',  onBreakdown)
      socket.off('transactions',        onTransactions)
      socket.off('interpreter-rates',   onRates)
      clearTimeout(heroTimer)
      clearTimeout(txTimer)
    }
  }, [user?.id])

  return (
    <div className="space-y-4 max-w-5xl">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-lb-ink">Earnings</h1>
          <p className="text-[13px] text-lb-muted mt-0.5">Your financial performance and transaction history</p>
        </div>
      </div>

      {/* ── Hero metrics ─────────────────────────────────────────────────────── */}
      {heroLoading ? <HeroSkeleton /> : <HeroMetrics summary={summary} />}

      {/* ── Rate cards ───────────────────────────────────────────────────────── */}
      <RateCards rates={rates} />

      {/* ── Payout card ──────────────────────────────────────────────────────── */}
      <PayoutCard balance={balance} />

      {/* ── Chart ────────────────────────────────────────────────────────────── */}
      <EarningsChart />

      {/* ── Breakdown ────────────────────────────────────────────────────────── */}
      <EarningsBreakdown breakdown={breakdown} />

      {/* ── Transactions ─────────────────────────────────────────────────────── */}
      <TransactionsTable transactions={transactions} loading={txLoading} />

    </div>
  )
}
