// RatingCard.jsx — standalone card, moved out of WalletSummary
// FIXES APPLIED: 🟡 Rating trend (up/down vs last month)

export default function RatingCard({ rating = '4.8', previousRating = null, reviewCount = 128 }) {
  const numRating = parseFloat(rating)
  const filled = isNaN(numRating) ? 0 : Math.round(numRating)

  // 🟡 Trend calculation
  const prev = parseFloat(previousRating)
  const hasTrend = !isNaN(prev) && previousRating !== null
  const trendDiff = hasTrend ? (numRating - prev).toFixed(1) : null
  const isUp = hasTrend && trendDiff > 0
  const isDown = hasTrend && trendDiff < 0

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Your rating</h3>
      <div className="flex items-center gap-4">
        <p className="text-[32px] font-semibold text-[#26215C] leading-none">{rating}</p>
        <div>
          <div className="flex items-center gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-[16px] ${i < filled ? 'text-[#BA7517]' : 'text-lb-border'}`}>★</span>
            ))}
          </div>
          <p className="text-[11px] text-lb-muted">Based on {reviewCount} reviews</p>
        </div>
      </div>

      {/* 🟡 Trend indicator */}
      {hasTrend && (
        <div className="mt-3 pt-3 border-t border-lb-border">
          <div className="flex items-center gap-2">
            <span className={`text-[12px] font-semibold flex items-center gap-1 ${
              isUp ? 'text-[#0F6E56]' : isDown ? 'text-[#A32D2D]' : 'text-lb-muted'
            }`}>
              {isUp && <span>↑</span>}
              {isDown && <span>↓</span>}
              {!isUp && !isDown && <span>→</span>}
              {trendDiff > 0 ? '+' : ''}{trendDiff} from last month
            </span>
            <span className="text-[11px] text-lb-subtle">(was {previousRating})</span>
          </div>
        </div>
      )}
    </div>
  )
}