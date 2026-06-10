import { useState, useEffect } from 'react'

const FILTERS = ['All', '5 Stars', '4 Stars', '3 Stars & below']

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')

  useEffect(() => {
    fetch('/api/interpreter/reviews')
      .then(r => r.json())
      .then(({ reviews = [] }) => {
        setReviews(reviews)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Derive stats from real data — never hardcoded
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   reviews.length
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0,
  }))

  const fiveStarPct = reviews.length
    ? Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100)
    : 0

  const filtered = reviews.filter(r => {
    if (filter === 'All')            return true
    if (filter === '5 Stars')        return r.rating === 5
    if (filter === '4 Stars')        return r.rating === 4
    if (filter === '3 Stars & below') return r.rating <= 3
    return true
  })

  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-lg font-medium text-lb-ink pb-1">Reviews</h1>

      {/* Summary */}
      <div className="lb-card">
        {loading ? (
          <div className="h-24 bg-lb-border rounded animate-pulse" />
        ) : (
          <>
            <div className="flex items-center gap-6">
              <div className="text-center shrink-0">
                <p className="text-[32px] font-medium text-lb-ink leading-none">{avgRating}</p>
                <p className="text-[14px] text-[#BA7517] mt-1 tracking-wide">★★★★★</p>
                <p className="text-[11px] text-lb-muted mt-1">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {dist.map((d) => (
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
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-lb-border">
              <div>
                <p className="text-[13px] font-medium text-lb-ink">{reviews.length}</p>
                <p className="text-[11px] text-lb-muted">Total reviews</p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-lb-ink">{fiveStarPct}%</p>
                <p className="text-[11px] text-lb-muted">5-star rate</p>
              </div>
            </div>
          </>
        )}
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
          </button>
        ))}
      </div>

      {/* Review list */}
      {loading ? (
        <div className="lb-card space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-lb-border rounded animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="lb-card py-10 text-center">
          <p className="text-sm font-medium text-lb-muted">No reviews match this filter</p>
        </div>
      ) : (
        <div className="lb-card space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="pb-3 border-b border-lb-border last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-lb-surface flex items-center justify-center text-[11px] font-medium text-lb-muted shrink-0">
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[13px] font-medium text-lb-ink">{r.client}</p>
                    <span className="text-[11px] text-lb-subtle">{r.date}</span>
                  </div>
                  <p className="text-[10px] text-lb-muted mb-1">{r.session}</p>
                  <p className="text-[12px] text-[#BA7517] mb-1.5 tracking-wide">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </p>
                  <p className="text-[13px] text-lb-muted">{r.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}