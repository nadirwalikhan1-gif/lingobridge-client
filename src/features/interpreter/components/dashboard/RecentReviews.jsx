// RecentReviews.jsx — single featured review card, real data

import { useState, useEffect } from 'react'
import { useAuth } from '../../../../providers/AuthProvider'
import { getSocket } from '../../../../lib/socket'

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60)  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function StarRow({ rating = null }) {
  return null ( 
    <span className="text-[13px] text-[#BA7517] tracking-wide shrink-0">
      {'★'.repeat(Math.min(5, Math.max(0, Math.round(rating))))}
      {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(0, Math.round(rating)))))}
    </span>
  )
}

export default function RecentReviews({ reviews: reviewsProp }) {
  const { user } = useAuth()
  const [reviews, setReviews]   = useState(reviewsProp ?? null) // null = not yet loaded
  const [loading, setLoading]   = useState(!reviewsProp)

  useEffect(() => {
    // If parent already passed reviews, skip fetching
    if (reviewsProp !== undefined) {
      setReviews(reviewsProp)
      setLoading(false)
      return
    }

    const socket = getSocket()
    if (!socket || !user?.id) return

    socket.emit('get-reviews', { userId: user.id, limit: 5, role: 'interpreter' })

    const onReviews = (data) => {
      if (data.userId && data.userId !== user.id) return
      const items = Array.isArray(data.reviews) ? data.reviews : (Array.isArray(data) ? data : [])
      setReviews(items)
      setLoading(false)
    }

    const onNewReview = (data) => {
      if (data.userId && data.userId !== user.id) return
      setReviews((prev) => {
        const current = prev ?? []
        return [data, ...current].slice(0, 5)
      })
    }

    socket.on('reviews-data',  onReviews)
    socket.on('new-review',    onNewReview)

    // 3-second timeout — show empty state rather than spinner forever
    const timer = setTimeout(() => setLoading(false), 3000)

    return () => {
      socket.off('reviews-data', onReviews)
      socket.off('new-review',   onNewReview)
      clearTimeout(timer)
    }
  }, [user?.id, reviewsProp])

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="lb-card animate-pulse">
        <div className="h-3 bg-lb-border rounded w-24 mb-3" />
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-8 h-8 rounded-full bg-lb-border shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-lb-border rounded w-28" />
            <div className="h-2 bg-lb-border rounded w-16" />
          </div>
          <div className="h-3 bg-lb-border rounded w-16" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 bg-lb-border rounded w-full" />
          <div className="h-2.5 bg-lb-border rounded w-4/5" />
        </div>
      </div>
    )
  }

  const list = reviews ?? []
  const top  = list[0]

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!top) {
    return (
      <div className="lb-card">
        <h3 className="text-[13px] font-medium text-lb-ink mb-3">Recent review</h3>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <svg className="w-8 h-8 text-lb-border mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
          <p className="text-[12px] text-lb-muted">No reviews yet</p>
          <p className="text-[11px] text-lb-subtle mt-0.5">Complete sessions to receive your first review</p>
        </div>
      </div>
    )
  }

  // ── Featured review ─────────────────────────────────────────────────────────
  const initials = top.initials ?? getInitials(top.client ?? top.clientName ?? '')
  const name     = top.client  ?? top.clientName ?? 'Client'
  const ago      = top.timeAgo ?? timeAgo(top.createdAt ?? top.timestamp)
  const text     = top.text    ?? top.review ?? top.comment ?? ''
  const rating   = top.rating  ?? null

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Recent review</h3>

      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[11px] font-medium text-[#534AB7] shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-lb-ink leading-none">{name}</p>
          <p className="text-[10px] text-lb-muted mt-0.5">{ago}</p>
        </div>
        <StarRow rating={rating} />
      </div>

      {text && (
        <p className="text-[12px] text-lb-muted italic leading-relaxed">
          "{text}"
        </p>
      )}
    </div>
  )
}
