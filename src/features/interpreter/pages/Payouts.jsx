// Payouts.jsx — Interpreter Payouts Page
// Fixed: import paths corrected (4 levels up to src/)
// Fixed: withdraw button shows minimum threshold copy
// All data socket-driven, no mock data

import { useState, useEffect } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'

function fmt(n) {
  if (n == null) return '—'
  return `$${Number(n).toFixed(2)}`
}

function fmtDate(raw) {
  if (!raw) return '—'
  try {
    return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return raw
  }
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-lb-border rounded ${className}`} />
}

export default function Payouts() {
  const { user } = useAuth()

  const [balance,     setBalance]     = useState(null)
  const [pending,     setPending]     = useState(null)
  const [nextPayout,  setNextPayout]  = useState(null)
  const [totalPaid,   setTotalPaid]   = useState(null)
  const [payouts,     setPayouts]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [statusMsg,   setStatusMsg]   = useState(null)

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user?.id) return

    socket.emit('get-balance',        { userId: user.id, vaultType: 'interpreter' })
    socket.emit('get-payout-history', { userId: user.id, limit: 20 })

    const onBalance = (data) => {
      if (data.userId !== user.id && data.userId) return
      setBalance(data.balance ?? 0)
      if (data.pending    != null) setPending(data.pending)
      if (data.nextPayout != null) setNextPayout(data.nextPayout)
      if (data.totalPaid  != null) setTotalPaid(data.totalPaid)
    }

    const onPayoutHistory = (data) => {
      const list = Array.isArray(data) ? data : data?.payouts ?? []
      setPayouts(list)
      setLoading(false)
    }

    const onPayoutResponse = (data) => {
      setWithdrawing(false)
      if (data.ok) {
        setStatusMsg({ ok: true, text: `Withdrawal of ${fmt(data.request?.amount)} submitted successfully.` })
        socket.emit('get-balance',        { userId: user.id, vaultType: 'interpreter' })
        socket.emit('get-payout-history', { userId: user.id, limit: 20 })
      } else {
        setStatusMsg({ ok: false, text: data.reason ?? 'Withdrawal request failed.' })
      }
    }

    // Safety timeout — prevent infinite skeleton
    const t = setTimeout(() => setLoading(false), 5000)

    socket.on('balance-update',  onBalance)
    socket.on('payout-history',  onPayoutHistory)
    socket.on('payout-response', onPayoutResponse)

    return () => {
      socket.off('balance-update',  onBalance)
      socket.off('payout-history',  onPayoutHistory)
      socket.off('payout-response', onPayoutResponse)
      clearTimeout(t)
    }
  }, [user?.id])

  const handleWithdraw = () => {
    const socket = getSocket()
    if (!socket || !user?.id || balance == null || balance < 50) return
    setWithdrawing(true)
    setStatusMsg(null)
    socket.emit('request-payout', { interpreterId: user.id, amount: balance })
  }

  const canWithdraw = balance != null && balance >= 50

  return (
    <div className="space-y-3 max-w-2xl">
      <h1 className="text-lg font-medium text-lb-ink pb-1">Payouts</h1>

      {/* Balance card */}
      <div className="lb-card !bg-[#26215C] text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] text-white/60 mb-1">Available balance</p>
            {balance === null
              ? <Skeleton className="h-8 w-28 bg-white/20" />
              : <p className="text-[32px] font-medium leading-none">{fmt(balance)}</p>
            }
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>

        {/* Minimum threshold notice */}
        {balance !== null && !canWithdraw && (
          <p className="text-[11px] text-white/50 mb-3">
            Minimum withdrawal is $50.00 — need {fmt(50 - balance)} more.
          </p>
        )}

        {statusMsg && (
          <div className={`mb-3 text-[12px] px-3 py-2 rounded-lg ${statusMsg.ok ? 'bg-[#EAF3DE] text-[#3B6D11]' : 'bg-[#FCEBEB] text-[#A32D2D]'}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !canWithdraw}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#26215C] text-[12px] font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            {withdrawing ? 'Processing…' : 'Withdraw'}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white/20 text-white text-[12px] font-medium rounded-lg hover:bg-white/30 transition-colors">
            View history
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Total paid out', value: fmt(totalPaid)  },
          { label: 'Pending',        value: fmt(pending)    },
          { label: 'Next payout',    value: nextPayout ? fmtDate(nextPayout) : '—' },
        ].map((s) => (
          <div key={s.label} className="lb-card">
            <p className="text-[11px] text-lb-muted mb-1.5">{s.label}</p>
            {loading && s.value === '—'
              ? <Skeleton className="h-6 w-20" />
              : <p className="text-[20px] font-medium text-lb-ink">{s.value}</p>
            }
          </div>
        ))}
      </div>

      {/* History */}
      <div className="lb-card">
        <h3 className="text-[14px] font-medium text-lb-ink mb-3">Payout history</h3>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-full bg-lb-border shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-lb-border rounded w-24" />
                  <div className="h-2.5 bg-lb-border rounded w-40" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-lb-border rounded w-16" />
                  <div className="h-2.5 bg-lb-border rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-[#EEEDFE] flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-[#534AB7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-[13px] font-medium text-lb-ink">No payouts yet</p>
            <p className="text-[12px] text-lb-muted mt-0.5">Your payout history will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-lb-border">
            {payouts.map((p, i) => (
              <div key={p.id ?? i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="w-9 h-9 rounded-full bg-[#EEEDFE] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#534AB7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-lb-ink">
                    {p.method ?? p.paymentMethod ?? 'Bank transfer'}
                  </p>
                  <p className="text-[11px] text-lb-muted">
                    {p.accountLast4 ? `**** ${p.accountLast4} · ` : ''}
                    {fmtDate(p.date ?? p.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-medium text-lb-ink">{fmt(p.amount)}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    ['completed', 'paid', 'success'].includes((p.status ?? '').toLowerCase())
                      ? 'bg-[#EAF3DE] text-[#3B6D11]'
                      : (p.status ?? '').toLowerCase() === 'pending'
                        ? 'bg-[#FAEEDA] text-[#854F0B]'
                        : 'bg-[#FCEBEB] text-[#A32D2D]'
                  }`}>
                    {p.status ?? 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
