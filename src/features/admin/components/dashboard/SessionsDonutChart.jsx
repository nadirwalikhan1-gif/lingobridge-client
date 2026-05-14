import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { sessionsByType } from '../../../../data/mocks/sessions'

export default function SessionsDonutChart() {
  const total = sessionsByType.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="card p-5">
      <h3 className="text-base font-semibold text-slate-900 mb-6">Sessions by Type</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sessionsByType}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {sessionsByType.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-900">{total.toLocaleString()}</span>
            <span className="text-xs text-slate-500">Total</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          {sessionsByType.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-slate-900">{item.value.toLocaleString()}</span>
                <span className="text-xs text-slate-500 ml-1">({((item.value/total)*100).toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}