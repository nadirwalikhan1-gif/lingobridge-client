import { Video, Phone, ChevronRight } from 'lucide-react'

const MOCK_SESSIONS = [
  { id: 1, fromLang: 'English', toLang: 'Spanish', duration: '30 min', type: 'video', status: 'Completed', price: '$12.00', time: 'Today, 10:30 AM',     avatar: 'JD' },
  { id: 2, fromLang: 'Urdu',    toLang: 'English', duration: '15 min', type: 'audio', status: 'Completed', price: '$6.00',  time: 'Today, 09:15 AM',     avatar: 'AK' },
  { id: 3, fromLang: 'English', toLang: 'French',  duration: '45 min', type: 'video', status: 'Completed', price: '$18.00', time: 'Yesterday, 07:45 PM', avatar: 'SL' },
]

const STATUS_STYLES = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-red-50 text-red-700',
  Pending:   'bg-amber-50 text-amber-700',
}

export default function RecentSessions({ sessions = MOCK_SESSIONS }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Recent Sessions</h3>
        <button className="text-xs font-medium text-interpreter-accent hover:opacity-80 transition-opacity">
          View All
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">No sessions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-slate-600">{s.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-slate-800">{s.fromLang} → {s.toLang}</p>
                  {s.type === 'video'
                    ? <Video className="w-3 h-3 text-interpreter-accent flex-shrink-0" />
                    : <Phone className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  }
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{s.duration} · {s.time}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-slate-800">{s.price}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLES[s.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {s.status}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}