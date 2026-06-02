// TodaysSchedule.jsx — enriched with domain, client organization, confirmation status
// Uses WHITELIST languages: Pashto Eastern, Pashto Western, Punjabi Gurmukhi, Punjabi Shahmukhi, English (US), English (Canada), English (UK)

const MOCK_SCHEDULE = [
  {
    id: 1, time: '11:00 AM', fromLang: 'English (US)', toLang: 'Pashto Eastern',
    type: 'video', duration: '60 min', initials: 'SL', price: '$24.00', soon: true,
    domain: 'Medical', clientOrg: 'City General Hospital', status: 'Confirmed',
  },
  {
    id: 2, time: '02:30 PM', fromLang: 'Punjabi Gurmukhi', toLang: 'English (Canada)',
    type: 'audio', duration: '30 min', initials: 'MG', price: '$12.00', soon: false,
    domain: 'Legal', clientOrg: 'Johnson & Associates Law', status: 'Confirmed',
  },
  {
    id: 3, time: '04:00 PM', fromLang: 'Pashto Western', toLang: 'English (UK)',
    type: 'audio', duration: '15 min', initials: 'AK', price: '$6.00', soon: false,
    domain: 'Insurance', clientOrg: 'State Farm Insurance', status: 'Pending',
  },
]

const TOTAL = '$42.00'

const DOMAIN_COLORS = {
  'Medical':        { bg: '#E1F5EE', text: '#0F6E56', border: '#1D9E75' },
  'Legal':          { bg: '#FCEBEB', text: '#A32D2D', border: '#E24B4A' },
  'Insurance':      { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'Social Services':{ bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Government':     { bg: '#F3E8FF', text: '#7C3AED', border: '#A78BFA' },
  'Business':       { bg: '#EEEDFE', text: '#534AB7', border: '#7F77DD' },
  'Technical':      { bg: '#E0F2FE', text: '#0369A1', border: '#0EA5E9' },
  'Healthcare':     { bg: '#E1F5EE', text: '#0F6E56', border: '#1D9E75' },
  'Customer Service':{ bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
  'Welfare':        { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
  'Personal':       { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
  'General':        { bg: '#F3F4F6', text: '#4B5563', border: '#9CA3AF' },
}

const STATUS_COLORS = {
  'Confirmed': { bg: '#EAF3DE', text: '#3B6D11' },
  'Pending':   { bg: '#FAEEDA', text: '#854F0B' },
  'Cancelled': { bg: '#FCEBEB', text: '#A32D2D' },
}

function getDomainStyle(domain) {
  return DOMAIN_COLORS[domain] || DOMAIN_COLORS['General']
}

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

function NextSessionBanner({ session }) {
  const s = session || {
    domain: 'Medical',
    fromLang: 'English (US)',
    toLang: 'Pashto Eastern',
    type: 'video',
    duration: '60 min',
    price: '$24.00',
    minutesUntil: 47,
  }
  const domainStyle = getDomainStyle(s.domain)

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-lb-surface border border-lb-border mt-3">
      <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: domainStyle.border }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[11px] font-medium text-lb-ink">Next session in {s.minutesUntil} min</p>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded border"
            style={{
              backgroundColor: domainStyle.bg,
              color: domainStyle.text,
              borderColor: domainStyle.border,
            }}
          >
            {s.domain}
          </span>
        </div>
        <p className="text-[10px] text-lb-muted">{s.fromLang} → {s.toLang} · {s.type === 'video' ? 'Video' : 'Audio'} · {s.duration}</p>
      </div>
      <span className="text-[11px] font-medium text-[#534AB7]">{s.price}</span>
    </div>
  )
}

export default function TodaysSchedule({ schedule = MOCK_SCHEDULE }) {
  const nextSession = schedule.find(s => s.soon) || schedule[0]

  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[14px] font-medium text-lb-ink">Today's schedule</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">Calendar</button>
      </div>

      <div className="space-y-2">
        {schedule.map((s) => {
          const domainStyle = getDomainStyle(s.domain)
          const statusStyle = STATUS_COLORS[s.status] || STATUS_COLORS['Pending']

          return (
            <div
              key={s.id}
              className={`flex flex-col gap-2 px-3 py-2.5 rounded-lg border-l-2 bg-lb-surface ${
                s.soon ? 'border-[#1D9E75]' : 'border-[#7F77DD]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-lb-ink w-[52px] shrink-0 tabular-nums">{s.time}</span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: domainStyle.bg,
                    color: domainStyle.text,
                    borderColor: domainStyle.border,
                  }}
                >
                  {s.domain}
                </span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                  }}
                >
                  {s.status}
                </span>
                <span className="text-[12px] font-medium text-lb-ink ml-auto shrink-0">{s.price}</span>
              </div>

              <div className="flex items-center gap-1.5 ml-[52px]">
                <span className="text-[13px] font-medium text-lb-ink">{s.fromLang} → {s.toLang}</span>
                <TypeIcon type={s.type} />
                <span className="text-[10px] text-lb-muted">{s.type === 'video' ? 'Video' : 'Audio'} · {s.duration}</span>
              </div>

              <div className="flex items-center gap-1.5 ml-[52px]">
                <span className="text-[10px] text-lb-subtle font-medium">{s.clientOrg}</span>
                <span className="text-[10px] text-lb-muted">· {s.initials}</span>
              </div>
            </div>
          )
        })}
      </div>

      <NextSessionBanner session={nextSession ? {
        domain: nextSession.domain,
        fromLang: nextSession.fromLang,
        toLang: nextSession.toLang,
        type: nextSession.type,
        duration: nextSession.duration,
        price: nextSession.price,
        minutesUntil: 47,
      } : null} />

      <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-lb-border">
        <span className="text-[11px] text-lb-muted">Scheduled income today</span>
        <span className="text-[15px] font-semibold text-[#26215C]">{TOTAL}</span>
      </div>
    </div>
  )
}