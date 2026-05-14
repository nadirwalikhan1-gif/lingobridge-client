const schedule = [
  { day: 'Mon', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Tue', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Wed', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Thu', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Fri', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Sat', available: false },
  { day: 'Sun', available: false },
]

export default function AvailabilitySchedule() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Availability Schedule</h3>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {schedule.map((s) => (
          <div key={s.day} className={`p-2 rounded-lg border text-center ${s.available ? 'border-slate-100 bg-white' : 'border-slate-50 bg-slate-50'}`}>
            <p className="text-xs font-medium text-slate-900 mb-1">{s.day}</p>
            {s.available ? (
              <>
                <p className="text-[10px] text-emerald-600 font-medium">{s.start}</p>
                <p className="text-[10px] text-slate-400">-</p>
                <p className="text-[10px] text-emerald-600 font-medium">{s.end}</p>
              </>
            ) : (
              <p className="text-[10px] text-slate-400 mt-2">Unavailable</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}