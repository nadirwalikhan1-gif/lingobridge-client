import { Globe, Headphones, Video, Clock, Calendar, User, Tag, AlertTriangle } from 'lucide-react'
import { LANGUAGE_LABELS, AUDIO_PRICE_PER_MINUTE, VIDEO_PRICE_PER_MINUTE } from '../../../config/constants'

export default function SessionSummary({
  fromLang,
  toLang,
  sessionType,
  duration,
  walletBalance = 45.60,
  hasInsufficientFunds = false,
  selectedInterpreter,
  selectedCategory,
  currentStep
}) {
  const rate = sessionType === 'video' ? VIDEO_PRICE_PER_MINUTE : AUDIO_PRICE_PER_MINUTE
  const base = +(duration * rate).toFixed(2)
  const platformFee = +(base * 0.05).toFixed(2)
  const total = +(base + platformFee).toFixed(2)

  const fromLabel = LANGUAGE_LABELS[fromLang] || fromLang
  const toLabel = LANGUAGE_LABELS[toLang] || toLang

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">

      <h3 className="text-[14px] font-bold text-slate-900 tracking-tight">Session Summary</h3>

      {/* Details */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[12px] text-slate-500">
            <Globe className="w-3.5 h-3.5 text-slate-400" /> Language
          </span>
          <span className="text-[12px] font-semibold text-slate-900 truncate max-w-[160px] text-right">
            {fromLabel} → {toLabel}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[12px] text-slate-500">
            {sessionType === 'video'
              ? <Video className="w-3.5 h-3.5 text-slate-400" />
              : <Headphones className="w-3.5 h-3.5 text-slate-400" />
            }
            Type
          </span>
          <span className="text-[12px] font-semibold text-slate-900">
            {sessionType === 'audio' ? 'Audio Call' : 'Video Call'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[12px] text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration
          </span>
          <span className="text-[12px] font-semibold text-slate-900">{duration} Minutes</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[12px] text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date & Time
          </span>
          <span className="text-[12px] font-semibold text-slate-900">Today, 10:30 AM</span>
        </div>

        {selectedCategory && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <span className="flex items-center gap-2 text-[12px] text-slate-500">
              <Tag className="w-3.5 h-3.5 text-violet-400" /> Category
            </span>
            <span className="text-[12px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
              {selectedCategory}
            </span>
          </div>
        )}

        {selectedInterpreter && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <span className="flex items-center gap-2 text-[12px] text-slate-500">
              <User className="w-3.5 h-3.5 text-violet-400" /> Interpreter
            </span>
            <span className="text-[12px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md truncate max-w-[140px]">
              {selectedInterpreter}
            </span>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Price Breakdown</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-500">{duration} min × ${rate}/min</span>
            <span className="font-semibold text-slate-700">${base.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-500">Platform Fee (5%)</span>
            <span className="font-semibold text-slate-700">${platformFee.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-[13px] font-bold text-slate-900">Total</span>
          <span className="text-[20px] font-bold text-slate-900 tracking-tight">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Insufficient Funds Warning */}
      {hasInsufficientFunds && (
        <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-amber-800">Insufficient Funds</p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              You need ${(total - walletBalance).toFixed(2)} more.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}