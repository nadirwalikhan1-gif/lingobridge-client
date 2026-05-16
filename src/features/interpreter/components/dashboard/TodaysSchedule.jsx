// TodaysSchedule.jsx
import { Video, Phone, ChevronRight } from 'lucide-react'

const MOCK_SCHEDULE = [
  { id: 1, time: '11:00 AM', duration: '60 min', fromLang: 'English', toLang: 'Arabic',   type: 'video', status: 'Scheduled', price: '$24.00', avatar: 'SL' },
  { id: 2, time: '02:30 PM', duration: '30 min', fromLang: 'Spanish', toLang: 'English',  type: 'audio', status: 'Scheduled', price: '$12.00', avatar: 'MG' },
  { id: 3, time: '04:00 PM', duration: '15 min', fromLang: 'Urdu',    toLang: 'English',  type: 'audio', status: 'Scheduled', price: '$6.00',  avatar: 'AK' },
]

export default function TodaysSchedule({ schedule = MOCK_SCHEDULE }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Today's Schedule</h3>
        <button className="text-xs font-medium text-interpreter-accent hover:opacity-80 transition-opacity">
          View Calendar
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-400">No sessions scheduled today</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedule.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="text-right flex-shrink-0 w-14">
                <p className="text-xs font-semibold text-emerald-600">{s.time}</p>
                <p className="text-[10px] text-slate-400">{s.duration}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-slate-600">{s.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800">{s.fromLang} → {s.toLang}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    {s.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                    {s.type === 'video' ? 'Video' : 'Audio'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{s.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-sm font-semibold text-slate-800">{s.price}</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}