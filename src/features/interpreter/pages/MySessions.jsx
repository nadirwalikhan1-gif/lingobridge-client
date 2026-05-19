import { useState } from 'react'

const sessions = [
  { id: 1, client: 'John Doe',     fromLang: 'English', toLang: 'Spanish', duration: '30 min', type: 'video', status: 'completed', date: 'May 15, 2026', time: '10:30 AM', rating: 5,    earnings: 45.00,  avatar: 'JD' },
  { id: 2, client: 'Sarah Smith',  fromLang: 'Arabic',  toLang: 'English', duration: '45 min', type: 'audio', status: 'completed', date: 'May 14, 2026', time: '2:15 PM',  rating: 4,    earnings: 32.50,  avatar: 'SS' },
  { id: 3, client: 'Ali Khan',     fromLang: 'Urdu',    toLang: 'English', duration: '60 min', type: 'video', status: 'completed', date: 'May 14, 2026', time: '11:00 AM', rating: 5,    earnings: 67.00,  avatar: 'AK' },
  { id: 4, client: 'Maria Garcia', fromLang: 'Spanish', toLang: 'English', duration: '15 min', type: 'audio', status: 'completed', date: 'May 13, 2026', time: '4:30 PM',  rating: 5,    earnings: 28.00,  avatar: 'MG' },
  { id: 5, client: 'David Lee',    fromLang: 'English', toLang: 'Chinese', duration: '30 min', type: 'video', status: 'cancelled', date: 'May 12, 2026', time: '9:00 AM',  rating: null, earnings: 0,      avatar: 'DL' },
]

const FILTERS = ['All', 'Completed', 'Cancelled', 'Pending']

const STATUS = {
  completed: { label: 'Completed', cls: 'bg-[#EAF3DE] text-[#3B6D11]' },
  cancelled:  { label: 'Cancelled', cls: 'bg-[#FCEBEB] text-[#A32D2D]' },
  pending:    { label: 'Pending',   cls: 'bg-[#FAEEDA] text-[#854F0B]' },
}

export default function MySessions() {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? sessions : sessions.filter(s => s.status === filter.toLowerCase())

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-lg font-medium text-lb-ink">My sessions</h1>
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
      </div>

      <div className="lb-card divide-y divide-lb-border">
        {filtered.map((s) => (
          <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-medium ${
              s.status === 'completed' ? 'bg-[#EAF3DE] text-[#3B6D11]' :
              s.status === 'cancelled' ? 'bg-[#FCEBEB] text-[#A32D2D]' : 'bg-[#FAEEDA] text-[#854F0B]'
            }`}>
              {s.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-medium text-lb-ink">{s.client}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS[s.status]?.cls}`}>
                  {STATUS[s.status]?.label}
                </span>
              </div>
              <p className="text-[11px] text-lb-muted mt-0.5">
                {s.fromLang} → {s.toLang} · {s.type === 'video' ? 'Video' : 'Audio'} · {s.duration} · {s.time}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[13px] font-medium text-lb-ink">${s.earnings.toFixed(2)}</p>
              {s.rating && (
                <p className="text-[11px] text-[#BA7517] mt-0.5">{'★'.repeat(s.rating)}{'☆'.repeat(5 - s.rating)}</p>
              )}
              <p className="text-[10px] text-lb-subtle mt-0.5">{s.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
