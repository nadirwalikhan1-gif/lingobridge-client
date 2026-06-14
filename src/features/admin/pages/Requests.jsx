// src/features/admin/pages/Requests.jsx
// Real-time via socket. Filters, search, bulk actions, session history.

import { useState, useMemo } from 'react'
import { useAdminData } from '../context/AdminDataContext'
import { getSocket } from '../../../lib/socket' // FIX: added missing import
import ErrorState from '../../../components/ui/ErrorState'

function VideoIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    </svg>
  )
}

function AudioIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function fmtDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

const FILTERS = ['All', 'Pending', 'Assigned', 'Expired', 'Cancelled']

export default function Requests() {
  const { requestQueue, isSocketReady } = useAdminData()
  // FIX: removed top-level getSocket() call — was missing import + stale socket on reconnect
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [pendingIds, setPendingIds] = useState(new Set())
  const [selectedIds, setSelectedIds] = useState(new Set())

  const filtered = useMemo(() => {
    return requestQueue.filter(r => {
      const matchStatus = filter === 'All'
        || (filter === 'Pending'   && r.status === 'pending')
        || (filter === 'Assigned'  && r.status === 'assigned')
        || (filter === 'Expired'   && r.status === 'expired')
        || (filter === 'Cancelled' && r.status === 'cancelled')
      const matchSearch = r.client?.toLowerCase().includes(search.toLowerCase())
        || r.fromLang?.toLowerCase().includes(search.toLowerCase())
        || r.toLang?.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [requestQueue, filter, search])

  // FIX: getSocket() called at action time — always gets the live socket
  const handleAssign = (id) => {
    setPendingIds(prev => new Set(prev).add(id))
    getSocket()?.emit('admin-assign-interpreter', { requestId: id })
  }

  const handleSkip = (id) => {
    setPendingIds(prev => new Set(prev).add(id))
    getSocket()?.emit('admin-skip-request', { requestId: id })
  }

  const handleBulkSkip = () => {
    selectedIds.forEach(id => handleSkip(id))
    setSelectedIds(new Set())
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)))
    }
  }

  if (!isSocketReady) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-lb-border rounded w-32 animate-pulse" />
        <div className="h-8 bg-lb-border rounded w-64 animate-pulse" />
        <div className="h-96 bg-lb-border rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Real-time dispatch</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">
            Request Queue
            {requestQueue.length > 0 && (
              <span className="ml-2 text-[14px] text-lb-muted">({requestQueue.length} pending)</span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkSkip}
              className="text-[11px] px-3 py-1.5 rounded border border-lb-border bg-white text-lb-muted hover:bg-lb-surface transition-colors"
            >
              Skip {selectedIds.size} selected
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {FILTERS.map(f => (
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
        <input
          type="text"
          placeholder="Search client or language…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-[11px] border border-lb-border rounded px-3 py-1.5 bg-white text-lb-ink placeholder:text-lb-subtle focus:outline-none focus:border-[#7F77DD] w-52"
        />
      </div>

      <div className="lb-card">
        {requestQueue.length === 0 ? (
          <p className="text-[12px] text-lb-muted text-center py-8">No requests in queue</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lb-border">
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2 w-8">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={selectAll}
                      className="w-3.5 h-3.5 rounded border-lb-border"
                    />
                  </th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Request</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Client</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Type</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Price</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Timer</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Status</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const isPending = pendingIds.has(r.id)
                  const isSelected = selectedIds.has(r.id)
                  const isUrgent = (r.expiresIn ?? 0) < 120
                  const isCritical = (r.expiresIn ?? 0) < 60
                  const noMatch = r.availableInterpreters === 0

                  return (
                    <tr key={r.id} className={`border-b border-lb-border last:border-0 ${isSelected ? 'bg-[#EEEDFE]/30' : ''}`}>
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(r.id)}
                          className="w-3.5 h-3.5 rounded border-lb-border"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="text-[12px] font-medium text-lb-ink">
                            {r.fromLang} ? {r.toLang}
                          </p>
                          <p className="text-[10px] text-lb-muted">{r.category} · {r.duration}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-[12px] text-lb-ink">{r.client}</p>
                        <p className="text-[10px] text-lb-muted">{r.timeAgo}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-lb-border bg-lb-surface text-lb-muted">
                          {r.type === 'video' ? <VideoIcon /> : <AudioIcon />}
                          {r.type === 'video' ? 'Video' : 'Audio'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-[12px] font-medium text-[#26215C]">{r.price}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-semibold font-mono tabular-nums ${
                          isCritical ? 'text-[#A32D2D] animate-pulse' : isUrgent ? 'text-[#A32D2D]' : 'text-[#0F6E56]'
                        }`}>
                          {fmtDuration(r.expiresIn ?? 0)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full ${
                          r.status === 'pending'
                            ? 'bg-[#FAEEDA] text-[#BA7517]'
                            : r.status === 'assigned'
                            ? 'bg-[#E1F5EE] text-[#0F6E56]'
                            : 'bg-lb-surface text-lb-muted'
                        }`}>
                          {r.status || 'Pending'}
                        </span>
                        {noMatch && (
                          <span className="ml-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#A32D2D]">
                            No match
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleAssign(r.id)}
                            disabled={isPending}
                            className={`text-[10px] px-2.5 py-1 rounded text-white font-semibold transition-colors disabled:opacity-50 ${
                              noMatch
                                ? 'bg-[#A32D2D] hover:bg-[#791F1F]'
                                : 'bg-[#7F77DD] hover:bg-[#534AB7]'
                            }`}
                          >
                            {isPending ? '…' : noMatch ? 'Force' : 'Assign'}
                          </button>
                          <button
                            onClick={() => handleSkip(r.id)}
                            disabled={isPending}
                            className="text-[10px] px-2.5 py-1 rounded border border-lb-border bg-white text-lb-muted hover:bg-lb-surface transition-colors disabled:opacity-50"
                          >
                            {isPending ? '…' : 'Skip'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && requestQueue.length > 0 && (
          <p className="text-[12px] text-lb-muted text-center py-8">No requests match this filter</p>
        )}
      </div>
    </div>
  )
}
