// Sessions.jsx — Admin full live sessions page
// Refactored to match LingoBridge design language
// Operational view: session state, interpreter, client, category, duration

import { useState, useEffect } from 'react'

const MOCK_ALL_SESSIONS = [
  { id: 1, ref: '#5021', interpreterInitials: 'MG', interpreter: 'Maria Gonzalez', client: 'John D.',    fromLang: 'Spanish',  toLang: 'English', category: 'Medical',     type: 'video', startedAt: '10:14 AM', elapsedMins: 18, status: 'live' },
  { id: 2, ref: '#5019', interpreterInitials: 'AK', interpreter: 'Ali Khan',       client: 'Saima R.',   fromLang: 'Urdu',     toLang: 'English', category: 'Legal',       type: 'audio', startedAt: '09:52 AM', elapsedMins: 34, status: 'live' },
  { id: 3, ref: '#5017', interpreterInitials: 'SC', interpreter: 'Sarah Chen',     client: 'ICU Team',   fromLang: 'Mandarin', toLang: 'English', category: 'Emergency',   type: 'video', startedAt: '10:29 AM', elapsedMins: 2,  status: 'escalated' },
  { id: 4, ref: '#5015', interpreterInitials: 'JR', interpreter: 'Jamal Rahimi',   client: 'Parveen S.', fromLang: 'Dari',     toLang: 'English', category: 'Immigration', type: 'audio', startedAt: '10:24 AM', elapsedMins: 7,  status: 'hold' },
  { id: 5, ref: '#5010', interpreterInitials: 'FA', interpreter: 'Fatima Al-Said', client: 'Ahmad K.',   fromLang: 'Arabic',   toLang: 'English', category: 'Medical',     type: 'video', startedAt: '10:00 AM', elapsedMins: 31, status: 'completed' },
  { id: 6, ref: '#5008', interpreterInitials: 'PT', interpreter: 'Pavel Tran',     client: 'Linh N.',    fromLang: 'Vietnamese', toLang: 'English', category: 'General',  type: 'audio', startedAt: '09:30 AM', elapsedMins: 15, status: 'completed' },
]

const statusConfig = {
  live:      { pill: 'bg-[#E1F5EE] text-[#0F6E56]', label: 'Live',      dot: 'bg-[#1D9E75] animate-pulse' },
  escalated: { pill: 'bg-[#FCEBEB] text-[#A32D2D]', label: 'Escalated', dot: 'bg-[#E24B4A] animate-pulse' },
  hold:      { pill: 'bg-[#EEEDFE] text-[#534AB7]', label: 'On hold',   dot: 'bg-[#7F77DD]' },
  completed: { pill: 'bg-lb-surface text-lb-muted',  label: 'Done',      dot: 'bg-lb-muted' },
}

function StatusFilter({ value, onChange }) {
  const filters = ['all', 'live', 'escalated', 'hold', 'completed']
  return (
    <div className="flex items-center gap-1.5">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize transition-colors ${
            value === f
              ? 'bg-[#7F77DD] text-white'
              : 'bg-lb-surface text-lb-muted border border-lb-border hover:border-[#7F77DD]'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}

export default function AdminSessions() {
  const [filter, setFilter] = useState('all')
  const sessions = MOCK_ALL_SESSIONS.filter((s) => filter === 'all' || s.status === filter)
  const liveCount = MOCK_ALL_SESSIONS.filter((s) => s.status === 'live' || s.status === 'escalated').length

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Real-time monitoring</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Sessions</h1>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#E1F5EE] text-[#0F6E56]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse inline-block" />
          {liveCount} live now
        </div>
      </div>

      {/* Filter */}
      <StatusFilter value={filter} onChange={setFilter} />

      {/* Sessions table card */}
      <div className="lb-card">
        <div className="divide-y divide-lb-border">
          {sessions.map((s) => {
            const cfg = statusConfig[s.status]
            return (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                {/* Dot */}
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />

                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-medium text-[#534AB7] shrink-0">
                  {s.interpreterInitials}
                </div>

                {/* Primary info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium text-lb-ink">
                      {s.fromLang} → {s.toLang}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">
                      {s.category}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-lb-muted mt-0.5">
                    {s.interpreter} · {s.client} · {s.ref}
                  </p>
                </div>

                {/* Meta */}
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-lb-muted">{s.startedAt} · {s.elapsedMins}m</p>
                </div>

                {/* Status */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.pill}`}>
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}