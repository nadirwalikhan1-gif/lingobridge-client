import { useState } from 'react'
import { StarRating } from '@/features/client/components/dashboard/SessionHistoryList'
import { Star } from 'lucide-react'

const ALL_REVIEWS = [
  { id: 1, interpreter: 'Maria Gonzalez', initials: 'MG', rating: 5, text: 'Excellent interpretation skills. Very professional and punctual.', date: 'Jan 15, 2024', sessionType: 'video' },
  { id: 2, interpreter: 'John Doe',       initials: 'JD', rating: 4, text: 'Good session, but had minor audio issues at the start.',          date: 'Jan 12, 2024', sessionType: 'audio' },
  { id: 3, interpreter: 'Sarah Chen',     initials: 'SC', rating: 5, text: 'Absolutely fantastic! Made the business meeting seamless.',        date: 'Jan 10, 2024', sessionType: 'video' },
  { id: 4, interpreter: 'Ahmed Hassan',   initials: 'AH', rating: 3, text: 'Decent but struggled with technical terminology.',                 date: 'Jan 08, 2024', sessionType: 'audio' },
]

const FILTER_OPTIONS = [
  { value: 'all',    label: 'All' },
  { value: '5',      label: '5 Stars' },
  { value: '4below', label: '4 & Below' },
]

export default function RecentReviews() {
  const [filter, setFilter] = useState('all')

  const averageRating = (ALL_REVIEWS.reduce((s, r) => s + r.rating, 0) / ALL_REVIEWS.length).toFixed(1)
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ALL_REVIEWS.filter(r => r.rating === star).length,
    percentage: Math.round((ALL_REVIEWS.filter(r => r.rating === star).length / ALL_REVIEWS.length) * 100),
  }))

  const filtered = ALL_REVIEWS.filter(r => {
    if (filter === '5')      return r.rating === 5
    if (filter === '4below') return r.rating <= 4
    return true
  })

  return (
    <div className="h-full flex overflow-hidden bg-[#F8F7FC]">
      <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto py-8 px-3">
        <div className="w-full max-w-lg space-y-4">

          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Reviews</h1>
            <p className="text-[14px] text-slate-500 mt-1">Your feedback on past sessions</p>
          </div>

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
                <p className="text-[11px] text-slate-400 mt-1.5">{ALL_REVIEWS.length} reviews</p>
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

          {/* Filter chips */}
          <div className="flex items-center gap-2">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`text-[12px] font-medium px-4 py-2 rounded-xl border transition-all ${
                  filter === opt.value
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Reviews list */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
            {filtered.map(review => (
              <div key={review.id} className="p-4 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-[12px] font-semibold text-violet-600 shrink-0">
                    {review.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13px] font-semibold text-slate-900">{review.interpreter}</p>
                      <span className="text-[10px] text-slate-400">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-[12px] text-slate-600 leading-relaxed">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}