import { useState } from 'react'
import { Star, TrendingUp, MessageSquare } from 'lucide-react'

const REVIEWS = [
  { id: 1, client: 'John Doe',    rating: 5, text: 'Excellent interpretation, very professional. Made the whole medical consultation smooth and stress-free.', date: 'May 15, 2026', session: 'Medical Consultation' },
  { id: 2, client: 'Sarah Smith', rating: 4, text: 'Good session overall. Minor audio issues at the start but handled it professionally.', date: 'May 14, 2026', session: 'Business Meeting' },
  { id: 3, client: 'Ali Khan',    rating: 5, text: 'Highly recommended! Very accurate and fast. Will definitely book again.', date: 'May 13, 2026', session: 'Legal Discussion' },
  { id: 4, client: 'Maria Garcia',rating: 5, text: 'Perfect interpretation. Understood context well and conveyed the right tone.', date: 'May 10, 2026', session: 'Medical Consultation' },
  { id: 5, client: 'David Lee',   rating: 3, text: 'Decent session but felt rushed. Would prefer more time for complex terminology.', date: 'May 8, 2026', session: 'Technical Meeting' },
]

const FILTERS = ['All', '5 Stars', '4 Stars', '3 Stars & Below']

const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1)
const distribution = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: REVIEWS.filter(r => r.rating === star).length,
  percentage: Math.round((REVIEWS.filter(r => r.rating === star).length / REVIEWS.length) * 100),
}))

export default function Reviews() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = REVIEWS.filter(r => {
    if (activeFilter === 'All') return true
    if (activeFilter === '5 Stars') return r.rating === 5
    if (activeFilter === '4 Stars') return r.rating === 4
    if (activeFilter === '3 Stars & Below') return r.rating <= 3
    return true
  })

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-bold text-slate-800">Reviews</h1>

      {/* Summary Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Average */}
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-800">{avgRating}</p>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">{REVIEWS.length} reviews</p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1.5">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 w-3">{d.star}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${d.percentage}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm font-bold text-slate-800">{REVIEWS.length}</p>
              <p className="text-xs text-slate-500">Total Reviews</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {Math.round((REVIEWS.filter(r => r.rating === 5).length / REVIEWS.length) * 100)}%
              </p>
              <p className="text-xs text-slate-500">5-Star Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips — matches client pattern */}
      <div className="flex items-center gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              activeFilter === f
                ? 'bg-interpreter-accent text-white border-interpreter-accent'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No reviews match this filter</p>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-600">{r.client[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-800">{r.client}</p>
                    <span className="text-xs text-slate-400">{r.date}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-1.5">{r.session}</p>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">{r.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}