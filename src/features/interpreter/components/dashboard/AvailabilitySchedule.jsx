const MOCK_SCHEDULE = [
  { day: 'Mon', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Tue', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Wed', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Thu', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Fri', start: '9:00 AM', end: '5:00 PM', available: true },
  { day: 'Sat', available: false },
  { day: 'Sun', available: false },
]

export default function AvailabilitySchedule({ schedule = MOCK_SCHEDULE, onEdit }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Availability</h3>
        <button
          onClick={onEdit}
          className="text-xs font-medium text-interpreter-accent hover:opacity-80 transition-opacity"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {schedule.map((s) => (
          <div
            key={s.day}
            className={`p-1.5 rounded-lg border text-center ${
              s.available ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'
            }`}
          >
            <p className="text-[10px] font-semibold text-slate-700 mb-0.5">{s.day}</p>
            {s.available ? (
              <>
                <p className="text-[9px] text-emerald-600 font-medium leading-tight">{s.start}</p>
                <p className="text-[9px] text-slate-400">–</p>
                <p className="text-[9px] text-emerald-600 font-medium leading-tight">{s.end}</p>
              </>
            ) : (
              <p className="text-[9px] text-slate-400 mt-0.5">Off</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}