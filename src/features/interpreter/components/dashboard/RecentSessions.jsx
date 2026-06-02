// RecentSessions.jsx — matches reference HTML row design
// FIXES: Reviewer "Problem 6" — Missing call type (domain) in session history

import { useState } from 'react'

const MOCK_SESSIONS = [
  { id: 1, client: 'John Doe',    fromLang: 'English', toLang: 'Spanish', type: 'video', duration: '30 min', time: 'Today, 10:30 AM',      avatar: 'JD', price: '$12.00', domain: 'Business',      isReturning: true,  hasNotes: false },
  { id: 2, client: 'Ali Khan',    fromLang: 'Urdu',    toLang: 'English', type: 'audio', duration: '15 min', time: 'Today, 09:15 AM',      avatar: 'AK', price: '$6.00',  domain: 'Medical',       isReturning: false, hasNotes: true  },
  { id: 3, client: 'Sarah Lee',   fromLang: 'English', toLang: 'French',  type: 'video', duration: '45 min', time: 'Yesterday, 7:45 PM',   avatar: 'SL', price: '$18.00', domain: 'Legal',         isReturning: true,  hasNotes: false },
  { id: 4, client: 'Maria Garcia',fromLang: 'English', toLang: 'Arabic',  type: 'video', duration: '60 min', time: 'Yesterday, 3:00 PM',   avatar: 'MJ', price: '$35.00', domain: 'Insurance',     isReturning: false, hasNotes: false },
]

const DOMAIN_COLORS = {
  'Medical':        { bg: '#E1F5EE', text: '#0F6E56' },
  'Legal':          { bg: '#FCEBEB', text: '#A32D2D' },
  'Insurance':      { bg: '#E0F2FE', text: '#0369A1' },
  'Social Services':{ bg: '#EEEDFE', text: '#534AB7' },
  'Government':     { bg: '#F3E8FF', text: '#7C3AED' },
  'Business':       { bg: '#EEEDFE', text: '#534AB7' },
  'Technical':      { bg: '#E0F2FE', text: '#0369A1' },
  'Healthcare':     { bg: '#E1F5EE', text: '#0F6E56' },
  'Customer Service':{ bg: '#F3F4F6', text: '#4B5563' },
  'Welfare':        { bg: '#F3F4F6', text: '#4B5563' },
  'Personal':       { bg: '#F3F4F6', text: '#4B5563' },
  'General':        { bg: '#F3F4F6', text: '#4B5563' },
}

function getDomainStyle(domain) {
  return DOMAIN_COLORS[domain] || DOMAIN_COLORS['General']
}

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
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[14px] font-medium text-lb-ink">Recent sessions</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">View all</button>
      </div>

      <div className="divide-y divide-lb-border">
        {sessions.map((s) => {
          const domainStyle = getDomainStyle(s.domain)

          return (
            <div key={s.id} className="py-2">
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-lb-surface flex items-center justify-center text-[10px] font-medium text-lb-muted shrink-0">
                  {s.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] font-medium text-lb-ink">{s.fromLang} → {s.toLang}</span>
                    <TypeIcon type={s.type} />
                    {/* 🟡 Domain badge in session history */}
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: domainStyle.bg,
                        color: domainStyle.text,
                      }}
                    >
                      {s.domain}
                    </span>
                    {s.isReturning && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">
                        Returning
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-lb-muted mt-0.5">
                    {s.duration} · {s.time} · <span className="font-medium text-lb-ink">{s.client}</span>
                  </p>
                </div>

                {/* Status + price */}
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EAF3DE] text-[#3B6D11] shrink-0">Completed</span>
                <span className="text-[12px] font-medium text-lb-ink shrink-0 ml-1.5">{s.price}</span>

                {/* Expand/collapse */}
                <button
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  className="text-lb-muted hover:text-lb-ink transition-colors shrink-0"
                >
                  <svg className={`w-4 h-4 transition-transform ${expandedId === s.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>

              {/* Expanded actions */}
              {expandedId === s.id && (
                <div className="mt-2 ml-9 flex items-center gap-2">
                  <button className="text-[10px] font-medium px-2 py-1 rounded border border-lb-border text-lb-muted hover:bg-lb-surface transition-colors">
                    Add notes
                  </button>
                  <button className="text-[10px] font-medium px-2 py-1 rounded border border-[#FCEBEB] text-[#A32D2D] hover:bg-[#FCEBEB] transition-colors">
                    Report issue
                  </button>
                  {s.hasNotes && (
                    <span className="text-[10px] text-[#534AB7] font-medium">Notes saved</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}