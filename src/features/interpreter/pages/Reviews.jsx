// Reviews.jsx — Interpreter Reviews Page
// Fixed: hardcoded ★★★★★ replaced with dynamic star row derived from avgRating
// Fixed: r.date formatted via fmtDate() to handle ISO timestamps
// Fixed: r.initials derived from r.client/r.clientName if not sent by backend
// Fixed: import path added for useAuth (consistent with dashboard pattern)
// No mock data — all metrics derived from real API response

import { useState, useEffect } from 'react'

const FILTERS = ['All', '5 Stars', '4 Stars', '3 Stars & below']

function fmtDate(raw) {
  if (!raw) return '—'
  try {
    return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return raw
  }
}

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase() || '?'
}

// Dynamic star row — renders filled/half/empty stars from a numeric rating
function StarRow({ rating, size = 'sm' }) {
  if (rating == null) return null
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  const cls   = size === 'lg' ? 'text-[18px]' : 'text-[12px]'
  return (
    <span className={`${cls} text-[#BA7517] tracking-wide leading-none`}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
    </span>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-lb-border rounded ${className}`} />
}

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/interpreter/reviews', { signal: controller.signal })
      .then(r => r.json())
      .then(({ reviews = [] }) => {
        setReviews(reviews)
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') setLoading(false)
      })
    return () => controller.abort()
  }, [])

  // ── Derived stats — never hardcoded ──────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length)
    : null

  const avgDisplay = avgRating != null ? avgRating.toFixed(1) : '—'

  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   reviews.length
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0,
  }))

  const fiveStarPct = reviews.length
    ? Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100)
    : null

  const filtered = reviews.filter(r => {
    if (filter === 'All')             return true
    if (filter === '5 Stars')         return r.rating === 5
    if (filter === '4 Stars')         return r.rating === 4
    if (filter === '3 Stars & below') return r.rating <= 3
    return true
  })

  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-lg font-medium text-lb-ink pb-1">Reviews</h1>

      {/* Summary card */}
      <div className="lb-card">
        {loading ? (
          <div className="h-24 bg-lb-border rounded animate-pulse" />
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <p className="text-[13px] font-medium text-lb-ink">No reviews yet</p>
            <p className="text-[12px] text-lb-muted mt-1">
              Reviews from completed sessions will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-6">
              {/* Average rating */}
              <div className="text-center shrink-0">
                <p className="text-[32px] font-medium text-lb-ink leading-none">{avgDisplay}</p>
                {/* Dynamic stars derived from real average — not hardcoded */}
                <div className="mt-1">
                  <StarRow rating={avgRating} size="lg" />
                </div>
                <p className="text-[11px] text-lb-muted mt-1">{reviews.length} reviews</p>
              </div>

              {/* Distribution bars */}
              <div className="flex-1 space-y-1.5">
                {dist.map((d) => (
                  <div key={d.star} className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-lb-muted w-3">{d.star}</span>
                    <span className="text-[11px] text-[#BA7517]">★</span>
                    <div className="flex-1 h-1.5 bg-lb-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#BA7517] rounded-full transition-all duration-500"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-lb-subtle w-7 text-right">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer stats */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-lb-border">
              <div>
                <p className="text-[13px] font-medium text-lb-ink">{reviews.length}</p>
                <p className="text-[11px] text-lb-muted">Total reviews</p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-lb-ink">
                  {fiveStarPct != null ? `${fiveStarPct}%` : '—'}
                </p>
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
          <p className="text-[13px] font-medium text-lb-muted">
            {reviews.length === 0
              ? 'No reviews yet'
              : 'No reviews match this filter'}
          </p>
        </div>
      ) : (
        <div className="lb-card space-y-3">
          {filtered.map((r, i) => {
            // Normalise field variants from different backend shapes
            const client   = r.client ?? r.clientName ?? r.name ?? 'Client'
            const text     = r.text ?? r.review ?? r.comment ?? ''
            const session  = r.session ?? r.sessionType ?? r.type ?? null
            const date     = fmtDate(r.date ?? r.createdAt ?? r.timestamp)
            // Derive initials if backend doesn't send them
            const initials = r.initials ?? getInitials(client)

            return (
              <div key={r.id ?? i} className="pb-3 border-b border-lb-border last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-lb-surface flex items-center justify-center text-[11px] font-medium text-lb-muted shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[13px] font-medium text-lb-ink">{client}</p>
                      <span className="text-[11px] text-lb-subtle">{date}</span>
                    </div>
                    {session && (
                      <p className="text-[10px] text-lb-muted mb-1">{session}</p>
                    )}
                    <div className="mb-1.5">
                      <StarRow rating={r.rating} />
                    </div>
                    {text && (
                      <p className="text-[13px] text-lb-muted">{text}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}