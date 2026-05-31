// TodaysSchedule.jsx — accent border-left on items instead of dot

const MOCK_SCHEDULE = [
  { id: 1, time: '11:00 AM', fromLang: 'English', toLang: 'Arabic',  type: 'video', duration: '60 min', initials: 'SL', price: '$24.00', soon: true  },
  { id: 2, time: '02:30 PM', fromLang: 'Spanish', toLang: 'English', type: 'audio', duration: '30 min', initials: 'MG', price: '$12.00', soon: false },
  { id: 3, time: '04:00 PM', fromLang: 'Urdu',    toLang: 'English', type: 'audio', duration: '15 min', initials: 'AK', price: '$6.00',  soon: false },
]

const TOTAL = '$42.00'

function TypeIcon({ type }) {
  if (type === 'video') return (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
    </svg>
  )
  return (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
  )
}

export default function TodaysSchedule({ schedule = MOCK_SCHEDULE }) {
  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-medium text-lb-ink">Today's schedule</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">Calendar</button>
      </div>

      <div className="space-y-2">
        {schedule.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg border-l-2 bg-lb-surface ${
              s.soon ? 'border-[#1D9E75]' : 'border-[#7F77DD]'
            }`}
          >
            {/* Time */}
            <span className="text-[11px] font-semibold text-lb-ink w-[52px] shrink-0 tabular-nums">{s.time}</span>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-lb-ink truncate">{s.fromLang} → {s.toLang}</p>
              <div className="flex items-center gap-1 mt-0.5 text-lb-muted">
                <TypeIcon type={s.type} />
                <span className="text-[10px]">{s.type === 'video' ? 'Video' : 'Audio'} · {s.duration} · {s.initials}</span>
              </div>
            </div>

            <span className="text-[12px] font-medium text-lb-ink shrink-0">{s.price}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-lb-border">
        <span className="text-[11px] text-lb-muted">Scheduled income today</span>
        <span className="text-[15px] font-semibold text-[#26215C]">{TOTAL}</span>
      </div>
    </div>
  )
}