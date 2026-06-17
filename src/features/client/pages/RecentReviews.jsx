import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Star, PenLine, X, Check, ChevronDown, MessageSquarePlus,
  Loader2, AlertCircle, Filter, ArrowLeft, ThumbsUp, Flag
} from 'lucide-react'
import { api } from '@/lib/api'

// ─── API Functions ──────────────────────────────────────────────────────────
const fetchReviews = async ({ starFilter, interpreterFilter, page = 1, limit = 10 }) => {
  const { data } = await api.get('/v1/reviews', {
    params: { rating: starFilter, interpreter: interpreterFilter, page, limit }
  })
  // Backend returns { data: [] } — transform to shape the component expects
  const allReviews = data.data || []
  const avg = allReviews.length
    ? (allReviews.reduce((sum, r) => sum + (r.interpreter_rating || 0), 0) / allReviews.length).toFixed(1)
    : '—'
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviews.filter(r => r.interpreter_rating === star).length,
  }))
  return {
    reviews: allReviews,
    averageRating: avg,
    distribution,
    interpreters: ['All Interpreters'],
    totalPages: 1,
  }
}

const fetchPendingReviews = async () => {
  // Backend route not yet implemented — return empty to suppress 404
  return { sessions: [] }
}

const submitReview = async ({ sessionId, rating, text }) => {
  // Backend route is /rate not /reviews
  const { data } = await api.post(`/v1/sessions/${sessionId}/rate`, { interpreterRating: rating, comment: text })
  return data
}

const markReviewHelpful = async (reviewId) => {
  await api.post(`/v1/reviews/${reviewId}/helpful`)
}

const reportReview = async ({ reviewId, reason }) => {
  await api.post(`/v1/reviews/${reviewId}/report`, { reason })
}

