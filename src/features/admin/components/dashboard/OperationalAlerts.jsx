// OperationalAlerts.jsx — Admin alert feed
// Header aligned to match OperationalSnapshot and SystemHealth exactly:
// px-4 py-3 border-b border-lb-border, text-[13px] font-semibold text-lb-ink

const MOCK_ALERTS = [
  {
    id: 1,
    severity: 'critical',
    title: 'Interpreter shortage · Arabic',
    detail: '0 of 2 certified available · Emergency queue',
    time: '2m ago',
  },
  {
    id: 2,
    severity: 'warn',
    title: 'Session #4821 overdue',
    detail: 'Scheduled end 14 min ago · No end signal',
    time: '14m ago',
  },
  {
    id: 3,
    severity: 'info',
    title: 'Payout batch ready',
    detail: '12 interpreters · $3,240.00 total',
    time: '30m ago',
  },
  {
    id: 4,
    severity: 'warn',
    title: 'Match rate below threshold',
    detail: '72% vs 85% target · Arabic, Pashto affected',
    time: '1h ago',
  },
]

const severityConfig = {
  critical: {
    border: 'border-[#E24B4A]',
    bg:     'bg-[#FCEBEB]/50',
    dot:    'bg-[#E24B4A]',
    titleSize: 'text-[12.5px]',
    padding: 'px-3 py-2.5',
  },
  warn: {
    border: 'border-[#BA7517]',
    bg:     'bg-[#FAEEDA]/40',
    dot:    'bg-[#BA7517]',
    titleSize: 'text-[11.5px]',
    padding: 'px-2.5 py-2',
  },
  info: {
    border: 'border-[#7F77DD]',
    bg:     'bg-[#EEEDFE]/30',
    dot:    'bg-[#7F77DD]',
    titleSize: 'text-[11px]',
    padding: 'px-2.5 py-1.5',
  },
}

export default function OperationalAlerts({ alerts: ext }) {
  const alerts = ext ?? MOCK_ALERTS

  return (
    <div className="lb-card">
      {/* Header — identical markup to OperationalSnapshot and SystemHealth */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-lb-border">
        <span className="text-[13px] font-semibold text-lb-ink">Operational Alerts</span>
        <button className="text-[11.5px] font-medium text-[#7F77DD]">View all</button>
      </div>

      <div className="space-y-2 px-4 py-3">
        {alerts.map((a) => {
          const cfg = severityConfig[a.severity]
          return (
            <div
              key={a.id}
              className={`flex items-start gap-2.5 rounded-lg border-l-2 ${cfg.border} ${cfg.bg} ${cfg.padding}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${cfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-lb-ink ${cfg.titleSize}`}>{a.title}</p>
                <p className="text-[10px] text-lb-muted mt-0.5">{a.detail}</p>
              </div>
              <span className="text-[10px] text-lb-muted shrink-0">{a.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}