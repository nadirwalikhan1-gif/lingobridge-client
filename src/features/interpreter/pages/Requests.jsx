import { useState } from 'react'

const requests = [
  { id: 1, fromLang: 'English', toLang: 'Spanish', sessionType: 'video', duration: '30 min', expectedDuration: '30 min', category: 'Medical', price: '$45.00', client: 'John Doe', clientOrg: 'City General Hospital', timeAgo: 'Just now', avatar: 'JD', expiresIn: 320, isRecording: true, isUrgent: false, clientRating: 4.5, isReturningClient: true },
  { id: 2, fromLang: 'Arabic',  toLang: 'English', sessionType: 'audio', duration: '45 min', expectedDuration: '45 min', category: 'Legal',   price: '$32.50', client: 'Sarah Smith', clientOrg: 'Johnson & Associates Law', timeAgo: '2 min ago', avatar: 'SS', expiresIn: 480, isRecording: false, isUrgent: true, clientRating: 5.0, isReturningClient: false },
  { id: 3, fromLang: 'Urdu',    toLang: 'English', sessionType: 'video', duration: '60 min', expectedDuration: '60 min', category: 'Insurance', price: '$67.00', client: 'Ali Khan', clientOrg: 'State Farm Insurance', timeAgo: '5 min ago', avatar: 'AK', expiresIn: 540, isRecording: true, isUrgent: false, clientRating: 4.0, isReturningClient: true },
]

const DOMAIN_COLORS = {
  'Medical':   { bg: '#E1F5EE', text: '#0F6E56', border: '#1D9E75' },
  'Legal':     { bg: '#FCEBEB', text: '#A32D2D', border: '#E24B4A' },
  'Insurance': { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'Social Services': { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Government':{ bg: '#F3E8FF', text: '#7C3AED', border: '#A78BFA' },
  'Business':  { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Technical': { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'General':   { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
}

function StarRating({ rating = 0 }) {
  const filled = Math.round(parseFloat(rating)) || 0
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-2.5 h-2.5" fill={i < filled ? '#BA7517' : '#E5E7EB'} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  )
}

export default function Requests() {
  const [active, setActive] = useState(requests)
  const remove = (id) => setActive(p => p.filter(r => r.id !== id))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-lg font-medium text-lb-ink">Requests</h1>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#E1F5EE] text-[#0F6E56] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
          {active.length} active
        </span>
      </div>

      {active.length === 0 ? (
        <div className="lb-card py-10 text-center">
          <p className="text-sm font-medium text-lb-muted mb-1">No active requests</p>
          <p className="text-xs text-lb-subtle">New requests will appear here in real-time</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {active.map((r) => {
            const domainStyle = DOMAIN_COLORS[r.category] || DOMAIN_COLORS['General']
            const perMinuteRate = 0.85
            const est = (perMinuteRate * parseInt(r.expectedDuration || 30)).toFixed(2)

            return (
              <div key={r.id} className="lb-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[13px] font-medium text-[#534AB7] shrink-0">
                      {r.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-medium text-lb-ink">{r.fromLang} → {r.toLang}</p>
                        {r.isReturningClient && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">Returning</span>
                        )}
                        {r.isUrgent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">Emergency</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted">
                          {r.sessionType === 'video' ? 'Video' : 'Audio'} · {r.duration}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: domainStyle.bg,
                            color: domainStyle.text,
                            borderColor: domainStyle.border,
                          }}
                        >
                          {r.category}
                        </span>
                        {r.isRecording && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E24B4A] animate-pulse" />
                            Recording
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[11px] text-lb-muted">{r.client} · {r.clientOrg}</p>
                        {r.clientRating && (
                          <div className="flex items-center gap-1">
                            <StarRating rating={r.clientRating} />
                            <span className="text-[10px] text-lb-subtle">({r.clientRating})</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-[#534AB7] font-medium mt-1">${perMinuteRate.toFixed(2)}/min · ≈ ${est} est.</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-medium text-[#26215C]">{r.price}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => remove(r.id)} className="flex-1 text-[12px] py-2 rounded border border-lb-border text-lb-muted hover:bg-lb-surface transition-colors">Decline</button>
                  <button onClick={() => remove(r.id)} className="flex-1 text-[12px] py-2 rounded bg-[#7F77DD] text-white font-medium hover:bg-[#534AB7] transition-colors">Accept request</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}