import { Users, Headphones, Calendar, CreditCard } from 'lucide-react'
import StatCard from '../../../../components/ui/StatCard'

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <StatCard
        title="Total Users"
        value="2,451"
        trend="up"
        trendValue="+12%"
        icon={Users}
        iconColor="blue"
      />
      <StatCard
        title="Interpreters"
        value="186"
        trend="up"
        trendValue="+5"
        icon={Headphones}
        iconColor="emerald"
      />
      <StatCard
        title="Sessions"
        value="1,203"
        trend="up"
        trendValue="+8%"
        icon={Calendar}
        iconColor="violet"
      />
      <StatCard
        title="Revenue"
        value="$48.2k"
        trend="up"
        trendValue="+15%"
        icon={CreditCard}
        iconColor="amber"
      />
    </div>
  )
}
