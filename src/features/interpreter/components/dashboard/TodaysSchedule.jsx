import { Video, Phone, ChevronRight } from 'lucide-react'
import Badge from '../../../../components/ui/Badge'

const schedule = [
  { id: 1, time: '11:00 AM', duration: '60 min', fromLang: 'English', toLang: 'Arabic', type: 'video', status: 'Scheduled', statusColor: 'bg-blue-100 text-blue-700', price: '$24.00', avatar: 'https://i.pravatar.cc/150?u=21' },
  { id: 2, time: '02:30 PM', duration: '30 min', fromLang: 'Spanish', toLang: 'English', type: 'audio', status: 'Scheduled', statusColor: 'bg-blue-100 text-blue-700', price: '$12.00', avatar: 'https://i.pravatar.cc/150?u=20' },
  { id: 3, time: '04:00 PM', duration: '15 min', fromLang: 'Urdu', toLang: 'English', type: 'audio', status: 'Scheduled', statusColor: 'bg-blue-100 text-blue-700', price: '$6.00', avatar: 'https://i.pravatar.cc/150?u=7' },
]

export default function TodaysSchedule() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Today's Schedule</h3>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View Calendar</button>
      </div>

      <div className="space-y-2">
        {schedule.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="text-right shrink-0 w-14">
              <p className="text-xs font-semibold text-emerald-600">{s.time}</p>
              <p className="text-[10px] text-slate-400">{s.duration}</p>
            </div>
            
            <img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900">{s.fromLang} → {s.toLang}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  {s.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                  {s.type === 'video' ? 'Video Call' : 'Audio Call'}
                </span>
                <Badge variant="neutral" className={`text-[8px] ${s.statusColor} border-0`}>
                  {s.status}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-slate-900">{s.price}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}