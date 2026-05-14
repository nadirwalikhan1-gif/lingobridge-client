import { Calendar, Clock, Video, Phone } from 'lucide-react'
import Badge from '../../../../components/ui/Badge'

const sessions = [
  { id: 1, client: 'John Doe', type: 'video', time: '10:30 AM', duration: '30m', status: 'confirmed', topic: 'Medical Consultation' },
  { id: 2, client: 'Sarah Smith', type: 'audio', time: '12:00 PM', duration: '45m', status: 'pending', topic: 'Business Meeting' },
  { id: 3, client: 'Mike Johnson', type: 'video', time: '2:15 PM', duration: '60m', status: 'confirmed', topic: 'Legal Discussion' },
]

export default function UpcomingSessions() {
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-semibold text-slate-900">Upcoming Sessions</h3>
        <button className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700">View All</button>
      </div>
      
      <div className="space-y-1.5">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5 p-2 rounded-md border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              {s.type === 'video' ? <Video className="w-3.5 h-3.5 text-slate-500" /> : <Phone className="w-3.5 h-3.5 text-slate-500" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-medium text-slate-900 truncate">{s.client}</p>
                <Badge variant={s.status === 'confirmed' ? 'success' : 'warning'} className="text-[8px] px-1">
                  {s.status}
                </Badge>
              </div>
              <p className="text-[9px] text-slate-500 truncate">{s.topic}</p>
            </div>
            
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <Clock className="w-3 h-3" />
                {s.time}
              </div>
              <p className="text-[9px] text-slate-400">{s.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}