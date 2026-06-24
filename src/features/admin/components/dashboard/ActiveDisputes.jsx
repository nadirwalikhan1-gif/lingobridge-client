// src/features/admin/components/dashboard/ActiveDisputes.jsx
// Wired to parent via onResolve/onEscalate props.

function AlertIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function InfoIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

const statusConfig = {
  // FIX: added all statuses the API can return
  open: {
    iconBg: 'bg-[#FAEEDA]',
    Icon: InfoIcon,
    iconClass: 'w-3.5 h-3.5 stroke-[#BA7517]',
    badge: 'bg-[#FAEEDA] text-[#BA7517]',
    label: 'Open',
  },
  investigating: {
    iconBg: 'bg-[#EEEDFE]',
    Icon: InfoIcon,
    iconClass: 'w-3.5 h-3.5 stroke-[#534AB7]',
    badge: 'bg-[#EEEDFE] text-[#534AB7]',
    label: 'Investigating',
  },
  escalated: {
    iconBg: 'bg-[#FCEBEB]',
    Icon: AlertIcon,
    iconClass: 'w-3.5 h-3.5 stroke-[#A32D2D]',
    badge: 'bg-[#FCEBEB] text-[#A32D2D]',
    label: 'Escalated',
  },
  review: {
    iconBg: 'bg-[#FAEEDA]',
    Icon: InfoIcon,
    iconClass: 'w-3.5 h-3.5 stroke-[#BA7517]',
    badge: 'bg-[#FAEEDA] text-[#BA7517]',
    label: 'Review',
  },
  resolved: {
    iconBg: 'bg-[#E1F5EE]',
    Icon: CheckIcon,
    iconClass: 'w-3.5 h-3.5 stroke-[#0F6E56]',
    badge: 'bg-[#E1F5EE] text-[#0F6E56]',
    label: 'Resolved',
  },
}

// FIX: fallback for any unknown status — prevents crash on cfg.dot / Icon destructure
const FALLBACK_CFG = {
  iconBg: 'bg-lb-surface',
  Icon: InfoIcon,
  iconClass: 'w-3.5 h-3.5 stroke-lb-muted',
  badge: 'bg-lb-surface text-lb-muted',
  label: 'Unknown',
}

// FIX: prop was `ext: disputes` — renamed to `disputes` to match what parent passes
export default function ActiveDisputes({ disputes = [], onResolve, onEscalate }) {
  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-medium text-lb-ink">Active disputes</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">View all</button>
      </div>

      {disputes.length === 0 ? (
        <p className="text-[12px] text-lb-muted text-center py-4">No open disputes</p>
      ) : (
        <div className="divide-y divide-lb-border">
          {disputes.map((d) => {
            const cfg = statusConfig[d.status] ?? FALLBACK_CFG // FIX: safe fallback
            const { Icon } = cfg
            return (
              <div key={d.id} className="flex items-start gap-2.5 py-2">
                <div className={`w-7 h-7 rounded-lg ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={cfg.iconClass} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-lb-ink">
                    {d.title} <span className="text-lb-muted font-normal">{d.ref}</span>
                    {d.amount && <span className="text-lb-muted font-normal"> · {d.amount}</span>}
                  </p>
                  <p className="text-[10px] text-lb-muted mt-0.5">
                    {d.client}{d.interpreter ? ` · ${d.interpreter}` : ''} · {d.timeAgo}
                  </p>
                  {(onResolve || onEscalate) && (
                    <div className="flex gap-2 mt-2">
                      {onResolve && (
                        <button
                          onClick={() => onResolve(d.id)}
                          className="text-[10px] px-2 py-1 rounded bg-[#E1F5EE] text-[#0F6E56] font-medium hover:bg-[#c8ede2] transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      {onEscalate && d.status !== 'escalated' && (
                        <button
                          onClick={() => onEscalate(d.id)}
                          className="text-[10px] px-2 py-1 rounded border border-lb-border bg-white text-lb-muted hover:bg-lb-surface transition-colors"
                        >
                          Escalate
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
