// Interpreters.jsx — Admin interpreter management
// Matches interpreter/client list and filter patterns

import { useState } from 'react'

const INTERPRETERS = [
  { id: 1, name: 'Khalid Ahmadzai',   initials: 'KA', email: 'khalid@linguabridge.io', langs: ['Pashto Eastern', 'Pashto Western'],  categories: ['Medical', 'Emergency'],   status: 'busy',    sessions: 128, rating: 4.9, earnings: '$1,845', joined: 'Jan 2025' },
  { id: 2, name: 'Rajinder Singh',     initials: 'RS', email: 'rajinder@linguabridge.io', langs: ['Punjabi Gurmukhi'],   categories: ['Legal', 'Business'],      status: 'busy',    sessions: 97,  rating: 4.8, earnings: '$1,420', joined: 'Feb 2025' },
  { id: 3, name: 'Sadia Butt',          initials: 'SB', email: 'sadia@linguabridge.io',  langs: ['Punjabi Shahmukhi'],  categories: ['Medical'],                status: 'busy',    sessions: 86,  rating: 4.7, earnings: '$1,210', joined: 'Jan 2025' },
  { id: 4, name: 'Noorullah Wardak',    initials: 'NW', email: 'noorullah@linguabridge.io', langs: ['Pashto Eastern'],     categories: ['Immigration', 'Medical'], status: 'online',  sessions: 74,  rating: 4.9, earnings: '$980',   joined: 'Mar 2025' },
  { id: 5, name: 'Amrit Kaur',          initials: 'AK', email: 'amrit@linguabridge.io',  langs: ['Punjabi Gurmukhi'],   categories: ['Legal'],                  status: 'online',  sessions: 63,  rating: 4.6, earnings: '$850',   joined: 'Apr 2025' },
  { id: 6, name: 'Zarghona Shinwari',   initials: 'ZS', email: 'zarghona@linguabridge.io', langs: ['Pashto Eastern', 'Pashto Western'], categories: ['General'], status: 'offline', sessions: 55,  rating: 4.5, earnings: '$720',   joined: 'Mar 2025' },
  { id: 7, name: 'Imran Chaudhry',      initials: 'IC', email: 'imran@linguabridge.io',  langs: ['Punjabi Shahmukhi'],  categories: ['Medical'],                status: 'offline', sessions: 42,  rating: 4.3, earnings: '$560',   joined: 'May 2025' },
]

const STATUS_CFG = {
  busy:    { dot: 'bg-[#BA7517]',  pill: 'bg-[#FFF8E6] text-[#BA7517]',  label: 'In session' },
  online:  { dot: 'bg-[#1D9E75]',  pill: 'bg-[#E1F5EE] text-[#0F6E56]',  label: 'Available'  },
  offline: { dot: 'bg-lb-border',  pill: 'bg-lb-surface text-lb-muted',   label: 'Offline'    },
}

const FILTERS = ['All', 'Available', 'In session', 'Offline']

export default function Interpreters() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = INTERPRETERS.filter(i => {
    const matchStatus = filter === 'All'
      || (filter === 'Available'   && i.status === 'online')
      || (filter === 'In session'  && i.status === 'busy')
      || (filter === 'Offline'     && i.status === 'offline')
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase())
      || i.langs.some(l => l.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const online = INTERPRETERS.filter(i => i.status !== 'offline').length
  const busy   = INTERPRETERS.filter(i => i.status === 'busy').length

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Platform operations</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Interpreters</h1>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#7F77DD] text-white hover:bg-[#534AB7] transition-colors">
          + Invite interpreter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: 'Total interpreters', value: String(INTERPRETERS.length), delta: '+2 this week', accent: true },
          { label: 'Online now',         value: String(online),  delta: `${busy} in session`, accent: true },
          { label: 'Avg rating',         value: '4.7',           delta: '★ top quartile', accent: false },
          { label: 'Sessions today',     value: '24',            delta: '+6 vs yesterday', accent: false },
        ].map(c => (
          <div key={c.label} className={`rounded-lg px-4 py-3.5 ${c.accent ? 'bg-[#EEEDFE]' : 'bg-lb-surface'}`}>
            <p className={`text-[11px] mb-1.5 ${c.accent ? 'text-[#534AB7]' : 'text-lb-muted'}`}>{c.label}</p>
            <p className={`text-[22px] font-medium leading-none ${c.accent ? 'text-[#26215C]' : 'text-lb-ink'}`}>{c.value}</p>
            <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {c.delta}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="lb-card">
        {/* Controls */}
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
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search name or language…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-[11px] border border-lb-border rounded px-3 py-1.5 bg-white text-lb-ink placeholder:text-lb-subtle focus:outline-none focus:border-[#7F77DD] w-52"
          />
        </div>

        <div className="divide-y divide-lb-border">
          {filtered.map(i => {
            const sc = STATUS_CFG[i.status]
            return (
              <div key={i.id} className="flex items-center gap-3 py-3">
                {/* Avatar with presence */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[12px] font-medium text-[#534AB7]">
                    {i.initials}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${sc.dot}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-lb-ink">{i.name}</p>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${sc.pill}`}>{sc.label}</span>
                  </div>
                  <p className="text-[11px] text-lb-muted mt-0.5">{i.langs.join(' · ')} · {i.categories.join(', ')}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 shrink-0 text-right">
                  <div>
                    <p className="text-[12px] font-medium text-lb-ink">{i.sessions}</p>
                    <p className="text-[10px] text-lb-muted">sessions</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-[#BA7517]">★ {i.rating}</p>
                    <p className="text-[10px] text-lb-muted">rating</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-lb-ink">{i.earnings}</p>
                    <p className="text-[10px] text-lb-muted">total earned</p>
                  </div>
                </div>

                {/* Action */}
                <button className="text-[11px] px-2.5 py-1 rounded border border-lb-border bg-white text-lb-muted hover:bg-lb-surface transition-colors shrink-0">
                  View
                </button>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-[12px] text-lb-muted text-center py-8">No interpreters match this filter</p>
        )}
      </div>
    </div>
  )
}