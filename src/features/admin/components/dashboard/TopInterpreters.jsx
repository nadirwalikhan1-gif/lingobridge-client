import { Star } from 'lucide-react'

export default function TopInterpreters({ interpreters = [] }) {
  if (interpreters.length === 0) {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Top Interpreters</h3>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>
        <p className="text-xs text-slate-500 text-center py-4">No interpreter data</p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Top Interpreters</h3>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-1">#</th>
            <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">Interpreter</th>
            <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">Rating</th>
            <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2">Sessions</th>
          </tr>
        </thead>
        <tbody>
          {interpreters.map((i) => (
            <tr key={i.id} className="border-b border-slate-50 last:border-0">
              <td className="py-2 pr-1">
                <span className="text-xs text-slate-500">{i.rank}</span>
              </td>
              <td className="py-2 pr-2">
                <div className="flex items-center gap-2">
                  <img src={i.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-medium text-slate-900">{i.name}</span>
                </div>
              </td>
              <td className="py-2 pr-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-700">{i.rating}</span>
                </div>
              </td>
              <td className="py-2">
                <span className="text-xs text-slate-600">{i.sessions}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
