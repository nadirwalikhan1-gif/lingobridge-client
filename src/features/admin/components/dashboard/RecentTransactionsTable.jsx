import { recentTransactions } from '../../../../data/mocks/transactions'
import Badge from '../../../../components/ui/Badge'

export default function RecentTransactionsTable() {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Recent Transactions</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Transaction ID</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">User</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-5 py-3 text-sm font-medium text-slate-900">{tx.id}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{tx.user}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-900">${tx.amount.toFixed(2)}</td>
                <td className="px-5 py-3">
                  <Badge variant={tx.status === 'Completed' ? 'success' : 'purple'}>{tx.status}</Badge>
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
