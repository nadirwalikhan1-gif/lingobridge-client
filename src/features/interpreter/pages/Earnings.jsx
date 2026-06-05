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

const transactions = [
  { id: 1, client: 'Abid Khan',     amount: 45.00, date: 'May 15, 2026', status: 'completed', type: 'Video call', duration: '90 min', avatar: 'AK' },
  { id: 2, client: 'Ahmad Zia',    amount: 32.50, date: 'May 14, 2026', status: 'completed', type: 'Audio call', duration: '72 min', avatar: 'AZ' },
  { id: 3, client: 'Rajinder Singh', amount: 67.00, date: 'May 14, 2026', status: 'completed', type: 'Video call', duration: '134 min', avatar: 'RS' },
  { id: 4, client: 'Imran Sandhu', amount: 28.00, date: 'May 13, 2026', status: 'pending',   type: 'Audio call', duration: '62 min', avatar: 'IS' },
  { id: 5, client: 'Amrit Kaur',   amount: 55.00, date: 'May 12, 2026', status: 'completed', type: 'Video call', duration: '110 min', avatar: 'AK' },
]

const totalEarnings = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
const pendingAmount = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)

export default function Earnings() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [requestAmount, setRequestAmount] = useState('')
  const [payoutStatus, setPayoutStatus] = useState(null)
  const [payoutHistory, setPayoutHistory] = useState([])

  const canRequest = balance >= MIN_PAYOUT
  const requestedAmount = parseFloat(requestAmount)
  const validRequest = !isNaN(requestedAmount) && requestedAmount >= MIN_PAYOUT && requestedAmount <= balance

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user?.id) return

    socket.emit('get-balance', { userId: user.id, vaultType: 'interpreter' })

    const onBalance = (data) => {
      if (data.userId === user.id) setBalance(data.balance ?? 0)
    }

    const onPayoutResponse = (data) => {
      setPayoutStatus({
        ok: data.ok,
        message: data.ok
          ? `Payout request #${data.request.id} submitted for $${data.request.amount}`
          : data.reason,
      })
      if (data.ok) setRequestAmount('')
    }

    socket.on('balance-update', onBalance)
    socket.on('payout-response', onPayoutResponse)

    return () => {
      socket.off('balance-update', onBalance)
      socket.off('payout-response', onPayoutResponse)
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
          { label: 'Vault balance',  value: `$${balance.toFixed(2)}`, accent: true },
          { label: 'Total earnings', value: `$${totalEarnings.toFixed(2)}`, accent: true },
          { label: 'Sessions',       value: '23', accent: false },
          { label: 'Pending',        value: `$${pendingAmount.toFixed(2)}`, accent: false },
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
        {canRequest ? (
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
            <p className="text-[11px] text-lb-muted">Available: ${balance.toFixed(2)} · Platform pays via bank transfer / Wise within 3 business days</p>
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
              <p className="text-[11px] text-lb-muted">Current balance: ${balance.toFixed(2)}. Keep interpreting to reach the threshold.</p>
            </div>
          </div>
        )}
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
                <p className="text-[11px] text-lb-muted">{t.type} · {t.duration} · {t.date}</p>
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