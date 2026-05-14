import { UserCheck, UserX, Clock } from 'lucide-react'
import Avatar from '../../../../components/ui/Avatar'

const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'client', status: 'active', joined: '2m ago' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'interpreter', status: 'active', joined: '15m ago' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'client', status: 'pending', joined: '1h ago' },
  { id: 4, name: 'David Brown', email: 'david@example.com', role: 'interpreter', status: 'inactive', joined: '3h ago' },
]

const statusIcon = {
  active: <UserCheck className="w-3 h-3 text-emerald-600" />,
  pending: <Clock className="w-3 h-3 text-amber-600" />,
  inactive: <UserX className="w-3 h-3 text-red-600" />,
}

export default function RecentUsers() {
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-semibold text-slate-900">Recent Users</h3>
        <button className="text-[10px] font-medium text-blue-600 hover:text-blue-700">View All</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-[9px] font-medium text-slate-400 uppercase tracking-wider pb-1.5 pr-2">User</th>
              <th className="text-left text-[9px] font-medium text-slate-400 uppercase tracking-wider pb-1.5 pr-2 hidden sm:table-cell">Role</th>
              <th className="text-left text-[9px] font-medium text-slate-400 uppercase tracking-wider pb-1.5 pr-2">Status</th>
              <th className="text-right text-[9px] font-medium text-slate-400 uppercase tracking-wider pb-1.5">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <tr key={u.id} className="group">
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    <Avatar fallback={u.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-900 truncate">{u.name}</p>
                      <p className="text-[9px] text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-1.5 pr-2 hidden sm:table-cell">
                  <span className="text-[10px] text-slate-600 capitalize">{u.role}</span>
                </td>
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1">
                    {statusIcon[u.status]}
                    <span className="text-[10px] text-slate-600 capitalize">{u.status}</span>
                  </div>
                </td>
                <td className="py-1.5 text-right">
                  <span className="text-[10px] text-slate-500">{u.joined}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}