import { Star } from 'lucide-react'

const MOCK_REVIEWS = [
  { id: 1, client: 'John Doe',    rating: 5, text: 'Excellent interpretation, very professional.', time: '2h ago' },
  { id: 2, client: 'Sarah Smith', rating: 4, text: 'Good session, minor audio issues.',             time: '5h ago' },
  { id: 3, client: 'Mike Johnson',rating: 5, text: 'Highly recommended!',                           time: '1d ago' },
]

export default function RecentReviews({ reviews = MOCK_REVIEWS }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Recent Reviews</h3>
        <button className="text-xs font-medium text-interpreter-accent hover:opacity-80 transition-opacity">
          View All
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-400">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-semibold text-slate-600">{r.client[0]}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{r.client}</p>
                </div>
                <span className="text-[10px] text-slate-400">{r.time}</span>
              </div>
              <div className="flex items-center gap-0.5 mb-1 ml-9">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <p className="text-xs text-slate-600 ml-9 line-clamp-2">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}