// DurationSelector.jsx — rebuilt with lb-* tokens to match interpreter design language
import { useState, useRef } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { AUDIO_PRICE_PER_MINUTE, VIDEO_PRICE_PER_MINUTE } from '../../../config/constants'

const DURATIONS = [
  [5, 15, 30, 45],
  [60, 90, 120, 180],
]

export default function DurationSelector({ selected, onSelect, sessionType }) {
  const rate = sessionType === 'video' ? VIDEO_PRICE_PER_MINUTE : AUDIO_PRICE_PER_MINUTE
  const scrollRef = useRef(null)
  const [page, setPage] = useState(0)
  const totalPages = DURATIONS.length

  const scroll = (direction) => {
    const newPage = page + direction
    if (newPage < 0 || newPage >= totalPages) return
    setPage(newPage)
    const el = scrollRef.current
    if (el) el.scrollTo({ left: newPage * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[180px]">
        {page > 0 && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-7 h-7 rounded-full bg-lb-surface border border-lb-border flex items-center justify-center hover:border-[#7F77DD] transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-lb-muted" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex h-full overflow-x-hidden scroll-smooth px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {DURATIONS.map((pageDurations, pageIndex) => (
            <div key={pageIndex} className="w-full shrink-0 grid grid-cols-2 grid-rows-2 gap-2 h-full py-1">
              {pageDurations.map((min) => {
                const isActive = selected === min
                return (
                  <button
                    key={min}
                    onClick={() => onSelect(min)}
                    className={`flex flex-col items-center justify-center rounded-lg border transition-colors h-full ${
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
          ))}
        </div>

        {page < totalPages - 1 && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-7 h-7 rounded-full bg-lb-surface border border-lb-border flex items-center justify-center hover:border-[#7F77DD] transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-3.5 h-3.5 text-lb-muted" />
          </button>
        )}
      </div>

      {/* Dots — same pill dot pattern as interpreter */}
      <div className="flex justify-center gap-1.5 mt-2">
        {DURATIONS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setPage(i)
              const el = scrollRef.current
              if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === page ? 'w-4 bg-[#7F77DD]' : 'w-1.5 bg-lb-border hover:bg-lb-muted'
            }`}
          />
        ))}
      </div>
    </div>
  )
}