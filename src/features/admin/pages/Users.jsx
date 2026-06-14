// src/features/admin/pages/Users.jsx
// Wired to real API. Uses React Query with 30s staleTime.

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import ErrorState from '../../../components/ui/ErrorState'

const STATUS_CFG = {
  active:   { cls: 'bg-[#E1F5EE] text-[#0F6E56]',  dot: 'bg-[#1D9E75]' },
  inactive: { cls: 'bg-lb-surface text-lb-muted',   dot: 'bg-lb-border'  },
  pending:  { cls: 'bg-[#FFF8E6] text-[#BA7517]',  dot: 'bg-[#BA7517]' },
}

const ROLE_CFG = {
  client:      { cls: 'bg-[#EEEDFE] text-[#534AB7]', label: 'Client'      },
  interpreter: { cls: 'bg-[#EAF3DE] text-[#3B6D11]', label: 'Interpreter' },
}

const FILTERS = ['All', 'Clients', 'Interpreters', 'Pending']

export default function Users() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [approvingId, setApprovingId] = useState(null)

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/v1/admin/users'),
    staleTime: 30000,
  })

  const activeCount  = useMemo(() => users?.filter(u => u.status === 'active').length ?? 0, [users])
  const pendingCount = useMemo(() => users?.filter(u => u.status === 'pending').length ?? 0, [users])

  const filtered = useMemo(() => {
    if (!users) return []
    return users.filter(u => {
      const matchRole = filter === 'All'
        || (filter === 'Clients'      && u.role === 'client')
        || (filter === 'Interpreters' && u.role === 'interpreter')
        || (filter === 'Pending'      && u.status === 'pending')
      const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase())
        || u.email?.toLowerCase().includes(search.toLowerCase())
      return matchRole && matchSearch
    })
  }, [users, filter, search])

  const handleApprove = async (id) => {
    setApprovingId(id)
    try {
      await api.post(`/v1/admin/users/${id}/approve`)
      refetch()
    } catch (err) {
      console.error('Failed to approve user:', err)
    } finally {
      setApprovingId(null)
    }
  }

  const handleInvite = async () => {
    const email = window.prompt('Enter email to invite:')
    if (!email) return
    try {
      await api.post('/v1/admin/users/invite', { email, role: 'interpreter' })
      refetch()
    } catch (err) {
      console.error('Failed to invite user:', err)
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
          <p className="text-xs text-lb-muted">Platform operations</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Users</h1>
        </div>
        <button
          onClick={handleInvite}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#7F77DD] text-white hover:bg-[#534AB7] transition-colors"
        >
          + Invite user
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: 'Total users',    value: String(users?.length ?? 0),      delta: '+12 this week', accent: true },
          { label: 'Active',         value: String(activeCount),              delta: 'using platform', accent: true },
          { label: 'Pending review', value: String(pendingCount),             delta: 'awaiting approval', accent: false },
          { label: 'New signups',    value: '0',                              delta: 'this week', accent: false },
        ].map(c => (
          <div key={c.label} className={`rounded-lg px-4 py-3.5 ${c.accent ? 'bg-[#EEEDFE]' : 'bg-lb-surface'}`}>
            <p className={`text-[11px] mb-1.5 ${c.accent ? 'text-[#534AB7]' : 'text-lb-muted'}`}>{c.label}</p>
            <p className={`text-[22px] font-medium leading-none ${c.accent ? 'text-[#26215C]' : 'text-lb-ink'}`}>{c.value}</p>
            <p className="text-[11px] mt-1.5 text-[#0F6E56]">? {c.delta}</p>
          </div>
        ))}
      </div>

      <div className="lb-card">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
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
                {f === 'Pending' && pendingCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#BA7517] text-white text-[9px]">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search name or email�"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-[11px] border border-lb-border rounded px-3 py-1.5 bg-white text-lb-ink placeholder:text-lb-subtle focus:outline-none focus:border-[#7F77DD] w-52"
          />
        </div>

        {users?.length === 0 ? (
          <p className="text-[12px] text-lb-muted text-center py-8">No users on platform</p>
        ) : (
          <div className="divide-y divide-lb-border">
            {filtered.map(u => {
              const sc = STATUS_CFG[u.status]
              const rc = ROLE_CFG[u.role]
              return (
                <div key={u.id} className="flex items-center gap-3 py-2.5">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[11px] font-medium text-[#534AB7]">
                      {u.initials}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${sc.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-medium text-lb-ink">{u.name}</p>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${rc.cls}`}>{rc.label}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${sc.cls} capitalize`}>{u.status}</span>
                    </div>
                    <p className="text-[10px] text-lb-muted mt-0.5">{u.email} � Joined {u.joined}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 shrink-0 text-right">
                    <div>
                      <p className="text-[12px] font-medium text-lb-ink">{u.sessions}</p>
                      <p className="text-[10px] text-lb-muted">sessions</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-lb-ink">{u.spent}</p>
                      <p className="text-[10px] text-lb-muted">{u.role === 'client' ? 'spent' : 'earned'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {u.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(u.id)}
                        disabled={approvingId === u.id}
                        className="text-[10px] px-2 py-1 rounded bg-[#E1F5EE] text-[#0F6E56] font-medium border-none hover:bg-[#c8ede2] transition-colors disabled:opacity-50"
                      >
                        {approvingId === u.id ? '�' : 'Approve'}
                      </button>
                    )}
                    <button className="text-[10px] px-2 py-1 rounded border border-lb-border bg-white text-lb-muted hover:bg-lb-surface transition-colors">
                      View
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && users?.length > 0 && (
          <p className="text-[12px] text-lb-muted text-center py-8">No users match this filter</p>
        )}
      </div>
    </div>
  )
}
