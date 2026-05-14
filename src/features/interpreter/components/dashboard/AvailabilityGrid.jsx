export default function AvailabilityGrid({ schedule }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Availability Schedule</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Edit</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {schedule.map((day) => (
          <div key={day.day} className={`p-3 rounded-lg text-center ${day.available ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}`}>
            <p className="text-xs font-medium text-slate-600 mb-2">{day.day}</p>
            {day.available ? (
              <div className="space-y-1">
                <p className="text-xs text-emerald-700 font-medium">{day.startTime}</p>
                <p className="text-xs text-slate-400">-</p>
                <p className="text-xs text-emerald-700 font-medium">{day.endTime}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">Unavailable</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}