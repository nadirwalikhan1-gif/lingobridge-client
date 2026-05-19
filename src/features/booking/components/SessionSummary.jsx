// SessionSummary.jsx — rebuilt with lb-* tokens to match interpreter design language
import { Globe, Headphones, Video, Clock, Calendar, User, Tag, AlertTriangle } from 'lucide-react'
import { LANGUAGE_LABELS, AUDIO_PRICE_PER_MINUTE, VIDEO_PRICE_PER_MINUTE } from '../../../config/constants'

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
}) {
  const rate = sessionType === 'video' ? VIDEO_PRICE_PER_MINUTE : AUDIO_PRICE_PER_MINUTE
  const base = +(duration * rate).toFixed(2)
  const platformFee = +(base * 0.05).toFixed(2)
  const total = +(base + platformFee).toFixed(2)

  const fromLabel = LANGUAGE_LABELS[fromLang] || fromLang
  const toLabel   = LANGUAGE_LABELS[toLang]   || toLang

  return (
    <div className="lb-card flex flex-col gap-0">

      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Session summary</h3>

      {/* Details — same divide-y pattern as interpreter cards */}
      <div className="divide-y divide-lb-border">
        <Row icon={Globe}    label="Language" value={`${fromLabel} → ${toLabel}`} />
        <Row
          icon={sessionType === 'video' ? Video : Headphones}
          label="Type"
          value={sessionType === 'audio' ? 'Audio Call' : 'Video Call'}
        />
        <Row icon={Clock}    label="Duration"   value={`${duration} minutes`} />
        <Row icon={Calendar} label="Date & Time" value="Today, 10:30 AM" />

        {selectedCategory && (
          <Row icon={Tag}  label="Category"    value={selectedCategory}    valuePill />
        )}
        {selectedInterpreter && (
          <Row icon={User} label="Interpreter" value={selectedInterpreter} valuePill />
        )}
      </div>

      {/* Price breakdown */}
      <div className="mt-3 pt-3 border-t border-lb-border">
        <p className="text-[10px] font-medium text-lb-muted uppercase tracking-wider mb-2">Price breakdown</p>
        <div className="divide-y divide-lb-border">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-[12px] text-lb-muted">{duration} min × ${rate}/min</span>
            <span className="text-[12px] font-medium text-lb-ink">${base.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-[12px] text-lb-muted">Platform fee (5%)</span>
            <span className="text-[12px] font-medium text-lb-ink">${platformFee.toFixed(2)}</span>
          </div>
        </div>

        {/* Total — same pattern as interpreter WalletSummary balance */}
        <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-lb-border">
          <span className="text-[11px] text-lb-muted">Total</span>
          <span className="text-[20px] font-medium text-[#26215C]">${total.toFixed(2)}</span>
        </div>
      </div>

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