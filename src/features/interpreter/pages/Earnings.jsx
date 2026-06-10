import { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { getSocket } from '../../lib/socket'
import EarningsChart from '../components/dashboard/EarningsChart'

// Interpreter-safe constants (never expose client rates here)
const INTERPRETER_EARN_RATES = {
  audio: 0.45,
  video: 0.50,
}
const INTERPRETER_HOLD_EARN_RATE = 0.10
const MIN_PAYOUT = 50.00

const STATUS_STYLE = {
  completed: { bg: '#EAF3DE', text: '#3B6D11' },
  pending:   { bg: '#FAEEDA', text: '#854F0B' },
  failed:    { bg: '#FCEBEB', text: '#A32D2D' },
}

function fmt(n) {
  if (n == null) return '—'
  return `$${Number(n).toFixed(2)}`
}

function TransactionSkeleton() {
  return (
    <div className="divide-y divide-lb-border animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5">
          <div className="w-9 h-9 rounded-full bg-lb-border shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-lb-border rounded w-32" />
            <div className="h-2.5 bg-lb-border rounded w-48" />
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

export default function Earnings() {
  const { user } = useAuth()

  const [balance,        setBalance]        = useState(null)
  const [totalEarnings,  setTotalEarnings]  = useState(null)
  const [pendingAmount,  setPendingAmount]  = useState(null)
  const [sessionCount,   setSessionCount]   = useState(null)
  const [transactions,   setTransactions]   = useState([])
  const [txLoading,      setTxLoading]      = useState(true)
  const [requestAmount,  setRequestAmount]  = useState('')
  const [payoutStatus,   setPayoutStatus]   = useState(null)
  const [payoutHistory,  setPayoutHistory]  = useState([])  // eslint-disable-line no-unused-vars

  const canRequest      = balance != null && balance >= MIN_PAYOUT
  const requestedAmount = parseFloat(requestAmount)
  const validRequest    = !isNaN(requestedAmount) && requestedAmount >= MIN_PAYOUT && requestedAmount <= (balance ?? 0)

  // ── Socket: balance, payout, earnings summary ───────────────────────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user?.id) return

    socket.emit('get-balance',          { userId: user.id, vaultType: 'interpreter' })
    socket.emit('get-earnings-summary', { userId: user.id })
    socket.emit('get-transactions',     { userId: user.id, role: 'interpreter', limit: 20 })

    const onBalance = (data) => {
      if (data.userId !== user.id && data.userId) return
      setBalance(data.balance ?? 0)
      // Some backends include summary fields on the balance event
      if (data.totalEarnings != null)  setTotalEarnings(data.totalEarnings)
      if (data.pendingAmount  != null)  setPendingAmount(data.pendingAmount)
      if (data.sessionCount   != null)  setSessionCount(data.sessionCount)
    }

    const onEarningsSummary = (data) => {
      if (data.userId !== user.id && data.userId) return
      if (data.totalEarnings != null) setTotalEarnings(data.totalEarnings)
      if (data.pendingAmount  != null) setPendingAmount(data.pendingAmount)
      if (data.sessionCount   != null) setSessionCount(data.sessionCount)
    }

    const onTransactions = (data) => {
      const list = Array.isArray(data) ? data : data?.transactions ?? []
      setTransactions(list)
      setTxLoading(false)
    }

    const onPayoutResponse = (data) => {
      setPayoutStatus({
        ok: data.ok,
        message: data.ok
          ? `Payout request #${data.request?.id ?? '—'} submitted for ${fmt(data.request?.amount)}`
          : (data.reason ?? 'Payout request failed.'),
      })
      if (data.ok) {
        setRequestAmount('')
        // Refresh balance after successful payout request
        socket.emit('get-balance', { userId: user.id, vaultType: 'interpreter' })
      }
    }

    socket.on('balance-update',    onBalance)
    socket.on('earnings-summary',  onEarningsSummary)
    socket.on('transactions',      onTransactions)
    socket.on('payout-response',   onPayoutResponse)

    return () => {
      socket.off('balance-update',   onBalance)
      socket.off('earnings-summary', onEarningsSummary)
      socket.off('transactions',     onTransactions)
      socket.off('payout-response',  onPayoutResponse)
    }
  }, [user?.id])

  const handlePayoutRequest = () => {
    if (!validRequest) return
    const socket = getSocket()
    socket?.emit('request-payout', { interpreterId: user.id, amount: requestedAmount })
    setPayoutStatus(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-lg font-medium text-lb-ink">Earnings</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-lb-muted border border-lb-border rounded-lg bg-white hover:bg-lb-surface transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export
        </button>
      </div>

      {/* Rate cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-lg px-4 py-3 bg-[#EEEDFE]">
          <p className="text-[11px] text-[#534AB7] mb-1">Audio rate</p>
          <p className="text-[21px] font-medium leading-none text-[#26215C]">${INTERPRETER_EARN_RATES.audio}<span className="text-[13px] font-normal">/min</span></p>
        </div>
        <div className="rounded-lg px-4 py-3 bg-[#E1F5EE]">
          <p className="text-[11px] text-[#0F6E56] mb-1">Video rate</p>
          <p className="text-[21px] font-medium leading-none text-[#0F6E56]">${INTERPRETER_EARN_RATES.video}<span className="text-[13px] font-normal">/min</span></p>
        </div>
        <div className="rounded-lg px-4 py-3 bg-[#FAEEDA]">
          <p className="text-[11px] text-[#854F0B] mb-1">Hold pay</p>
          <p className="text-[21px] font-medium leading-none text-[#854F0B]">${INTERPRETER_HOLD_EARN_RATE}<span className="text-[13px] font-normal">/min</span></p>
          <p className="text-[10px] text-[#BA7517] mt-1">Paid during any hold time</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: 'Vault balance',  value: fmt(balance),       accent: true  },
          { label: 'Total earnings', value: fmt(totalEarnings), accent: true  },
          { label: 'Sessions',       value: sessionCount != null ? String(sessionCount) : '—', accent: false },
          { label: 'Pending',        value: fmt(pendingAmount), accent: false },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg px-4 py-3.5 ${s.accent ? 'bg-[#EEEDFE]' : 'bg-lb-surface'}`}>
            <p className={`text-[11px] mb-1.5 ${s.accent ? 'text-[#534AB7]' : 'text-lb-muted'}`}>{s.label}</p>
            <p className={`text-[21px] font-medium leading-none ${s.accent ? 'text-[#26215C]' : 'text-lb-ink'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Payout request */}
      <div className="lb-card">
        <h3 className="text-[14px] font-medium text-lb-ink mb-3">Payout</h3>
        {balance === null ? (
          <div className="h-16 bg-lb-border rounded-lg animate-pulse" />
        ) : canRequest ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] text-lb-muted block mb-1">Amount (min ${MIN_PAYOUT})</label>
                <input
                  type="number"
                  min={MIN_PAYOUT}
                  max={balance}
                  step="0.01"
                  value={requestAmount}
                  onChange={e => setRequestAmount(e.target.value)}
                  placeholder={`$${MIN_PAYOUT} minimum`}
                  className="w-full px-3 py-2 rounded-lg border border-lb-border bg-white text-[13px] text-lb-ink focus:outline-none focus:border-[#7F77DD]"
                />
              </div>
              <button
                disabled={!validRequest}
                onClick={handlePayoutRequest}
                className="self-end px-4 py-2 rounded-lg bg-[#7F77DD] text-white text-[13px] font-medium hover:bg-[#534AB7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Request payout
              </button>
            </div>
            <p className="text-[11px] text-lb-muted">Available: {fmt(balance)} · Platform pays via bank transfer / Wise within 3 business days</p>
            {payoutStatus && (
              <div className={`text-[12px] px-3 py-2 rounded-lg ${payoutStatus.ok ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-[#FCEBEB] text-[#E24B4A]'}`}>
                {payoutStatus.message}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lb-surface flex items-center justify-center">
              <svg className="w-5 h-5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] text-lb-ink font-medium">Minimum payout: ${MIN_PAYOUT}</p>
              <p className="text-[11px] text-lb-muted">Current balance: {fmt(balance)}. Keep interpreting to reach the threshold.</p>
            </div>
          </div>
        )}
      </div>

      <EarningsChart />

      {/* Transactions */}
      <div className="lb-card">
        <h3 className="text-[14px] font-medium text-lb-ink mb-3">Recent transactions</h3>
        {txLoading ? (
          <TransactionSkeleton />
        ) : transactions.length === 0 ? (
          <p className="text-[13px] text-lb-muted text-center py-6">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-lb-border">
            {transactions.map((t) => {
              const style = STATUS_STYLE[t.status] ?? STATUS_STYLE.pending
              const initials = (t.clientName ?? t.client ?? '?')
                .split(' ')
                .map(w => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
              return (
                <div key={t.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-lb-surface flex items-center justify-center text-[11px] font-medium text-lb-muted shrink-0">
                    {t.avatar ?? initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-lb-ink truncate">{t.clientName ?? t.client ?? 'Client'}</p>
                    <p className="text-[11px] text-lb-muted">
                      {t.type ?? t.sessionType ?? 'Session'}{t.duration ? ` · ${t.duration}` : ''} · {t.date ?? t.createdAt ?? ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-medium text-lb-ink">{fmt(t.amount)}</p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: style.bg, color: style.text }}>
                      {t.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}