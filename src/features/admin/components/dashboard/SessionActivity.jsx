import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react'

const typeIcon = {
  success: <CheckCircle className="w-3 h-3 text-emerald-600" />,
  danger: <XCircle className="w-3 h-3 text-red-600" />,
  warning: <Clock className="w-3 h-3 text-amber-600" />,
  info: <Activity className="w-3 h-3 text-blue-600" />,
}

export default function SessionActivity({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="card p-3">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-semibold text-slate-900">Activity</h3>
          <button className="text-[10px] font-medium text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <p className="text-xs text-slate-500 text-center py-4">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-semibold text-slate-900">Activity</h3>
        <button className="text-[10px] font-medium text-blue-600 hover:text-blue-700">View All</button>
      </div>

      <div className="space-y-2">
        {activities.map((a) => (
          <div key={a.id} className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
              {typeIcon[a.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-slate-900 truncate">{a.text}</p>
              <p className="text-[9px] text-slate-500 truncate">{a.detail}</p>
            </div>
            <span className="text-[9px] text-slate-400 shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
