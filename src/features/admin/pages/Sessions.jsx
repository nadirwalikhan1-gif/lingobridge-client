// src/features/admin/pages/Sessions.jsx
// Wired to real API. Uses React Query with 30s staleTime.

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import ErrorState from '../../components/ui/ErrorState'

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

  const { data: sessions, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'sessions'],
    queryFn: () => api.get('/v1/admin/sessions'),
    staleTime: 30000,
  })

  const filtered = useMemo(() => sessions?.filter((s) => filter === 'all' || s.status === filter) ?? [], [sessions, filter])
  const liveCount = useMemo(() => sessions?.filter((s) => s.status === 'live' || s.status === 'escalated').length ?? 0, [sessions])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-lb-border rounded w-32 animate-pulse" />
        <div className="h-8 bg-lb-border rounded w-64 animate-pulse" />
        <div className="h-96 bg-lb-border rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />
  }

  return (
    <div className="space-y-3">
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

      <StatusFilter value={filter} onChange={setFilter} />

      <div className="lb-card">
        {sessions?.length === 0 ? (
          <p className="text-[12px] text-lb-muted text-center py-8">No sessions recorded</p>
        ) : (
          <div className="divide-y divide-lb-border">
            {filtered.map((s) => {
              const cfg = statusConfig[s.status]
              return (
                <div key={s.id} className="flex items-center gap-3 py-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-medium text-[#534AB7] shrink-0">
                    {s.interpreterInitials}
                  </div>
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
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-lb-muted">{s.startedAt} · {s.elapsedMins}m</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.pill}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && sessions?.length > 0 && (
          <p className="text-[12px] text-lb-muted text-center py-8">No sessions match this filter</p>
        )}
      </div>
    </div>
  )
}