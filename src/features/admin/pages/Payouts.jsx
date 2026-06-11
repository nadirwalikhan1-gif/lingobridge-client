// Payouts.jsx — Admin payout management
// Real-time via socket. Filters, bulk approve, export.

import { useState, useMemo } from 'react'
import { useAdminApi } from '../../hooks/useAdminApi'
import { useAdminSocket } from '../../hooks/useAdminSocket'
import * as api from '../../api/admin'
import ErrorState from '../../../components/ui/ErrorState'
const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected']

function parseAmount(amount) {
  if (typeof amount === 'number') return amount
  if (typeof amount === 'string') {
    const num = parseFloat(amount.replace(/[$,]/g, ''))
    return isNaN(num) ? 0 : num
  }
  return 0
}

export default function Payouts() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [pendingIds, setPendingIds] = useState(new Set())
  const [selectedIds, setSelectedIds] = useState(new Set())

  const { data: payouts, isLoading, error, refetch } = useAdminApi(() => api.fetchPayouts(), [])
  const { emit } = useAdminSocket()

  const filtered = useMemo(() => {
    if (!payouts) return []
    return payouts.filter(p => {
      const matchStatus = filter === 'All' || p.status === filter.toLowerCase()
      const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase())
        || p.email?.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [payouts, filter, search])

  const pendingTotal = useMemo(() =>
    payouts?.filter(p => p.status === 'pending').reduce((s, p) => s + parseAmount(p.amount), 0) ?? 0,
  [payouts])

  const approvedTotal = useMemo(() =>
    payouts?.filter(p => p.status === 'approved').reduce((s, p) => s + parseAmount(p.amount), 0) ?? 0,
  [payouts])

  const handleApprove = (id) => {
    setPendingIds(prev => new Set(prev).add(id))
    emit('admin-approve-payout', { payoutId: id })
  }

  const handleBulkApprove = () => {
    selectedIds.forEach(id => handleApprove(id))
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
      setSelectedIds(new Set(filtered.map(p => p.id)))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-lb-border rounded w-32 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-lb-border rounded-lg animate-pulse" />)}
        </div>
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
          <p className="text-xs text-lb-muted">Financial operations</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Payouts</h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkApprove}
              className="text-[11px] px-3 py-1.5 rounded bg-[#7F77DD] text-white font-medium hover:bg-[#534AB7] transition-colors"
            >
              Approve {selectedIds.size} selected
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: 'Pending total', value: `$${pendingTotal.toFixed(2)}`, accent: true },
          { label: 'Approved total', value: `$${approvedTotal.toFixed(2)}`, accent: false },
          { label: 'This week', value: `$${(pendingTotal + approvedTotal).toFixed(2)}`, accent: false },
          { label: 'Interpreters', value: String(payouts?.length ?? 0), accent: false },
        ].map(c => (
          <div key={c.label} className={`rounded-lg px-4 py-3.5 ${c.accent ? 'bg-[#EEEDFE]' : 'bg-lb-surface'}`}>
            <p className={`text-[11px] mb-1.5 ${c.accent ? 'text-[#534AB7]' : 'text-lb-muted'}`}>{c.label}</p>
            <p className={`text-[22px] font-medium leading-none ${c.accent ? 'text-[#26215C]' : 'text-lb-ink'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
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
        <input
          type="text"
          placeholder="Search interpreter…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-[11px] border border-lb-border rounded px-3 py-1.5 bg-white text-lb-ink placeholder:text-lb-subtle focus:outline-none focus:border-[#7F77DD] w-52"
        />
      </div>

      <div className="lb-card">
        {payouts?.length === 0 ? (
          <p className="text-[12px] text-lb-muted text-center py-8">No payouts in queue</p>
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
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Interpreter</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Period</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Sessions</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Amount</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Status</th>
                  <th className="text-left text-[10px] font-medium text-lb-muted uppercase px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const isPending = pendingIds.has(p.id)
                  const isSelected = selectedIds.has(p.id)

                  return (
                    <tr key={p.id} className={`border-b border-lb-border last:border-0 ${isSelected ? 'bg-[#EEEDFE]/30' : ''}`}>
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(p.id)}
                          className="w-3.5 h-3.5 rounded border-lb-border"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[10px] font-medium text-[#0F6E56]">
                            {p.initials}
                          </div>
                          <div>
                            <p className="text-[12px] font-medium text-lb-ink">{p.name}</p>
                            <p className="text-[10px] text-lb-muted">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-[12px] text-lb-ink">{p.period}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-[12px] text-lb-ink">{p.sessions}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-[12px] font-medium text-[#26215C]">{p.amount}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full ${
                          p.status === 'pending'
                            ? 'bg-[#FAEEDA] text-[#BA7517]'
                            : p.status === 'approved'
                            ? 'bg-[#E1F5EE] text-[#0F6E56]'
                            : 'bg-lb-surface text-lb-muted'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={isPending}
                            className="text-[10px] px-2.5 py-1 rounded bg-[#E1F5EE] text-[#0F6E56] font-medium hover:bg-[#c8ede2] transition-colors disabled:opacity-50"
                          >
                            {isPending ? '…' : 'Approve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && payouts?.length > 0 && (
          <p className="text-[12px] text-lb-muted text-center py-8">No payouts match this filter</p>
        )}
      </div>
    </div>
  )
}