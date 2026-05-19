// RatingCard.jsx — used in Earnings page header

export default function RatingCard({ rating = '4.8', reviewCount = 128 }) {
  const numRating = parseFloat(rating)
  const filled = isNaN(numRating) ? 0 : Math.round(numRating)

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Your rating</h3>
      <div className="flex items-end gap-3">
        <p className="text-[32px] font-medium text-lb-ink leading-none">{rating}</p>
        <div className="mb-0.5">
          <div className="flex items-center gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-[14px] ${i < filled ? 'text-[#BA7517]' : 'text-lb-border'}`}>★</span>
            ))}
          </div>
          <p className="text-[11px] text-lb-muted">Based on {reviewCount} reviews</p>
        </div>
      </div>
    </div>
  )
}
