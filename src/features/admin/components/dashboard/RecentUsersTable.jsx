import { recentUsers } from '../../../../data/mocks/users'
import Avatar from '../../../../components/ui/Avatar'
import Badge from '../../../../components/ui/Badge'

export default function RecentUsersTable() {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Recent Users</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All Users</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">User</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Email</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Role</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Joined On</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} fallback={user.name} size="sm" />
                    <span className="text-sm font-medium text-slate-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">{user.email}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{user.role}</td>
                <td className="px-5 py-3">
                  <Badge variant={user.status === 'Active' ? 'success' : 'error'}>{user.status}</Badge>
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">{user.joined}</td>
                <td className="px-5 py-3">
                  <button className="text-slate-400 hover:text-slate-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
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
