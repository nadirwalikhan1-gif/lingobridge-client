// RecentSessions.jsx — expanded row shows notes, report, session detail

import { useState, useEffect } from 'react'

const DOMAIN_COLORS = {
  'Medical':   { bg: '#E1F5EE', text: '#0F6E56' },
  'Legal':     { bg: '#FCEBEB', text: '#A32D2D' },
  'Insurance': { bg: '#E0F2FE', text: '#0369A1' },
  'Business':  { bg: '#EEEDFE', text: '#534AB7' },
  'General':   { bg: '#F3F4F6', text: '#4B5563' },
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

export default function RecentSessions() {
  const [sessions,   setSessions]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [notes,      setNotes]      = useState({})
  const [editingId,  setEditingId]  = useState(null)

  useEffect(() => {
    fetch('/api/interpreter/sessions/recent')
      .then(r => r.json())
      .then(({ sessions = [] }) => {
        setSessions(sessions)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="lb-card">
        <div className="h-4 w-32 bg-lb-border rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-lb-border rounded animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[14px] font-medium text-lb-ink">Recent sessions</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">View all</button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-[13px] text-lb-muted text-center py-6">No recent sessions</p>
      ) : (
        <div className="divide-y divide-lb-border">
          {sessions.map((s) => {
            const domainStyle = getDomainStyle(s.domain)
            const isExpanded  = expandedId === s.id
            const isEditing   = editingId  === s.id

            return (
              <div key={s.id} className="py-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-lb-surface flex items-center justify-center text-[10px] font-medium text-lb-muted shrink-0">
                    {s.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[12px] font-medium text-lb-ink">{s.fromLang} → {s.toLang}</span>
                      <TypeIcon type={s.type} />
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: domainStyle.bg, color: domainStyle.text }}>
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

                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EAF3DE] text-[#3B6D11] shrink-0">Completed</span>
                  <span className="text-[12px] font-medium text-lb-ink shrink-0 ml-1.5">{s.price}</span>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    title="View details, notes & actions"
                    className="text-lb-muted hover:text-lb-ink transition-colors shrink-0"
                  >
                    <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 ml-9 space-y-2.5">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] px-2 py-1 rounded-full bg-lb-surface border border-lb-border text-lb-muted">
                        {s.type === 'video' ? '📹 Video' : '📞 Audio'}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-lb-surface border border-lb-border text-lb-muted">
                        ⏱ {s.duration}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-lb-surface border border-lb-border text-lb-muted">
                        💰 {s.price}
                      </span>
                    </div>

                    <div className="rounded-lg bg-lb-surface border border-lb-border p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-lb-muted uppercase tracking-wider">Session notes</span>
                        {!isEditing && (
                          <button
                            onClick={() => setEditingId(s.id)}
                            className="text-[10px] text-[#534AB7] hover:underline"
                          >
                            {notes[s.id] || s.hasNotes ? 'Edit' : '+ Add notes'}
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <textarea
                            autoFocus
                            aria-label="Session notes"
                            defaultValue={notes[s.id] || ''}
                            placeholder="e.g. medical terms used, client preferred terminology, follow-up needed..."
                            className="w-full text-[11px] text-lb-ink bg-white border border-lb-border rounded-md p-2 resize-none focus:outline-none focus:border-[#7F77DD]"
                            rows={3}
                            onBlur={(e) => {
                              setNotes(prev => ({ ...prev, [s.id]: e.target.value }))
                              setEditingId(null)
                            }}
                          />
                          <p className="text-[9px] text-lb-subtle">Click outside to save</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-lb-muted italic">
                          {notes[s.id] || (s.hasNotes ? 'Notes saved from session.' : 'No notes yet.')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-[#FCEBEB] text-[#A32D2D] hover:bg-[#FCEBEB] transition-colors">
                        Report issue
                      </button>
                      <button className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-lb-border text-lb-muted hover:bg-lb-surface transition-colors">
                        View full transcript
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
