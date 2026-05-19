// ActiveDisputes.jsx — Admin dispute monitoring panel
// Design: compact card rows, severity badges, same lb-* tokens

const MOCK_DISPUTES = [
  {
    id: 1,
    title: 'Session quality',
    ref: '#4821',
    client: 'Layla M.',
    interpreter: 'Ali K.',
    timeAgo: '2h ago',
    status: 'escalated',
    amount: null,
  },
  {
    id: 2,
    title: 'Charge dispute',
    ref: '#4793',
    client: 'Pierre D.',
    interpreter: null,
    timeAgo: 'Yesterday',
    status: 'review',
    amount: '$45.00',
  },
  {
    id: 3,
    title: 'No-show claim',
    ref: '#4780',
    client: 'Omar S.',
    interpreter: null,
    timeAgo: '2 days ago',
    status: 'review',
    amount: null,
  },
]

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

const statusConfig = {
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
}

export default function ActiveDisputes({ disputes: ext }) {
  const disputes = ext ?? MOCK_DISPUTES

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
            const cfg = statusConfig[d.status]
            const { Icon } = cfg
            return (
              <div key={d.id} className="flex items-start gap-2.5 py-2">
                {/* Icon */}
                <div className={`w-7 h-7 rounded-lg ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={cfg.iconClass} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-lb-ink">
                    {d.title} <span className="text-lb-muted font-normal">{d.ref}</span>
                    {d.amount && <span className="text-lb-muted font-normal"> · {d.amount}</span>}
                  </p>
                  <p className="text-[10px] text-lb-muted mt-0.5">
                    {d.client}{d.interpreter ? ` · ${d.interpreter}` : ''} · {d.timeAgo}
                  </p>
                </div>

                {/* Badge */}
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