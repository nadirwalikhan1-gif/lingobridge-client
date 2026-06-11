// OperationalAlerts.jsx — Admin alert feed

const severityConfig = {
  critical: {
    border: 'border-[#E24B4A]',
    bg: 'bg-[#FCEBEB]/50',
    dot: 'bg-[#E24B4A]',
    titleSize: 'text-[12.5px]',
    padding: 'px-3 py-2.5',
  },
  warn: {
    border: 'border-[#BA7517]',
    bg: 'bg-[#FAEEDA]/40',
    dot: 'bg-[#BA7517]',
    titleSize: 'text-[11.5px]',
    padding: 'px-2.5 py-2',
  },
  info: {
    border: 'border-[#7F77DD]',
    bg: 'bg-[#EEEDFE]/30',
    dot: 'bg-[#7F77DD]',
    titleSize: 'text-[11px]',
    padding: 'px-2.5 py-1.5',
  },
}

export default function OperationalAlerts({ alerts = [] }) {
  return (
    <div className="lb-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-lb-border">
        <span className="text-[13px] font-semibold text-lb-ink">Operational Alerts</span>
        <button className="text-[11.5px] font-medium text-[#7F77DD]">View all</button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-[12px] text-lb-muted text-center py-6">No active alerts</p>
      ) : (
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
      )}
    </div>
  )
}