import { MoreVertical } from 'lucide-react'

const transactions = [
  { id: 'TXN-12458', user: 'John Doe', amount: '$12.00', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-700', date: 'May 18, 2024' },
  { id: 'TXN-12457', user: 'Maria Garcia', amount: '$18.00', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-700', date: 'May 18, 2024' },
  { id: 'TXN-12456', user: 'Ali Khan', amount: '$6.00', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-700', date: 'May 17, 2024' },
  { id: 'TXN-12455', user: 'Sophia Brown', amount: '$15.00', status: 'Refunded', statusColor: 'bg-violet-100 text-violet-700', date: 'May 17, 2024' },
  { id: 'TXN-12454', user: 'Ahmed Khan', amount: '$20.00', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-700', date: 'May 16, 2024' },
]

export default function RecentTransactions() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">Transaction ID</th>
            <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">User</th>
            <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">Amount</th>
            <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2 pr-2">Status</th>
            <th className="text-left text-[10px] font-medium text-slate-400 uppercase pb-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-slate-50 last:border-0">
              <td className="py-2 pr-2">
                <span className="text-xs text-slate-600 font-mono">{t.id}</span>
              </td>
              <td className="py-2 pr-2">
                <span className="text-xs text-slate-700">{t.user}</span>
              </td>
              <td className="py-2 pr-2">
                <span className="text-xs font-medium text-slate-900">{t.amount}</span>
              </td>
              <td className="py-2 pr-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${t.statusColor}`}>
                  {t.status}
                </span>
              </td>
              <td className="py-2">
                <span className="text-xs text-slate-500">{t.date}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}