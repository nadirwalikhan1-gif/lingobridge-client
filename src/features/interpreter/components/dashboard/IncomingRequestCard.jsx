// IncomingRequestCard.jsx — standalone card used in Requests page (no timer variant)
// For dashboard timer variant see IncomingRequests.jsx

export default function IncomingRequestCard({ req, onAccept, onDecline }) {
  const isVideo = req.sessionType === 'video' || req.type === 'video'

  return (
    <div className="lb-card border-2 border-[#E1F5EE]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[13px] font-medium text-[#534AB7] shrink-0">
            {req.avatar}
          </div>
          <div>
            <p className="text-[13px] font-medium text-lb-ink">{req.fromLang} → {req.toLang}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted">
                {isVideo ? 'Video' : 'Audio'} · {req.duration}
              </span>
              {req.category && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">{req.category}</span>
              )}
            </div>
            <p className="text-[11px] text-lb-muted mt-1">{req.client} · {req.timeAgo || req.time}</p>
          </div>
        </div>
        <span className="text-[13px] font-medium text-[#26215C]">{req.price}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onDecline?.(req.id)}
          className="flex-1 text-[11px] py-1.5 rounded border border-lb-border bg-transparent text-lb-muted hover:bg-lb-surface transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => onAccept?.(req.id)}
          className="flex-1 text-[11px] py-1.5 rounded bg-[#7F77DD] text-white font-medium hover:bg-[#534AB7] transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
