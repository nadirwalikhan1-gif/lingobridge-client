import { useState } from 'react'
import { Video, Phone, Clock, Star, Filter } from 'lucide-react'

const sessions = [
  { id: 1, client: 'John Doe',     fromLang: 'English', toLang: 'Spanish', duration: '30 min', type: 'video', status: 'completed', date: 'May 15, 2026', time: '10:30 AM', rating: 5,    earnings: 45.00, avatar: 'JD' },
  { id: 2, client: 'Sarah Smith',  fromLang: 'Arabic',  toLang: 'English', duration: '45 min', type: 'audio', status: 'completed', date: 'May 14, 2026', time: '2:15 PM',  rating: 4,    earnings: 32.50, avatar: 'SS' },
  { id: 3, client: 'Ali Khan',     fromLang: 'Urdu',    toLang: 'English', duration: '60 min', type: 'video', status: 'completed', date: 'May 14, 2026', time: '11:00 AM', rating: 5,    earnings: 67.00, avatar: 'AK' },
  { id: 4, client: 'Maria Garcia', fromLang: 'Spanish', toLang: 'English', duration: '15 min', type: 'audio', status: 'completed', date: 'May 13, 2026', time: '4:30 PM',  rating: 5,    earnings: 28.00, avatar: 'MG' },
  { id: 5, client: 'David Lee',    fromLang: 'English', toLang: 'Chinese', duration: '30 min', type: 'video', status: 'cancelled', date: 'May 12, 2026', time: '9:00 AM',  rating: null, earnings: 0,     avatar: 'DL' },
]

const filters = ['All', 'Completed', 'Cancelled', 'Pending']

const STATUS_STYLES = {
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled:  'bg-red-50 text-red-700',
  pending:    'bg-amber-50 text-amber-700',
}

export default function MySessions() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredSessions = activeFilter === 'All'
    ? sessions
    : sessions.filter(s => s.status === activeFilter.toLowerCase())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">My Sessions</h1>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                  activeFilter === f
                    ? 'bg-interpreter-accent text-white border-interpreter-accent'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="space-y-2">
          {filteredSessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all">
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                s.status === 'completed' ? 'bg-emerald-50' :
                s.status === 'cancelled' ? 'bg-red-50' : 'bg-amber-50'
              }`}>
                <span className={`text-xs font-semibold ${
                  s.status === 'completed' ? 'text-emerald-600' :
                  s.status === 'cancelled' ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {s.avatar}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-800">{s.client}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLES[s.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span>{s.fromLang} → {s.toLang}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    {s.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                    {s.duration}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {s.time}
                  </span>
                </div>
              </div>

              {/* Right */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-slate-800">${s.earnings.toFixed(2)}</p>
                {s.rating && (
                  <div className="flex items-center gap-0.5 mt-0.5 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < s.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-0.5">{s.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}