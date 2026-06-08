import { useState } from 'react'
import { Star, PenLine, X, Check, ChevronDown, MessageSquarePlus } from 'lucide-react'

// FIX 1: Renamed component to MyReviews internally and updated all copy to say
// "Reviews you wrote" — eliminates ambiguity about who wrote what.

// Sessions the client has attended but NOT yet reviewed — shown as "pending review"
const UNREVIEWED_SESSIONS = [
  { id: 'u1', interpreter: 'Khalid Ahmadzai', initials: 'KA', sessionType: 'video', date: 'Jun 8, 2026',  languages: 'English → Pashto (Eastern)' },
  { id: 'u2', interpreter: 'Noorullah Wardak', initials: 'NW', sessionType: 'audio', date: 'Jun 7, 2026', languages: 'English → Pashto (Eastern)' },
]

// Reviews the client has already submitted
const ALL_REVIEWS = [
  { id: 1, interpreter: 'Maria Gonzalez', initials: 'MG', rating: 5, text: 'Excellent interpretation skills. Very professional and punctual.', date: 'Jan 15, 2024', sessionType: 'video', languages: 'Spanish → English' },
  { id: 2, interpreter: 'John Doe',       initials: 'JD', rating: 4, text: 'Good session, but had minor audio issues at the start.',          date: 'Jan 12, 2024', sessionType: 'audio', languages: 'English → Spanish' },
  { id: 3, interpreter: 'Sarah Chen',     initials: 'SC', rating: 5, text: 'Absolutely fantastic! Made the business meeting seamless.',        date: 'Jan 10, 2024', sessionType: 'video', languages: 'Mandarin → English' },
  { id: 4, interpreter: 'Ahmed Hassan',   initials: 'AH', rating: 3, text: 'Decent but struggled with technical terminology.',                 date: 'Jan 08, 2024', sessionType: 'audio', languages: 'Arabic → English' },
]

const STAR_FILTERS = [
  { value: 'all',    label: 'All Ratings' },
  { value: '5',      label: '5 Stars'     },
  { value: '4',      label: '4 Stars'     },
  { value: '3below', label: '3 & Below'   },
]

// FIX 2: Unique interpreter names for the filter dropdown
const INTERPRETER_OPTIONS = ['All Interpreters', ...Array.from(new Set(ALL_REVIEWS.map(r => r.interpreter)))]

function StarPicker({ value, onChange }) {
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
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star className={`w-7 h-7 transition-colors ${s <= (hovered || value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
        </button>
      ))}
    </div>
  )
}

// FIX 3: Write-a-Review modal — clients can now submit reviews for unreviewed sessions
function WriteReviewModal({ session, onClose, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [text, setText]     = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (rating === 0) return
    setSubmitted(true)
    setTimeout(() => { onSubmit({ session, rating, text }); onClose() }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
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
            </div>

            <div className="mb-6">
              <p className="text-[12px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Your Comments <span className="text-slate-300">(optional)</span></p>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
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
                disabled={rating === 0}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 text-[13px] font-semibold text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Submit Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function RecentReviews() {
  const [starFilter, setStarFilter]           = useState('all')
  const [interpreterFilter, setInterpreterFilter] = useState('All Interpreters')
  const [reviews, setReviews]                 = useState(ALL_REVIEWS)
  const [unreviewed, setUnreviewed]           = useState(UNREVIEWED_SESSIONS)
  const [modalSession, setModalSession]       = useState(null)

  const averageRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
  }))

  // FIX 4: Filter by both star rating AND interpreter name
  const filtered = reviews.filter(r => {
    const starOk =
      starFilter === 'all'    ? true :
      starFilter === '5'      ? r.rating === 5 :
      starFilter === '4'      ? r.rating === 4 :
      starFilter === '3below' ? r.rating <= 3  : true
    const interpOk = interpreterFilter === 'All Interpreters' || r.interpreter === interpreterFilter
    return starOk && interpOk
  })

  const handleReviewSubmitted = ({ session, rating, text }) => {
    const newReview = {
      id: Date.now(),
      interpreter: session.interpreter,
      initials: session.initials,
      rating,
      text: text || '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sessionType: session.sessionType,
      languages: session.languages,
    }
    setReviews(prev => [newReview, ...prev])
    setUnreviewed(prev => prev.filter(s => s.id !== session.id))
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

          {/* FIX 5: Header copy updated — explicitly says "you wrote" to remove ambiguity */}
          <div className="text-center mb-2">
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">My Reviews</h1>
            <p className="text-[14px] text-slate-500 mt-1">Reviews you've written about your interpreters</p>
          </div>

          {/* FIX 6: "Awaiting your review" section — surfaces unreviewed sessions prominently */}
          {unreviewed.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquarePlus size={15} className="text-amber-600" />
                <p className="text-[13px] font-semibold text-amber-800">
                  {unreviewed.length} session{unreviewed.length > 1 ? 's' : ''} awaiting your review
                </p>
              </div>
              {unreviewed.map(session => (
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

          {/* Rating summary */}
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

          {/* FIX 7: Filters — star rating chips + interpreter dropdown side by side */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {STAR_FILTERS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStarFilter(opt.value)}
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
                onChange={e => setInterpreterFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-[12px] text-slate-700 rounded-xl pl-3 pr-8 py-1.5 focus:outline-none focus:border-violet-400 cursor-pointer hover:border-slate-300 transition-colors"
              >
                {INTERPRETER_OPTIONS.map(name => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Reviews list */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <Star size={28} className="text-slate-200" />
                <p className="text-[14px] text-slate-400">No reviews match your filters</p>
                <button
                  onClick={() => { setStarFilter('all'); setInterpreterFilter('All Interpreters') }}
                  className="text-[12px] text-violet-600 hover:text-violet-700 transition-colors mt-1"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filtered.map(review => (
                <div key={review.id} className="p-4 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-[12px] font-semibold text-violet-600 shrink-0">
                      {review.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="text-[13px] font-semibold text-slate-900">{review.interpreter}</p>
                          {/* FIX 8: Show language pair on each review card for context */}
                          <p className="text-[10px] text-slate-400">{review.languages}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-2">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                        ))}
                      </div>
                      {/* FIX 9: Empty review text handled gracefully */}
                      {review.text
                        ? <p className="text-[12px] text-slate-600 leading-relaxed">{review.text}</p>
                        : <p className="text-[12px] text-slate-300 italic">No written comment</p>
                      }
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}