// ─── Star Picker Component ──────────────────────────────────────────────────
function StarPicker({ value, onChange, size = 'w-7 h-7' }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-200 rounded"
        >
          <Star className={`${size} transition-colors ${s <= (hovered || value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
        </button>
      ))}
    </div>
  )
}

// ─── Write Review Modal ───────────────────────────────────────────────────────
function WriteReviewModal({ session, onClose, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const mutation = useMutation({
    mutationFn: submitReview,
    onSuccess: () => {
      setSubmitted(true)
      setTimeout(() => { onSubmit(); onClose() }, 1500)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    }
  })

  const handleSubmit = () => {
    if (rating === 0) return
    mutation.mutate({ sessionId: session.id, rating, text: text.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check size={28} className="text-emerald-500" />
            </div>
            <p className="text-[16px] font-bold text-slate-900">Review submitted!</p>
            <p className="text-[13px] text-slate-400 text-center">Thank you for your feedback on {session.interpreter}.</p>
          </div>
        ) : (
          <>
            <h2 className="text-[16px] font-bold text-slate-900 mb-1">Write a Review</h2>
            <p className="text-[13px] text-slate-400 mb-5">
              Share your experience with <span className="font-medium text-slate-700">{session.interpreter}</span> · {session.date}
            </p>

            <div className="mb-5">
              <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Your Rating <span className="text-red-400">*</span></p>
              <StarPicker value={rating} onChange={setRating} />
              {rating === 0 && <p className="text-[11px] text-red-400 mt-1">Please select a rating to continue</p>}
              {rating > 0 && (
                <p className="text-[12px] text-slate-500 mt-1">
                  {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                </p>
              )}
            </div>

            <div className="mb-6">
              <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Your Comments <span className="text-slate-300">(optional)</span></p>
              <textarea
                value={text}
                onChange={e => setText(e.target.value.slice(0, 500))}
                placeholder="How was the interpretation quality, professionalism, and accuracy?"
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-300 mt-1 text-right">{text.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || mutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 text-[13px] font-semibold text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />}
                {mutation.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ review, onHelpful, onReport }) {
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')

  return (
    <div className="p-4 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-[12px] font-semibold text-violet-600 shrink-0">
          {review.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <p className="text-[13px] font-semibold text-slate-900">{review.interpreter}</p>
              <p className="text-[10px] text-slate-400">{review.languages} · {review.date}</p>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
              ))}
            </div>
          </div>

          {review.text ? (
            <p className="text-[12px] text-slate-600 leading-relaxed mb-2">{review.text}</p>
          ) : (
            <p className="text-[12px] text-slate-300 italic mb-2">No written comment</p>
          )}

          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onHelpful(review.id)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-violet-600 transition-colors"
            >
              <ThumbsUp size={12} /> Helpful ({review.helpfulCount ?? 0})
            </button>
            <button 
              onClick={() => setShowReport(!showReport)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 transition-colors"
            >
              <Flag size={12} /> Report
            </button>
          </div>

          {showReport && (
            <div className="mt-2 flex items-center gap-2">
              <select 
                value={reportReason} 
                onChange={e => setReportReason(e.target.value)}
                className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1"
              >
                <option value="">Select reason...</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="fake">Fake review</option>
                <option value="offensive">Offensive language</option>
                <option value="other">Other</option>
              </select>
              <button 
                onClick={() => { onReport({ reviewId: review.id, reason: reportReason }); setShowReport(false); }}
                disabled={!reportReason}
                className="text-[11px] px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-30 transition-colors"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function RecentReviews() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [starFilter, setStarFilter] = useState('all')
  const [interpreterFilter, setInterpreterFilter] = useState('All Interpreters')
  const [page, setPage] = useState(1)
  const [modalSession, setModalSession] = useState(null)

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', starFilter, interpreterFilter, page],
    queryFn: () => fetchReviews({ starFilter, interpreterFilter, page }),
    staleTime: 60000,
  })

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['reviews-pending'],
    queryFn: fetchPendingReviews,
    staleTime: 30000,
  })

  const submitMutation = useMutation({
    mutationFn: submitReview,
    onError: () => toast.error("Couldn't submit review — please try again"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['reviews-pending'] })
      toast.success('Review submitted successfully')
    }
  })

  const helpfulMutation = useMutation({
    mutationFn: markReviewHelpful,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
    onError: () => toast.error("Couldn't mark review as helpful — please try again")
  })

  const reportMutation = useMutation({
    mutationFn: reportReview,
    onSuccess: () => toast.success('Review reported'),
    onError: () => toast.error("Couldn't report review — please try again")
  })

  const reviews = reviewsData?.reviews ?? []
  const pendingSessions = pendingData?.sessions ?? []
  const averageRating = reviewsData?.averageRating ?? '—'
  const distribution = reviewsData?.distribution ?? []
  const interpreterOptions = reviewsData?.interpreters ?? ['All Interpreters']
  const totalPages = reviewsData?.totalPages ?? 1

  const handleReviewSubmitted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['reviews'] })
    queryClient.invalidateQueries({ queryKey: ['reviews-pending'] })
  }, [queryClient])

  if (reviewsLoading && !reviews.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={32} className="text-violet-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex overflow-hidden bg-[#F8F7FC]">
      {modalSession && (
        <WriteReviewModal
          session={modalSession}
          onClose={() => setModalSession(null)}
          onSubmit={handleReviewSubmitted}
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto py-8 px-3">
        <div className="w-full max-w-lg space-y-4">
          <div className="text-center mb-2">
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">My Reviews</h1>
            <p className="text-[14px] text-slate-500 mt-1">Reviews you've written about your interpreters</p>
          </div>

          {/* Pending Reviews Section */}
          {pendingLoading ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-amber-200 rounded w-1/2 mb-3" />
              <div className="h-12 bg-amber-100 rounded" />
            </div>
          ) : pendingSessions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquarePlus size={15} className="text-amber-600" />
                <p className="text-[13px] font-semibold text-amber-800">
                  {pendingSessions.length} session{pendingSessions.length > 1 ? 's' : ''} awaiting your review
                </p>
              </div>
              {pendingSessions.map(session => (
                <div key={session.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-[11px] font-semibold text-violet-600 shrink-0">
                    {session.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-900">{session.interpreter}</p>
                    <p className="text-[11px] text-slate-400">{session.languages} · {session.date}</p>
                  </div>
                  <button
                    onClick={() => setModalSession(session)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-700 transition-colors shrink-0"
                  >
                    <PenLine size={11} /> Write Review
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Rating Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-8">
              <div className="text-center shrink-0">
                <p className="text-[48px] font-bold text-slate-900 leading-none">{averageRating}</p>
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">{reviews.length} reviews written</p>
              </div>
              <div className="flex-1 space-y-2">
                {distribution.map(d => (
                  <div key={d.star} className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500 w-3 shrink-0">{d.star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${d.percentage}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 w-7 text-right shrink-0">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Ratings' },
                { value: '5', label: '5 Stars' },
                { value: '4', label: '4 Stars' },
                { value: '3below', label: '3 & Below' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setStarFilter(opt.value); setPage(1); }}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded-xl border transition-all ${
                    starFilter === opt.value
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-violet-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <select
                value={interpreterFilter}
                onChange={e => { setInterpreterFilter(e.target.value); setPage(1); }}
                className="appearance-none bg-white border border-slate-200 text-[12px] text-slate-700 rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:border-violet-400 cursor-pointer hover:border-slate-300 transition-colors"
              >
                {interpreterOptions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
            {reviewsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              ))
            ) : reviews.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Star size={28} className="text-slate-200" />
                <p className="text-[14px] text-slate-400">No reviews match your filters</p>
                <button
                  onClick={() => { setStarFilter('all'); setInterpreterFilter('All Interpreters'); setPage(1); }}
                  className="text-[12px] text-violet-600 hover:text-violet-700 transition-colors mt-1"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              reviews.map(review => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  onHelpful={helpfulMutation.mutate}
                  onReport={reportMutation.mutate}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button 
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors ${
                    page === p ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors"
              >
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}