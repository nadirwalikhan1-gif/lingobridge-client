import { ChevronDown, DollarSign, TrendingUp, Calendar } from 'lucide-react'

const chartData = [50, 100, 80, 130, 110, 160, 140, 180, 170, 200, 190, 220]
const max = Math.max(...chartData)

export default function EarningsChart() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Earnings Overview</h3>
        <button className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
          This Week
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-4">
        {/* Chart */}
        <div className="flex-1">
          <div className="flex items-end gap-1 h-32">
            {chartData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end group">
                <div 
                  className="w-full bg-emerald-100 rounded-sm group-hover:bg-emerald-200 transition-colors" 
                  style={{ height: `${(v / max) * 100}%` }} 
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {['May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18'].map((d, i) => (
              <span key={i} className="text-[9px] text-slate-400 flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>

        {/* Side stats */}
        <div className="w-28 shrink-0 space-y-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-[10px] text-slate-500">This Week</span>
            </div>
            <p className="text-sm font-bold text-slate-900">$850.50</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="text-[10px] text-slate-500">Last Week</span>
            </div>
            <p className="text-sm font-bold text-slate-900">$680.25</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center">
                <Calendar className="w-3 h-3 text-violet-600" />
              </div>
              <span className="text-[10px] text-slate-500">This Month</span>
            </div>
            <p className="text-sm font-bold text-slate-900">$1,245.75</p>
          </div>
        </div>
      </div>
    </div>
  )
}