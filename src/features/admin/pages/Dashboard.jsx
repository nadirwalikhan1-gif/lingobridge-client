import StatsOverview from '../components/dashboard/StatsOverview'
import RevenueChart from '../components/dashboard/RevenueChart'
import SessionsByType from '../components/dashboard/SessionsByType'
import RecentUsers from '../components/dashboard/RecentUsers'
import TopInterpreters from '../components/dashboard/TopInterpreters'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import BottomStats from '../components/dashboard/BottomStats'

export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 mt-0.5">Monitor your platform performance and manage your operations.</p>
      </div>

      <StatsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <SessionsByType />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RecentUsers />
        <TopInterpreters />
        <RecentTransactions />
      </div>

      <BottomStats />
    </div>
  )
}