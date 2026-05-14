import { Video, Phone } from 'lucide-react'
import Badge from '../../../../components/ui/Badge'

const sessions = [
  { id: 1, fromLang: 'English', toLang: 'Spanish', duration: '30 min', type: 'video', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-700', price: '$12.00', time: 'Today, 10:30 AM', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 2, fromLang: 'Urdu', toLang: 'English', duration: '15 min', type: 'audio', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-700', price: '$6.00', time: 'Today, 09:15 AM', avatar: 'https://i.pravatar.cc/150?u=20' },
  { id: 3, fromLang: 'English', toLang: 'French', duration: '45 min', type: 'video', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-700', price: '$18.00', time: 'Yesterday, 07:45 PM', avatar: 'https://i.pravatar.cc/150?u=7' },
]

export default function RecentSessions() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Recent Sessions</h3>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
      </div>

      <div className="space-y-2">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
            <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900">{s.fromLang} → {s.toLang}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  {s.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                  {s.duration}
                </span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-500">{s.type === 'video' ? 'Video Call' : 'Audio Call'}</span>
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <Badge variant="neutral" className={`text-[8px] ${s.statusColor} border-0 mb-0.5`}>
                {s.status}
              </Badge>
              <p className="text-sm font-bold text-slate-900">{s.price}</p>
              <p className="text-[9px] text-slate-400">{s.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}