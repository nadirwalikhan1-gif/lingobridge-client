// SystemHealth.jsx — Interpreter operations health panel

const cfg = {
  ok:   { bar: 'bg-[#1D9E75]', badge: 'bg-[#E1F5EE] text-[#0F6E56]', label: 'Good' },
  warn: { bar: 'bg-[#BA7517]', badge: 'bg-[#FAEEDA] text-[#BA7517]',  label: 'Low'  },
  crit: { bar: 'bg-[#E24B4A]', badge: 'bg-[#FCEBEB] text-[#A32D2D]',  label: 'Crit' },
}

export default function SystemHealth({ metrics = [] }) {
  const allOk = metrics.every((m) => m.status === 'ok')

  return (
    <div className="lb-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-lb-border">
        <span className="text-[13px] font-semibold text-lb-ink">Operations Health</span>
        <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full ${
          allOk
            ? 'bg-[#E1F5EE] text-[#0F6E56]'
            : 'bg-[#FAEEDA] text-[#BA7517]'
        }`}>
          {allOk ? 'Operational' : 'Needs Attention'}
        </span>
      </div>

      {metrics.length === 0 ? (
        <p className="text-[12px] text-lb-muted text-center py-6">No health metrics available</p>
      ) : (
        <div className="divide-y divide-lb-border">
          {metrics.map((m) => {
            const style = cfg[m.status]
            return (
              <div key={m.label} className="px-4 py-2.5 flex items-center gap-3">
                <div className="w-[160px] shrink-0">
                  <p className="text-[12px] text-lb-ink leading-none mb-0.5">{m.label}</p>
                  <p className="text-[10px] text-lb-muted">{m.detail}</p>
                </div>
                <div className="flex-1 h-1.5 bg-lb-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${style.bar}`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
                <span className={`text-[11.5px] font-medium text-lb-ink w-[44px] text-right shrink-0 ${
                  m.value.includes('m') || m.value.includes('s') ? 'font-mono' : ''
                }`}>
                  {m.value}
                </span>
                <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 w-[30px] text-center ${style.badge}`}>
                  {style.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-t border-lb-border bg-lb-surface rounded-b-xl">
        <span className="text-[11px] text-lb-muted uppercase tracking-wide">
          Interpreter Operations
        </span>
        <span className="text-[11px] text-lb-muted">Updated live</span>
      </div>
    </div>
  )
}
