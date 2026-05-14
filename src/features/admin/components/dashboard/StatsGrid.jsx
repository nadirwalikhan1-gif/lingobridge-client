import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import StatCard from '../../../../components/ui/StatCard'

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <StatCard
        title="Total Users"
        value="12,450"
        trend="up"
        trendValue="8.2%"
        icon={Users}
        iconColor="blue"
      />
      <StatCard
        title="Total Revenue"
        value="$45,200"
        trend="up"
        trendValue="15.3%"
        icon={DollarSign}
        iconColor="emerald"
      />
      <StatCard
        title="Total Sessions"
        value="3,200"
        trend="up"
        trendValue="11.7%"
        icon={Calendar}
        iconColor="violet"
      />
      <StatCard
        title="Conversion Rate"
        value="24%"
        trend="up"
        trendValue="4.5%"
        icon={TrendingUp}
        iconColor="amber"
      />
    </div>
  )
}