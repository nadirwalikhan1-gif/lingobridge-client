// src/features/admin/pages/Disputes.jsx
// Wired to real API + socket actions. Uses React Query with 30s staleTime.

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSocket } from '../../lib/socket'
import api from '../../lib/api'
import ErrorState from '../../components/ui/ErrorState'

const STATUS_FILTERS = ['All', 'Open', 'Escalated', 'Resolved']

export default function Disputes() {
  const [filter, setFilter] = useState('All')
  const queryClient = useQueryClient()

  const { data: disputes, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'disputes'],
    queryFn: () => api.get('/v1/admin/disputes'),
    staleTime: 30000,
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, action }) => api.post(`/v1/admin/disputes/${id}/resolve`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] }),
  })

  const filtered = useMemo(() => {
    if (!disputes) return []
    return disputes.filter(d => {
      if (filter === 'All') return true
      if (filter === 'Open') return d.status === 'open'
      if (filter === 'Escalated') return d.status === 'escalated'
      if (filter === 'Resolved') return d.status === 'resolved'
      return true
    })
  }, [disputes, filter])

  const handleResolve = (id) => {
    if (!window.confirm('Resolve this dispute?')) return
    resolveMutation.mutate({ id, action: 'resolve' })
  }

  const handleEscalate = (id) => {
    if (!window.confirm('Escalate this dispute?')) return
    const socket = getSocket()
    if (socket) socket.emit('admin-escalate-dispute', { disputeId: id })
  }

  const handleRefund = (id) => {
    if (!window.confirm('Issue refund and resolve?')) return
    resolveMutation.mutate({ id, action: 'refund' })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-lb-border rounded w-32 animate-pulse" />
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
          <p className="text-xs text-lb-muted">Platform operations</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Disputes</h1>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1.5 text-[11px] font-medium rounded border transition-colors ${
              filter === f
                ? 'bg-[#7F77DD] text-white border-[#7F77DD]'
                : 'bg-white text-lb-muted border-lb-border hover:bg-lb-surface'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {disputes?.length === 0 ? (
        <div className="lb-card p-8">
          <p className="text-[12px] text-lb-muted text-center">No open disputes</p>
        </div>
      ) : (
        <div className="lb-card divide-y divide-lb-border">
          {filtered.map(d => (
            <div key={d.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-lb-ink">{d.title}</p>
                  <p className="text-[11px] text-lb-muted mt-0.5">
                    {d.ref} · {d.client}{d.interpreter ? ` · ${d.interpreter}` : ''}
                    {d.amount && ` · ${d.amount}`}
                  </p>
                  <p className="text-[10px] text-lb-subtle mt-1">{d.timeAgo}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  d.status === 'escalated'
                    ? 'bg-[#FCEBEB] text-[#A32D2D]'
                    : d.status === 'resolved'
                    ? 'bg-[#E1F5EE] text-[#0F6E56]'
                    : 'bg-[#FAEEDA] text-[#BA7517]'
                }`}>
                  {d.status === 'escalated' ? 'Escalated' : d.status === 'resolved' ? 'Resolved' : 'Open'}
                </span>
              </div>
              {d.status !== 'resolved' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleResolve(d.id)}
                    disabled={resolveMutation.isPending}
                    className="text-[10px] px-2.5 py-1 rounded bg-[#E1F5EE] text-[#0F6E56] font-medium hover:bg-[#c8ede2] transition-colors disabled:opacity-50"
                  >
                    {resolveMutation.isPending ? '…' : 'Resolve'}
                  </button>
                  <button
                    onClick={() => handleRefund(d.id)}
                    disabled={resolveMutation.isPending}
                    className="text-[10px] px-2.5 py-1 rounded bg-[#FCEBEB] text-[#A32D2D] font-medium hover:bg-[#fad8d8] transition-colors disabled:opacity-50"
                  >
                    Refund
                  </button>
                  <button
                    onClick={() => handleEscalate(d.id)}
                    className="text-[10px] px-2.5 py-1 rounded border border-lb-border bg-white text-lb-muted hover:bg-lb-surface transition-colors"
                  >
                    Escalate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && disputes?.length > 0 && (
        <p className="text-[12px] text-lb-muted text-center py-8">No disputes match this filter</p>
      )}
    </div>
  )
}