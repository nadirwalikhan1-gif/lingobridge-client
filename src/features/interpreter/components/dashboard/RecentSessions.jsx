// RecentSessions.jsx — matches reference HTML row design

import { useState } from 'react'

const MOCK_SESSIONS = [
  { id: 1, fromLang: 'English', toLang: 'Spanish', type: 'video', duration: '30 min', time: 'Today, 10:30 AM',      avatar: 'JD', price: '$12.00' },
  { id: 2, fromLang: 'Urdu',    toLang: 'English', type: 'audio', duration: '15 min', time: 'Today, 09:15 AM',      avatar: 'AK', price: '$6.00'  },
  { id: 3, fromLang: 'English', toLang: 'French',  type: 'video', duration: '45 min', time: 'Yesterday, 7:45 PM',   avatar: 'SL', price: '$18.00' },
  { id: 4, fromLang: 'English', toLang: 'Arabic',  type: 'video', duration: '60 min', time: 'Yesterday, 3:00 PM',   avatar: 'MJ', price: '$35.00' },
]

function TypeIcon({ type }) {
  if (type === 'video') return (
    <svg className="w-2.5 h-2.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
    </svg>
  )
  return (
    <svg className="w-2.5 h-2.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
  )
}

export default function RecentSessions({ sessions = MOCK_SESSIONS }) {
  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[14px] font-medium text-lb-ink">Recent sessions</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">View all</button>
      </div>

      <div className="divide-y divide-lb-border">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5 py-2">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-lb-surface flex items-center justify-center text-[10px] font-medium text-lb-muted shrink-0">
              {s.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-lb-ink">{s.fromLang} → {s.toLang}</span>
                <TypeIcon type={s.type} />
              </div>
              <p className="text-[11px] text-lb-muted mt-0.5">{s.duration} · {s.time}</p>
            </div>

            {/* Status + price */}
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EAF3DE] text-[#3B6D11] shrink-0">Completed</span>
            <span className="text-[12px] font-medium text-lb-ink shrink-0 ml-1.5">{s.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
