// SessionTypeSelector.jsx — rebuilt with lb-* tokens to match interpreter design language
// FIX: vault-model — display client rates ($1.49 audio / $1.79 video)

import { Headphones, Video } from 'lucide-react'
import { CLIENT_RATES } from '../../../config/constants'

const types = [
  { 
    value: 'audio', 
    label: 'Audio Call', 
    desc: 'Best for quick conversations', 
    rate: CLIENT_RATES.audio,
    icon: Headphones, 
    available: true 
  },
  { 
    value: 'video', 
    label: 'Video Call', 
    desc: 'Face-to-face interpretation', 
    rate: CLIENT_RATES.video,
    icon: Video, 
    available: true 
  },
]

export default function SessionTypeSelector({ selected, onSelect }) {
  return (
    <div className="flex gap-3">
      {types.map((type) => {
        const Icon = type.icon
        const isActive = selected === type.value
        return (
          <button
            key={type.value}
            onClick={() => type.available && onSelect(type.value)}
            disabled={!type.available}
            className={`flex-1 flex flex-col items-center justify-center gap-2.5 py-5 rounded-lg border transition-colors ${
              !type.available
                ? 'border-lb-border bg-lb-surface opacity-50 cursor-not-allowed'
                : isActive
                  ? 'border-lb-primary bg-[#EEEDFE] shadow-[0_0_0_3px_var(--color-lb-primary-glow)]'
                  : 'border-lb-border bg-lb-surface hover:border-lb-primary hover:shadow-[0_0_0_3px_var(--color-lb-primary-glow)] hover:bg-[#EEEDFE]/40'
            }`}
            aria-pressed={isActive}
            aria-disabled={!type.available}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isActive ? 'bg-[#7F77DD]' : 'bg-lb-surface border border-lb-border'
            }`}>
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-lb-ink'}`} />
            </div>
            <div className="text-center">
              <p className={`text-[13px] font-medium transition-colors ${isActive ? 'text-[#26215C]' : 'text-lb-ink'}`}>
                {type.label}
              </p>
              {/* FIX: vault-model — show rate per minute */}
              <p className={`text-[11px] font-semibold mt-0.5 transition-colors ${isActive ? 'text-[#534AB7]' : 'text-[#7F77DD]'}`}>
                ${type.rate.toFixed(2)}/min
              </p>
              <p className={`text-[10px] mt-0.5 transition-colors ${isActive ? 'text-[#534AB7]/70' : 'text-lb-muted'}`}>
                {type.desc}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
