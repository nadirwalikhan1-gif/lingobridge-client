import { Wallet, AlertTriangle, UserPlus, Headphones, Radio } from 'lucide-react'

const stats = [
  { label: 'Pending Payouts', value: '$3,245.75', sub: '12 Interpreters', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Disputes', value: '8', sub: '2 Open', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'New Signups', value: '156', sub: 'This Week', icon: UserPlus, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Active Interpreters', value: '862', sub: 'Online Now', icon: Headphones, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Live Sessions', value: '24', sub: 'In Progress', icon: Radio, color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function BottomStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.label} className="card p-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 truncate">{s.label}</p>
              <p className="text-base font-bold text-slate-900 leading-tight">{s.value}</p>
              <p className="text-[10px] text-slate-400">{s.sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}