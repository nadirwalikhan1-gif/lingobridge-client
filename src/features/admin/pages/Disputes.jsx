// Users.jsx — Admin user management
// Matches interpreter MySessions list pattern — same row anatomy, same filter bar

import { useState } from 'react'

const USERS = [
  { id: 1, name: 'John Doe',       initials: 'JD', email: 'john.doe@email.com',      role: 'client',      status: 'active',   sessions: 24, spent: '$320.50',  joined: 'Jan 12, 2025' },
  { id: 2, name: 'Maria Garcia',   initials: 'MG', email: 'maria.g@email.com',       role: 'interpreter', status: 'active',   sessions: 128, spent: '—',       joined: 'Jan 15, 2025' },
  { id: 3, name: 'Ali Khan',       initials: 'AK', email: 'ali.khan@email.com',      role: 'client',      status: 'active',   sessions: 9,  spent: '$124.00',  joined: 'Feb 1, 2025' },
  { id: 4, name: 'Sophia Brown',   initials: 'SB', email: 'sophia.b@email.com',      role: 'client',      status: 'inactive', sessions: 2,  spent: '$18.00',   joined: 'Mar 5, 2025' },
  { id: 5, name: 'Ahmed Hassan',   initials: 'AH', email: 'ahmed.h@email.com',       role: 'interpreter', status: 'pending',  sessions: 0,  spent: '—',        joined: 'May 14, 2025' },
  { id: 6, name: 'Clara Reyes',    initials: 'CR', email: 'clara.r@email.com',       role: 'client',      status: 'active',   sessions: 41, spent: '$612.00',  joined: 'Jan 20, 2025' },
  { id: 7, name: 'Tom Hughes',     initials: 'TH', email: 'tom.h@email.com',         role: 'client',      status: 'active',   sessions: 7,  spent: '$89.50',   joined: 'Apr 8, 2025' },
  { id: 8, name: 'Priya Sharma',   initials: 'PS', email: 'priya.s@email.com',       role: 'interpreter', status: 'active',   sessions: 42, spent: '—',        joined: 'Mar 2, 2025' },
]

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

  const filtered = USERS.filter(u => {
    const matchRole = filter === 'All'
      || (filter === 'Clients'      && u.role === 'client')
      || (filter === 'Interpreters' && u.role === 'interpreter')
      || (filter === 'Pending'      && u.status === 'pending')
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
      || u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const activeCount  = USERS.filter(u => u.status === 'active').length
  const pendingCount = USERS.filter(u => u.status === 'pending').length

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Platform operations</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Users</h1>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#7F77DD] text-white hover:bg-[#534AB7] transition-colors">
          + Invite user
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: 'Total users',   value: String(USERS.length),      delta: '+12 this week', accent: true },
          { label: 'Active',        value: String(activeCount),        delta: 'using platform', accent: true },
          { label: 'Pending review',value: String(pendingCount),       delta: 'awaiting approval', accent: false },
          { label: 'New signups',   value: '156',                      delta: 'this week', accent: false },
        ].map(c => (
          <div key={c.label} className={`rounded-lg px-4 py-3.5 ${c.accent ? 'bg-[#EEEDFE]' : 'bg-lb-surface'}`}>
            <p className={`text-[11px] mb-1.5 ${c.accent ? 'text-[#534AB7]' : 'text-lb-muted'}`}>{c.label}</p>
            <p className={`text-[22px] font-medium leading-none ${c.accent ? 'text-[#26215C]' : 'text-lb-ink'}`}>{c.value}</p>
            <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {c.delta}</p>
          </div>
        ))}
      </div>

      {/* List card */}
      <div className="lb-card">
        {/* Toolbar */}
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
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-[11px] border border-lb-border rounded px-3 py-1.5 bg-white text-lb-ink placeholder:text-lb-subtle focus:outline-none focus:border-[#7F77DD] w-52"
          />
        </div>

        {/* Rows */}
        <div className="divide-y divide-lb-border">
          {filtered.map(u => {
            const sc = STATUS_CFG[u.status]
            const rc = ROLE_CFG[u.role]
            return (
              <div key={u.id} className="flex items-center gap-3 py-2.5">
                {/* Avatar + presence */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[11px] font-medium text-[#534AB7]">
                    {u.initials}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${sc.dot}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-medium text-lb-ink">{u.name}</p>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${rc.cls}`}>{rc.label}</span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${sc.cls} capitalize`}>{u.status}</span>
                  </div>
                  <p className="text-[10px] text-lb-muted mt-0.5">{u.email} · Joined {u.joined}</p>
                </div>

                {/* Stats */}
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

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  {u.status === 'pending' && (
                    <button className="text-[10px] px-2 py-1 rounded bg-[#E1F5EE] text-[#0F6E56] font-medium border-none hover:bg-[#c8ede2] transition-colors">
                      Approve
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

        {filtered.length === 0 && (
          <p className="text-[12px] text-lb-muted text-center py-8">No users match this filter</p>
        )}
      </div>
    </div>
  )
}