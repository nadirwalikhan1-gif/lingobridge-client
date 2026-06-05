// SessionSummary.jsx — rebuilt with lb-* tokens to match interpreter design language
// FIX: vault-model — client rates only, no platform fee display, hold cost preview

import { Globe, Headphones, Video, Clock, Calendar, User, Tag, AlertTriangle, PauseCircle } from 'lucide-react'
import { LANGUAGE_LABELS, CLIENT_RATES, HOLD_TIERS } from '../../../config/constants'

function Row({ icon: Icon, label, value, valuePill }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="flex items-center gap-1.5 text-[12px] text-lb-muted">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      {valuePill ? (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">
          {value}
        </span>
      ) : (
        <span className="text-[12px] font-medium text-lb-ink text-right max-w-[160px] truncate">{value}</span>
      )}
    </div>
  )
}

export default function SessionSummary({
  fromLang,
  toLang,
  sessionType,
  duration,
  walletBalance = 45.60,
  hasInsufficientFunds = false,
  selectedInterpreter,
  selectedCategory,
  currentStep,
  isOnDemand = false,
}) {
  // FIX: vault-model — use CLIENT_RATES (what client pays)
  const rate = sessionType ? CLIENT_RATES[sessionType] : 0
  const base = duration ? +(duration * rate).toFixed(2) : 0
  const total = base // vault-model: no platform fee shown to client

  const fromLabel = LANGUAGE_LABELS[fromLang] || fromLang
  const toLabel   = LANGUAGE_LABELS[toLang]   || toLang

  // FIX: vault-model — hold cost preview
  const holdCostPreview = (holdMinutes) => {
    if (!sessionType) return '0.00'
    const tiers = HOLD_TIERS[sessionType]
    let cost = 0, cursor = 0
    for (const tier of tiers) {
      if (cursor >= holdMinutes) break
      const tierEnd = Math.min(holdMinutes, tier.upTo)
      const minutesInTier = tierEnd - cursor
      if (minutesInTier > 0) cost += minutesInTier * tier.rate
      cursor = tierEnd
    }
    return cost.toFixed(2)
  }

  return (
    <div className="lb-card flex flex-col gap-0">

      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Session summary</h3>

      {/* Details */}
      <div className="divide-y divide-lb-border">
        <Row icon={Globe}    label="Language" value={`${fromLabel} → ${toLabel}`} />
        <Row
          icon={sessionType === 'video' ? Video : Headphones}
          label="Type"
          value={sessionType === 'audio' ? 'Audio Call' : sessionType === 'video' ? 'Video Call' : '—'}
        />
        <Row icon={Clock}    label="Duration"   value={duration ? `${duration} minutes` : '—'} />
        <Row icon={Calendar} label="Date & Time" value={isOnDemand ? 'On-demand · < 1 min' : 'Today, 10:30 AM'} />

        {selectedCategory && (
          <Row icon={Tag}  label="Category"    value={selectedCategory}    valuePill />
        )}
        {selectedInterpreter && (
          <Row icon={User} label="Interpreter" value={selectedInterpreter} valuePill />
        )}
      </div>

      {/* Price breakdown — only shown when duration is selected */}
      {duration && (
        <div className="mt-3 pt-3 border-t border-lb-border">
          <p className="text-[10px] font-medium text-lb-muted uppercase tracking-wider mb-2">Price breakdown</p>
          <div className="divide-y divide-lb-border">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[12px] text-lb-muted">{duration} min × ${rate}/min</span>
              <span className="text-[12px] font-medium text-lb-ink">${base.toFixed(2)}</span>
            </div>
            {/* FIX: vault-model — removed platform fee line (spread is internal) */}
          </div>

          {/* Total */}
          <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-lb-border">
            <span className="text-[11px] text-lb-muted">Total</span>
            <span className="text-[20px] font-medium text-[#26215C]">${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* FIX: vault-model — hold cost preview (shown when type selected) */}
      {sessionType && (
        <div className="mt-2 pt-2 border-t border-lb-border">
          <div className="flex items-center gap-1.5 mb-1.5">
            <PauseCircle className="w-3.5 h-3.5 text-[#BA7517]" />
            <span className="text-[10px] font-medium text-lb-muted uppercase tracking-wider">Hold time cost</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-lb-muted">0–5 min</span>
              <span className="text-[11px] font-medium text-[#1D9E75]">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-lb-muted">5–10 min</span>
              <span className="text-[11px] font-medium text-lb-ink">${sessionType === 'video' ? '0.75' : '0.65'}/min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-lb-muted">10+ min</span>
              <span className="text-[11px] font-medium text-lb-ink">${sessionType === 'video' ? '1.79' : '1.49'}/min</span>
            </div>
          </div>
        </div>
      )}

      {/* Wallet balance row */}
      <div className="mt-2 pt-2 border-t border-lb-border flex items-center justify-between">
        <span className="text-[11px] text-lb-muted">Wallet balance</span>
        <span className={`text-[12px] font-medium ${hasInsufficientFunds ? 'text-[#A32D2D]' : 'text-[#0F6E56]'}`}>
          ${walletBalance.toFixed(2)}
        </span>
      </div>

      {/* Insufficient funds warning */}
      {hasInsufficientFunds && (
        <div className="flex items-start gap-2.5 mt-3 p-3 bg-[#FFF8E6] border border-[#F0D070] rounded-lg">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-medium text-[#7A5800]">Insufficient funds</p>
            <p className="text-[10px] text-[#9A7000] mt-0.5">
              You need ${(total - walletBalance).toFixed(2)} more to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}