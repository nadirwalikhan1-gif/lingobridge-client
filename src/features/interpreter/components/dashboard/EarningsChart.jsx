import { useState } from 'react'
import { ChevronDown, DollarSign, TrendingUp } from 'lucide-react'

const DATA_SETS = {
  'This Week': [
    { day: 'Mon', earnings: 120, sessions: 3 }, { day: 'Tue', earnings: 180, sessions: 4 },
    { day: 'Wed', earnings: 95,  sessions: 2 }, { day: 'Thu', earnings: 220, sessions: 5 },
    { day: 'Fri', earnings: 150, sessions: 3 }, { day: 'Sat', earnings: 80,  sessions: 2 },
    { day: 'Sun', earnings: 200, sessions: 4 },
  ],
  'Last Week': [
    { day: 'Mon', earnings: 90,  sessions: 2 }, { day: 'Tue', earnings: 140, sessions: 3 },
    { day: 'Wed', earnings: 110, sessions: 3 }, { day: 'Thu', earnings: 175, sessions: 4 },
    { day: 'Fri', earnings: 130, sessions: 3 }, { day: 'Sat', earnings: 60,  sessions: 1 },
    { day: 'Sun', earnings: 160, sessions: 3 },
  ],
  'This Month': [
    { day: 'W1', earnings: 680, sessions: 16 }, { day: 'W2', earnings: 820, sessions: 19 },
    { day: 'W3', earnings: 750, sessions: 17 }, { day: 'W4', earnings: 960, sessions: 23 },
  ],
  'Last Month': [
    { day: 'W1', earnings: 590, sessions: 14 }, { day: 'W2', earnings: 700, sessions: 16 },
    { day: 'W3', earnings: 680, sessions: 15 }, { day: 'W4', earnings: 830, sessions: 20 },
  ],
}

const FILTERS = ['This Week', 'Last Week', 'This Month', 'Last Month']

export default function EarningsChart() {
  const [activeFilter, setActiveFilter] = useState('This Week')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const chartData    = DATA_SETS[activeFilter]
  const maxEarnings  = Math.max(...chartData.map(d => d.earnings))
  const total        = chartData.reduce((s, d) => s + d.earnings, 0)
  const sessions     = chartData.reduce((s, d) => s + d.sessions, 0)

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Earnings Analytics</h3>
          <p className="text-xs text-slate-500 mt-0.5">Revenue overview</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            {activeFilter}
            <ChevronDown className="w-3 h-3" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 min-w-[130px]">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => { setActiveFilter(f); setDropdownOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                    activeFilter === f
                      ? 'text-interpreter-accent bg-interpreter-accent/5'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-emerald-50 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs text-emerald-600 font-medium">Total</span>
          </div>
          <p className="text-base font-bold text-emerald-700">${total.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-interpreter-accent/10 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-interpreter-accent" />
            <span className="text-xs text-interpreter-accent font-medium">Avg/Session</span>
          </div>
          <p className="text-base font-bold text-interpreter-accent">${(total / sessions).toFixed(0)}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs text-slate-600 font-medium">Sessions</span>
          </div>
          <p className="text-base font-bold text-slate-800">{sessions}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-40 flex items-end gap-2">
        {chartData.map((data) => (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full relative group">
              <div
                className="w-full bg-emerald-100 rounded-t-lg hover:bg-emerald-300 transition-colors relative"
                style={{ height: `${(data.earnings / maxEarnings) * 136}px` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  ${data.earnings}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{data.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}