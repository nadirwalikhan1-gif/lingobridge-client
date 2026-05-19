// AvailabilitySchedule.jsx — used on Availability page (not dashboard)

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
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-medium text-lb-ink">Availability</h3>
        <button onClick={onEdit} className="text-[12px] text-[#7F77DD] font-medium">Edit</button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {schedule.map((s) => (
          <div
            key={s.day}
            className={`p-1.5 rounded border text-center ${
              s.available
                ? 'border-[#CECBF6] bg-[#EEEDFE]'
                : 'border-lb-border bg-lb-surface'
            }`}
          >
            <p className="text-[10px] font-medium text-lb-ink mb-0.5">{s.day}</p>
            {s.available ? (
              <>
                <p className="text-[9px] text-[#534AB7] font-medium leading-tight">{s.start}</p>
                <p className="text-[9px] text-lb-muted">–</p>
                <p className="text-[9px] text-[#534AB7] font-medium leading-tight">{s.end}</p>
              </>
            ) : (
              <p className="text-[9px] text-lb-muted mt-0.5">Off</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
