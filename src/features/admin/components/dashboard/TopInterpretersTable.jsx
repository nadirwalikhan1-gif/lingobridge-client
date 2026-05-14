import { Star } from 'lucide-react'
import { topInterpreters } from '../../../../data/mocks/interpreters'
import Avatar from '../../../../components/ui/Avatar'

export default function TopInterpretersTable() {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Top Interpreters</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">#</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Interpreter</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Rating</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {topInterpreters.map((interp, idx) => (
              <tr key={interp.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-5 py-3 text-sm text-slate-500">{idx + 1}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={interp.avatar} fallback={interp.name} size="sm" />
                    <span className="text-sm font-medium text-slate-900">{interp.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium text-slate-900">{interp.rating}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">{interp.sessions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}