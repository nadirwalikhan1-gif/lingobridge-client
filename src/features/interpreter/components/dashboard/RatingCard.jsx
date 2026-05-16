import { Star, TrendingUp } from 'lucide-react'

export default function RatingCard({ rating = '—', reviewCount = 0, trend = null }) {
  const numRating = parseFloat(rating)
  const filled = isNaN(numRating) ? 0 : Math.round(numRating)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Your Rating</h3>
        {trend && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="flex items-end gap-3">
        <p className="text-4xl font-bold text-slate-900">{rating}</p>
        <div className="mb-1">
          <div className="flex items-center gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < filled ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          <p className="text-xs text-slate-500">Based on {reviewCount} reviews</p>
        </div>
      </div>
    </div>
  )
}
