// Wallet.jsx — rebuilt to match interpreter lb-* design language
// FIX: vault-model — demo transactions and stats use CLIENT_RATES pricing

import { useWallet } from '@/hooks'
// FIX: vault-model — import client rates for dynamic pricing
import { CLIENT_RATES } from '../../../config/constants'

// FIX: vault-model — demo transactions computed from rates instead of hardcoded old prices
const TRANSACTIONS = [
  { 
    id: 1, 
    type: 'debit',  
    description: 'Video session with Maria G.', 
    minutes: 45,
    sessionType: 'video',
    date: 'Today, 10:30 AM' 
  },
  { 
    id: 2, 
    type: 'debit',  
    description: 'Audio session with John D.',   
    minutes: 30,
    sessionType: 'audio',
    date: 'Yesterday, 2:15 PM' 
  },
  { 
    id: 3, 
    type: 'credit', 
    description: 'Wallet top-up',                
    amount: 50.00, 
    date: 'Jan 10, 9:00 AM' 
  },
  { 
    id: 4, 
    type: 'debit',  
    description: 'Video session with Sarah C.',  
    minutes: 60,
    sessionType: 'video',
    date: 'Jan 08, 4:00 PM' 
  },
].map(t => t.type === 'debit' ? {
  ...t,
  // FIX: vault-model — compute amount from CLIENT_RATES (audio $1.49, video $1.79)
  amount: +(t.minutes * (CLIENT_RATES[t.sessionType] || 0)).toFixed(2),
} : t)

function UpArrow() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
    </svg>
  )
}
function DownArrow() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
    </svg>
  )
}
function CardIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
    </svg>
  )
}

export default function Wallet() {
  const { balance } = useWallet()
  const currentBalance = balance ?? 45.60

  // FIX: vault-model — compute stats from actual transaction amounts
  const todayDebits = TRANSACTIONS
    .filter(t => t.type === 'debit' && t.date.startsWith('Today'))
    .reduce((sum, t) => sum + t.amount, 0)
  const todayCredits = TRANSACTIONS
    .filter(t => t.type === 'credit' && t.date.startsWith('Today'))
    .reduce((sum, t) => sum + t.amount, 0)
  const totalDebits = TRANSACTIONS
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  const statsRows = [
    { label: 'Added today',      value: `$${todayCredits.toFixed(2)}` },
    { label: 'Spent today',      value: `$${todayDebits.toFixed(2)}` },
    { label: 'Spent this week',  value: `$${totalDebits.toFixed(2)}` },
    { label: 'Spent this month', value: `$${totalDebits.toFixed(2)}` },
  ]

  return (
    <div className="space-y-3 max-w-2xl">

      {/* Header */}
      <div className="pb-1">
        <p className="text-xs text-lb-muted">Manage your funds</p>
        <h1 className="text-lg font-medium text-lb-ink mt-0.5">Wallet</h1>
      </div>

      {/* Balance card */}
      <div className="lb-card">
        <h3 className="text-[13px] font-medium text-lb-ink mb-3">Balance summary</h3>

        <div className="divide-y divide-lb-border">
          {statsRows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-1.5">
              <span className="text-[12px] text-lb-muted">{r.label}</span>
              <span className="text-[12px] font-medium text-lb-ink">{r.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-lb-border">
          <div className="flex items-baseline justify-between mb-0.5">
            <span className="text-[11px] text-lb-muted">Available balance</span>
            <span className="text-[17px] font-medium text-[#26215C]">${currentBalance.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-lb-subtle text-right mb-2">Ready to use on any session</p>
          <button className="w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[13px] font-medium rounded-lg py-2 transition-colors">
            ↑ Add funds
          </button>
        </div>
      </div>

      {/* Upgrade nudge */}
      <div className="lb-card flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-[#534AB7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-lb-ink">Save 20% — Monthly Plan</p>
          <p className="text-[11px] text-lb-muted">Unlimited sessions for $99/month</p>
        </div>
        <button className="px-3 py-1.5 bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[11px] font-medium rounded-lg transition-colors shrink-0">
          Upgrade
        </button>
      </div>

      {/* Transactions */}
      <div className="lb-card">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[13px] font-medium text-lb-ink">Transactions</h3>
          <button className="text-[12px] text-[#7F77DD] font-medium">View all</button>
        </div>

        <div className="divide-y divide-lb-border">
          {TRANSACTIONS.map((t) => (
            <div key={t.id} className="flex items-center gap-2.5 py-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                t.type === 'credit' ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-lb-surface text-lb-muted'
              }`}>
                {t.type === 'credit' ? <UpArrow /> : <DownArrow />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-lb-ink truncate">{t.description}</p>
                <p className="text-[11px] text-lb-muted mt-0.5">{t.date}</p>
              </div>

              <span className={`text-[12px] font-medium shrink-0 ${
                t.type === 'credit' ? 'text-[#0F6E56]' : 'text-lb-ink'
              }`}>
                {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div className="lb-card">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[13px] font-medium text-lb-ink">Payment methods</h3>
          <button className="text-[12px] text-[#7F77DD] font-medium">Manage</button>
        </div>

        <div className="space-y-2">
          {[
            { last4: '4242', expiry: '12/28', type: 'VISA',       isDefault: true  },
            { last4: '8888', expiry: '12/30', type: 'Mastercard', isDefault: false },
          ].map((card) => (
            <div key={card.last4} className={`flex items-center gap-3 p-2.5 rounded-lg border ${card.isDefault ? 'border-[#7F77DD] bg-lb-surface' : 'border-lb-border'}`}>
              <div className="w-7 h-7 rounded-lg bg-lb-surface flex items-center justify-center shrink-0 text-lb-muted">
                <CardIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-lb-ink">{card.type} •••• {card.last4}</p>
                <p className="text-[11px] text-lb-muted">Expires {card.expiry}</p>
              </div>
              {card.isDefault && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#E1F5EE] text-[#0F6E56] shrink-0">Default</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}