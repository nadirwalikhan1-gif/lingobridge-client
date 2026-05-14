import { Star } from 'lucide-react'

const reviews = [
  { id: 1, client: 'John Doe', rating: 5, text: 'Excellent interpretation, very professional.', time: '2h ago' },
  { id: 2, client: 'Sarah Smith', rating: 4, text: 'Good session, minor audio issues.', time: '5h ago' },
  { id: 3, client: 'Mike Johnson', rating: 5, text: 'Highly recommended!', time: '1d ago' },
]

export default function RecentReviews() {
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-semibold text-slate-900">Recent Reviews</h3>
        <button className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700">All</button>
      </div>
      
      <div className="space-y-2">
        {reviews.map((r) => (
          <div key={r.id} className="pb-2 border-b border-slate-50 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[11px] font-medium text-slate-900">{r.client}</p>
              <span className="text-[9px] text-slate-400">{r.time}</span>
            </div>
            <div className="flex items-center gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-2.5 h-2.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <p className="text-[10px] text-slate-600 line-clamp-2">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}