import { Phone, Video, Clock, User } from 'lucide-react'
import Badge from '../../../../components/ui/Badge'
import Button from '../../../../components/ui/Button'

export default function IncomingRequestCard({ request }) {
  const isScheduled = request.type === 'Scheduled'

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <Badge variant={isScheduled ? 'purple' : 'success'}>{request.type}</Badge>
        <span className="text-lg font-bold text-emerald-600">${request.price.toFixed(2)}</span>
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <img src={request.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-slate-900">{request.fromLanguage} → {request.toLanguage}</p>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{request.duration}</span>
            <span className="flex items-center gap-1">{request.sessionType === 'Video Call' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}{request.sessionType}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          <p className="flex items-center gap-1"><User className="w-3 h-3" />Client: {request.client}</p>
          <p className="mt-0.5">{isScheduled ? request.time : request.timeAgo}</p>
        </div>
        {isScheduled ? (
          <Button variant="outline" size="sm">View Details</Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">Decline</Button>
            <Button variant="interpreter" size="sm">Accept</Button>
          </div>
        )}
      </div>
    </div>
  )
}