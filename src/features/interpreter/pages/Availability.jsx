import AvailabilityManager from '../../components/interpreter/dashboard/AvailabilityManager'

export default function Availability() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Availability</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your schedule and working hours</p>
      </div>
      <AvailabilityManager isOnline={false} onToggle={() => {}} />
    </div>
  )
}
