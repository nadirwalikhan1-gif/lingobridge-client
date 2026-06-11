// InterpreterPresence.jsx — Admin interpreter online/availability panel

const statusConfig = {
  online: { dot: 'bg-[#1D9E75]', label: 'Available', labelColor: 'text-[#0F6E56]' },
  busy: { dot: 'bg-[#BA7517]', label: 'In session', labelColor: 'text-[#BA7517]' },
  offline: { dot: 'bg-[#B4B2A9]', label: 'Offline', labelColor: 'text-lb-muted' },
}

const avatarBg = {
  online: 'bg-lb-surface text-lb-ink',
  busy: 'bg-[#FAEEDA] text-[#BA7517]',
  offline: 'bg-lb-surface text-lb-muted',
}

export default function InterpreterPresence({ interpreters = [] }) {
  const onlineCount = interpreters.filter((i) => i.status === 'online').length

  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-[13px] font-medium text-lb-ink">Interpreters online</h3>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56]">
              {onlineCount} free
            </span>
          </div>
        </div>
        <button className="text-[12px] text-[#7F77DD] font-medium">All 28</button>
      </div>

      {interpreters.length === 0 ? (
        <p className="text-[12px] text-lb-muted text-center py-4">No interpreters online</p>
      ) : (
        <div className="divide-y divide-lb-border">
          {interpreters.map((interp) => {
            const cfg = statusConfig[interp.status]
            const avBg = avatarBg[interp.status]
            return (
              <div key={interp.id} className="flex items-center gap-2.5 py-2">
                <div className="relative shrink-0">
                  <div className={`w-7 h-7 rounded-full ${avBg} flex items-center justify-center text-[10px] font-medium`}>
                    {interp.initials}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-[1.5px] border-white ${cfg.dot}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-lb-ink truncate">{interp.name}</p>
                  <p className="text-[10px] text-lb-muted mt-0.5">
                    {interp.langs} · {interp.specialties}
                  </p>
                </div>
                <span className={`text-[10px] font-medium shrink-0 ${cfg.labelColor}`}>
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