import EarningsStats from '../components/dashboard/EarningsStats'
import IncomingRequests from '../components/dashboard/IncomingRequests'
import EarningsChart from '../components/dashboard/EarningsChart'
import TodaysSchedule from '../components/dashboard/TodaysSchedule'
import RecentSessions from '../components/dashboard/RecentSessions'
import AvailabilitySchedule from '../components/dashboard/AvailabilitySchedule'

export default function InterpreterDashboard() {
  return (
    <div className="space-y-4">
      {/* Greeting Header */}
      <div>
        <p className="text-sm text-slate-600">Good morning, Maria! 👋</p>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5">Interpreter Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">Here's what's happening with your interpreting business today.</p>
      </div>

      <EarningsStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IncomingRequests />
        <EarningsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodaysSchedule />
        <RecentSessions />
      </div>

      <AvailabilitySchedule />
    </div>
  )
}