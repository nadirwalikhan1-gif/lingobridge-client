import { MoreVertical } from 'lucide-react'
import Avatar from '../../../../components/ui/Avatar'

const users = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Client', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700', joined: 'May 18, 2024' },
  { id: 2, name: 'Maria Garcia', email: 'maria.garcia@example.com', role: 'Interpreter', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700', joined: 'May 17, 2024' },
  { id: 3, name: 'Ali Khan', email: 'ali.khan@example.com', role: 'Client', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700', joined: 'May 16, 2024' },
  { id: 4, name: 'Sophia Brown', email: 'sophia.brown@example.com', role: 'Client', status: 'Inactive', statusColor: 'bg-red-100 text-red-700', joined: 'May 15, 2024' },
  { id: 5, name: 'Ahmed Khan', email: 'ahmed.khan@example.com', role: 'Interpreter', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700', joined: 'May 14, 2024' },
]

export default function RecentUsers() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Recent Users</h3>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All Users</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">User</th>
              <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2 hidden sm:table-cell">Email</th>
              <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">Role</th>
              <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">Status</th>
              <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">Joined On</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-2">
                    <Avatar fallback={u.name} size="sm" />
                    <span className="text-xs font-medium text-slate-900">{u.name}</span>
                  </div>
                </td>
                <td className="py-2 pr-2 hidden sm:table-cell">
                  <span className="text-xs text-slate-500">{u.email}</span>
                </td>
                <td className="py-2 pr-2">
                  <span className="text-xs text-slate-600">{u.role}</span>
                </td>
                <td className="py-2 pr-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${u.statusColor}`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-2 pr-2">
                  <span className="text-xs text-slate-500">{u.joined}</span>
                </td>
                <td className="py-2">
                  <button aria-label="More options" className="p-1 text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
