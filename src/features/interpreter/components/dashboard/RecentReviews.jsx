// RecentReviews.jsx — single featured review card matching reference HTML

const MOCK_REVIEWS = [
  {
    id: 1, client: 'Mike Johnson', initials: 'MJ', timeAgo: '1 day ago', rating: 5,
    text: 'Highly recommended! Very professional and accurate. Made a stressful appointment so much easier.',
  },
  {
    id: 2, client: 'Sarah Smith',  initials: 'SS', timeAgo: '2 days ago', rating: 5,
    text: 'Excellent interpretation, very professional. Made the whole consultation smooth.',
  },
]

export default function RecentReviews({ reviews = MOCK_REVIEWS }) {
  const top = reviews[0]
  if (!top) return null

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Recent review</h3>

      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[11px] font-medium text-[#534AB7] shrink-0">
          {top.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-lb-ink leading-none">{top.client}</p>
          <p className="text-[10px] text-lb-muted mt-0.5">{top.timeAgo}</p>
        </div>
        <span className="text-[13px] text-[#BA7517] tracking-wide shrink-0">★★★★★</span>
      </div>

      <p className="text-[12px] text-lb-muted italic leading-relaxed">
        "{top.text}"
      </p>
    </div>
  )
}
