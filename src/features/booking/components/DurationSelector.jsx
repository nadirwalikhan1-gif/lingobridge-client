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
    if (el) {
      el.scrollTo({ left: newPage * el.clientWidth, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[200px]">
        {page > 0 && (
          <button 
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            aria-label="Previous duration options"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
        )}

        <div 
          ref={scrollRef}
          className="flex h-full overflow-x-hidden scroll-smooth px-2"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {DURATIONS.map((pageDurations, pageIndex) => (
            <div key={pageIndex} className="w-full shrink-0 grid grid-cols-2 grid-rows-2 gap-2 h-full px-1 py-1">
              {pageDurations.map((min) => {
                const isActive = selected === min
                return (
                  <button
                    key={min}
                    onClick={() => onSelect(min)}
                    className={`group flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 h-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                      isActive
                        ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    aria-pressed={isActive}
                    aria-label={`${min} minutes, $${(min * rate).toFixed(2)}`}
                  >
                    <span className={`text-[16px] font-bold leading-none transition-colors duration-200 ${isActive ? 'text-violet-700' : 'text-slate-800'}`}>
                      {min}
                    </span>
                    <span className={`text-[10px] font-medium tracking-wider mt-1 transition-colors duration-200 ${isActive ? 'text-violet-600' : 'text-slate-500'}`}>
                      Minute
                    </span>
                    <span className={`text-[8px] font-semibold mt-1 transition-colors duration-200 ${isActive ? 'text-violet-500' : 'text-slate-400'}`}>
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
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            aria-label="Next duration options"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>

      <div className="flex justify-center gap-1.5 mt-3" role="tablist" aria-label="Duration pages">
        {DURATIONS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setPage(i)
              const el = scrollRef.current
              if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 ${
              i === page ? 'bg-violet-600 w-4' : 'bg-slate-200 hover:bg-slate-300'
            }`}
            role="tab"
            aria-selected={i === page}
            aria-label={`Page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}