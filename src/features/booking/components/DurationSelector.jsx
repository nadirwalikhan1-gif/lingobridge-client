// DurationSelector.jsx — Fix #9: all options in a single 2×4 grid, no pagination
// FIX: vault-model — use CLIENT_RATES instead of old per-type constants

import { CLIENT_RATES } from '../../../config/constants'

const DURATIONS = [5, 15, 30, 45, 60, 90, 120, 180]

export default function DurationSelector({ selected, onSelect, sessionType }) {
  // FIX: vault-model — unified rate lookup
  const rate = sessionType ? CLIENT_RATES[sessionType] : CLIENT_RATES.audio

  return (
    <div className="grid grid-cols-2 gap-2" style={{ gridTemplateRows: 'repeat(4, 1fr)' }}>
      {DURATIONS.map((min) => {
        const isActive = selected === min
        return (
          <button
            key={min}
            onClick={() => onSelect(min)}
            className={`flex flex-col items-center justify-center py-3 rounded-lg border transition-colors ${
              isActive
                ? 'border-[#7F77DD] bg-[#EEEDFE]'
                : 'border-lb-border bg-lb-surface hover:border-[#7F77DD] hover:bg-[#EEEDFE]/40'
            }`}
            aria-pressed={isActive}
          >
            <span className={`text-[18px] font-medium leading-none ${isActive ? 'text-[#26215C]' : 'text-lb-ink'}`}>
              {min}
            </span>
            <span className={`text-[10px] mt-1 ${isActive ? 'text-[#534AB7]' : 'text-lb-muted'}`}>
              min
            </span>
            <span className={`text-[9px] mt-0.5 font-medium ${isActive ? 'text-[#534AB7]' : 'text-lb-muted'}`}>
              ${(min * rate).toFixed(2)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
