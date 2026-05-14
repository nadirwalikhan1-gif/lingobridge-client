import { Wallet, AlertTriangle, Users, Headphones, Radio } from 'lucide-react'

const stats = [
  { label: 'Pending Payouts', value: '$3,245.75', sub: '12 Interpreters', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Disputes', value: '8', sub: '2 Open', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  { label: 'New Signups', value: '156', sub: 'This Week', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Active Interpreters', value: '862', sub: 'Online Now', icon: Headphones, color: 'text-emerald-600', bg: 'bg-emerald-50', online: true },
  { label: 'Live Sessions', value: '24', sub: 'In Progress', icon: Radio, color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function BottomStatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">{stat.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
              {stat.online && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
            </div>
            <p className="text-xs text-slate-400">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}