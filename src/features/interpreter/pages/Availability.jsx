import { useState } from 'react'
import AvailabilitySchedule from '../components/dashboard/AvailabilitySchedule'
import { Clock, ToggleLeft, ToggleRight } from 'lucide-react'

const DEFAULT_SCHEDULE = [
  { day: 'Mon', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Tue', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Wed', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Thu', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Fri', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Sat', available: false },
  { day: 'Sun', available: false },
]

export default function Availability() {
  const [isOnline, setIsOnline] = useState(false)
  const [schedule] = useState(DEFAULT_SCHEDULE)

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-bold text-slate-800">Availability</h1>

      {/* Online Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isOnline ? 'bg-emerald-50' : 'bg-slate-100'}`}>
            <Clock className={`w-4 h-4 ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Online Status</p>
            <p className="text-xs text-slate-500">
              {isOnline ? 'You are visible to clients' : 'You are hidden from clients'}
            </p>
          </div>
        </div>
        <button onClick={() => setIsOnline(o => !o)}>
          {isOnline
            ? <ToggleRight className="w-7 h-7 text-emerald-500" />
            : <ToggleLeft className="w-7 h-7 text-slate-300" />
          }
        </button>
      </div>

      {/* Schedule */}
      <AvailabilitySchedule schedule={schedule} onEdit={() => {}} />

      {/* Coming Soon Placeholder */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-center">
        <p className="text-sm text-slate-400">Full schedule editor coming soon</p>
      </div>
    </div>
  )
}