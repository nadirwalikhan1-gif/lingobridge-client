import { useState } from 'react'

const requests = [
  { id: 1, fromLang: 'English', toLang: 'Spanish', sessionType: 'video', duration: '30 min', category: 'Medical', price: '$45.00', client: 'John Doe',    timeAgo: 'Just now',  avatar: 'JD', expiresIn: 320 },
  { id: 2, fromLang: 'Arabic',  toLang: 'English', sessionType: 'audio', duration: '45 min', category: 'Business', price: '$32.50', client: 'Sarah Smith', timeAgo: '2 min ago', avatar: 'SS', expiresIn: 480 },
  { id: 3, fromLang: 'Urdu',    toLang: 'English', sessionType: 'video', duration: '60 min', category: 'Legal',   price: '$67.00', client: 'Ali Khan',    timeAgo: '5 min ago', avatar: 'AK', expiresIn: 540 },
]

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
          {active.map((r) => (
            <div key={r.id} className="lb-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[13px] font-medium text-[#534AB7] shrink-0">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-lb-ink">{r.fromLang} → {r.toLang}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted">
                        {r.sessionType === 'video' ? 'Video' : 'Audio'} · {r.duration}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">{r.category}</span>
                    </div>
                    <p className="text-[11px] text-lb-muted mt-1">{r.client} · {r.timeAgo}</p>
                  </div>
                </div>
                <span className="text-[14px] font-medium text-[#26215C]">{r.price}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => remove(r.id)} className="flex-1 text-[12px] py-2 rounded border border-lb-border text-lb-muted hover:bg-lb-surface transition-colors">Decline</button>
                <button onClick={() => remove(r.id)} className="flex-1 text-[12px] py-2 rounded bg-[#7F77DD] text-white font-medium hover:bg-[#534AB7] transition-colors">Accept request</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
