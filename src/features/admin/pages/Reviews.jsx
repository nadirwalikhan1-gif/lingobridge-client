// Reviews.jsx — Admin platform review oversight
// Mirrors interpreter Reviews page structure — same summary + filter + list pattern

import { useState } from 'react'

const REVIEWS = [
  { id: 1, client: 'John Doe',    clientInit: 'JD', interpreter: 'Maria Garcia',  interpInit: 'MG', rating: 5, text: 'Excellent interpretation. Made a stressful medical appointment so much easier. Highly recommend Maria.', date: 'May 17, 2026', category: 'Medical',  flagged: false },
  { id: 2, client: 'Tom Hughes',  clientInit: 'TH', interpreter: 'Raza Malik',    interpInit: 'RM', rating: 2, text: 'Quality was poor. Did not convey correct medical terms and I felt there was a language barrier.',         date: 'May 16, 2026', category: 'Medical',  flagged: true  },
  { id: 3, client: 'Clara Reyes', clientInit: 'CR', interpreter: 'Chen Wei',      interpInit: 'CW', rating: 5, text: 'Incredible speed and accuracy during a tense business negotiation. Very professional.',                  date: 'May 15, 2026', category: 'Business', flagged: false },
  { id: 4, client: 'Ali Khan',    clientInit: 'AK', interpreter: 'Aisha Khan',    interpInit: 'AK', rating: 4, text: 'Good session overall. Some minor connection issues at the start but handled very professionally.',        date: 'May 14, 2026', category: 'Legal',    flagged: false },
  { id: 5, client: 'Sara Moni',   clientInit: 'SM', interpreter: 'Laila Sanz',    interpInit: 'LS', rating: 5, text: 'Perfect in every way. Calm, clear, and incredibly accurate. Will always choose Laila.',                  date: 'May 13, 2026', category: 'Legal',    flagged: false },
  { id: 6, client: 'Emma Ross',   clientInit: 'ER', interpreter: 'Maria Garcia',  interpInit: 'MG', rating: 1, text: 'Worst experience. Interpreter was rude and disconnected mid-session without explanation.',               date: 'May 12, 2026', category: 'Medical',  flagged: true  },
]

const FILTERS = ['All', 'Flagged', '5 Stars', '4 Stars', '3 Stars & below']

const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1)
const dist = [5, 4, 3, 2, 1].map(star => ({
  star,
  count: REVIEWS.filter(r => r.rating === star).length,
  pct: Math.round((REVIEWS.filter(r => r.rating === star).length / REVIEWS.length) * 100),
}))

export default function Reviews() {
  const [filter, setFilter] = useState('All')
  const [dismissed, setDismissed] = useState([])

  const flaggedCount = REVIEWS.filter(r => r.flagged && !dismissed.includes(r.id)).length

  const filtered = REVIEWS.filter(r => {
    if (filter === 'Flagged')       return r.flagged && !dismissed.includes(r.id)
    if (filter === '5 Stars')       return r.rating === 5
    if (filter === '4 Stars')       return r.rating === 4
    if (filter === '3 Stars & below') return r.rating <= 3
    return true
  })

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Platform operations</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Reviews</h1>
        </div>
        {flaggedCount > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FCEBEB] text-[#A32D2D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A32D2D]" />
            {flaggedCount} flagged
          </span>
        )}
      </div>

      {/* Summary card — mirrors interpreter Reviews summary */}
      <div className="lb-card">
        <div className="flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-[32px] font-medium text-lb-ink leading-none">{avgRating}</p>
            <p className="text-[14px] text-[#BA7517] mt-1 tracking-wide">★★★★★</p>
            <p className="text-[11px] text-lb-muted mt-1">{REVIEWS.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {dist.map(d => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-lb-muted w-3">{d.star}</span>
                <span className="text-[11px] text-[#BA7517]">★</span>
                <div className="flex-1 h-1.5 bg-lb-border rounded-full overflow-hidden">
                  <div className="h-full bg-[#BA7517] rounded-full" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-[11px] text-lb-subtle w-7 text-right">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-lb-border">
          <div>
            <p className="text-[13px] font-medium text-lb-ink">{REVIEWS.length}</p>
            <p className="text-[11px] text-lb-muted">Total reviews</p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-lb-ink">{Math.round((REVIEWS.filter(r => r.rating === 5).length / REVIEWS.length) * 100)}%</p>
            <p className="text-[11px] text-lb-muted">5-star rate</p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#A32D2D]">{flaggedCount}</p>
            <p className="text-[11px] text-lb-muted">Flagged for review</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[11px] font-medium px-3 py-1.5 rounded border transition-colors ${
              filter === f
                ? 'bg-[#7F77DD] text-white border-[#7F77DD]'
                : 'bg-white text-lb-muted border-lb-border hover:bg-lb-surface'
            }`}
          >
            {f}
            {f === 'Flagged' && flaggedCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#A32D2D] text-white text-[9px]">{flaggedCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Review list */}
      <div className="lb-card space-y-3">
        {filtered.map(r => (
          <div key={r.id} className={`pb-3 border-b border-lb-border last:border-0 last:pb-0 ${r.flagged && !dismissed.includes(r.id) ? 'bg-[rgba(252,235,235,0.3)] -mx-4 px-4 rounded-lg py-2' : ''}`}>
            <div className="flex items-start gap-3">
              {/* Client avatar */}
              <div className="w-9 h-9 rounded-full bg-lb-surface flex items-center justify-center text-[11px] font-medium text-lb-muted shrink-0">
                {r.clientInit}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5 flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-lb-ink">{r.client}</p>
                    <span className="text-lb-subtle text-[10px]">→</span>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[8px] font-medium text-[#534AB7]">
                        {r.interpInit}
                      </div>
                      <span className="text-[11px] text-lb-muted">{r.interpreter}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-lb-subtle">{r.date}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[12px] text-[#BA7517] tracking-wide">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </p>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">{r.category}</span>
                  {r.flagged && !dismissed.includes(r.id) && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">Flagged</span>
                  )}
                </div>
                <p className="text-[12px] text-lb-muted leading-relaxed">"{r.text}"</p>
                {r.flagged && !dismissed.includes(r.id) && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setDismissed(d => [...d, r.id])}
                      className="text-[10px] px-2.5 py-1 rounded border border-lb-border bg-white text-lb-muted hover:bg-lb-surface transition-colors"
                    >
                      Dismiss flag
                    </button>
                    <button className="text-[10px] px-2.5 py-1 rounded bg-[#FCEBEB] text-[#A32D2D] font-medium hover:bg-[#fad8d8] transition-colors">
                      Remove review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[12px] text-lb-muted text-center py-6">No reviews match this filter</p>
        )}
      </div>
    </div>
  )
}