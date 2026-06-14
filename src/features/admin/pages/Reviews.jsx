// src/features/admin/pages/Reviews.jsx
// Wired to real API. Uses React Query with 30s staleTime.

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import ErrorState from '../../../components/ui/ErrorState'

const FILTERS = ['All', 'Flagged', '5 Stars', '4 Stars', '3 Stars & below']

function StarRating({ rating }) {
  return (
    <p className="text-[12px] text-[#BA7517] tracking-wide">
      {'?'.repeat(Math.round(rating))}{'?'.repeat(5 - Math.round(rating))}
    </p>
  )
}

export default function Reviews() {
  const [filter, setFilter] = useState('All')
  const queryClient = useQueryClient()

  const { data: reviews, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => api.get('/v1/admin/reviews'),
    staleTime: 30000,
  })

  const dismissMutation = useMutation({
    mutationFn: (id) => api.post(`/v1/admin/reviews/${id}/dismiss-flag`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })

  const removeMutation = useMutation({
    mutationFn: (id) => api.delete(`/v1/admin/reviews/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })

  const flaggedCount = useMemo(() =>
    reviews?.filter(r => r.flagged).length ?? 0,
  [reviews])

  const avgRating = useMemo(() =>
    reviews?.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0',
  [reviews])

  const dist = useMemo(() =>
    [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews?.filter(r => r.rating === star).length ?? 0,
      pct: reviews?.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
    })),
  [reviews])

  const filtered = useMemo(() => {
    if (!reviews) return []
    return reviews.filter(r => {
      if (filter === 'Flagged')       return r.flagged
      if (filter === '5 Stars')       return r.rating === 5
      if (filter === '4 Stars')       return r.rating === 4
      if (filter === '3 Stars & below') return r.rating <= 3
      return true
    })
  }, [reviews, filter])

  const fiveStarRate = useMemo(() =>
    reviews?.length > 0 ? Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100) : 0,
  [reviews])

  const handleDismissFlag = (id) => dismissMutation.mutate(id)
  const handleRemoveReview = (id) => {
    if (!window.confirm('Remove this review permanently?')) return
    removeMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-lb-border rounded w-32 animate-pulse" />
        <div className="h-32 bg-lb-border rounded-xl animate-pulse" />
        <div className="h-8 bg-lb-border rounded w-64 animate-pulse" />
        <div className="h-96 bg-lb-border rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />
  }

  return (
    <div className="space-y-3">
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

      <div className="lb-card">
        <div className="flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-[32px] font-medium text-lb-ink leading-none">{avgRating}</p>
            <div className="mt-1">
              <StarRating rating={parseFloat(avgRating)} />
            </div>
            <p className="text-[11px] text-lb-muted mt-1">{reviews?.length ?? 0} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {dist.map(d => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-lb-muted w-3">{d.star}</span>
                <span className="text-[11px] text-[#BA7517]">?</span>
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
            <p className="text-[13px] font-medium text-lb-ink">{reviews?.length ?? 0}</p>
            <p className="text-[11px] text-lb-muted">Total reviews</p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-lb-ink">{fiveStarRate}%</p>
            <p className="text-[11px] text-lb-muted">5-star rate</p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#A32D2D]">{flaggedCount}</p>
            <p className="text-[11px] text-lb-muted">Flagged for review</p>
          </div>
        </div>
      </div>

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

      <div className="lb-card space-y-3">
        {filtered.length === 0 ? (
          <p className="text-[12px] text-lb-muted text-center py-6">No reviews match this filter</p>
        ) : (
          filtered.map(r => (
            <div key={r.id} className={`pb-3 border-b border-lb-border last:border-0 last:pb-0 ${r.flagged ? 'bg-[rgba(252,235,235,0.3)] -mx-4 px-4 rounded-lg py-2' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-lb-surface flex items-center justify-center text-[11px] font-medium text-lb-muted shrink-0">
                  {r.clientInit}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 flex-wrap gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-lb-ink">{r.client}</p>
                      <span className="text-lb-subtle text-[10px]">?</span>
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
                    <StarRating rating={r.rating} />
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">{r.category}</span>
                    {r.flagged && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">Flagged</span>
                    )}
                  </div>
                  <p className="text-[12px] text-lb-muted leading-relaxed">"{r.text}"</p>
                  {r.flagged && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleDismissFlag(r.id)}
                        disabled={dismissMutation.isPending}
                        className="text-[10px] px-2.5 py-1 rounded border border-lb-border bg-white text-lb-muted hover:bg-lb-surface transition-colors disabled:opacity-50"
                      >
                        {dismissMutation.isPending ? '…' : 'Dismiss flag'}
                      </button>
                      <button
                        onClick={() => handleRemoveReview(r.id)}
                        disabled={removeMutation.isPending}
                        className="text-[10px] px-2.5 py-1 rounded bg-[#FCEBEB] text-[#A32D2D] font-medium hover:bg-[#fad8d8] transition-colors disabled:opacity-50"
                      >
                        {removeMutation.isPending ? '…' : 'Remove review'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
