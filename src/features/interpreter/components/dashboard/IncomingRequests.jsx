import { Phone, Video, Clock, X, Check } from 'lucide-react'
import Badge from '../../../../components/ui/Badge'

const requests = [
  { id: 1, type: 'new', fromLang: 'English', toLang: 'Spanish', duration: '30 min', sessionType: 'video', price: '$12.00', client: 'John Doe', time: '2 mins ago', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 2, type: 'new', fromLang: 'Urdu', toLang: 'English', duration: '15 min', sessionType: 'audio', price: '$6.00', client: 'Ali Khan', time: '5 mins ago', avatar: 'https://i.pravatar.cc/150?u=20' },
  { id: 3, type: 'scheduled', fromLang: 'English', toLang: 'Arabic', duration: '60 min', sessionType: 'video', price: '$24.00', client: 'Sophia Lee', time: 'Today, 11:00 AM', avatar: 'https://i.pravatar.cc/150?u=21' },
]

export default function IncomingRequests() {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Incoming Requests</h3>
          <span className="bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
        </div>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
      </div>

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img src={r.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  {r.type === 'new' && (
                    <span className="absolute -top-1 -left-1 bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">New</span>
                  )}
                  {r.type === 'scheduled' && (
                    <span className="absolute -top-1 -left-1 bg-violet-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">Scheduled</span>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.fromLang} → {r.toLang}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.duration}</span>
                    <span className="flex items-center gap-1">{r.sessionType === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}{r.sessionType === 'video' ? 'Video Call' : 'Audio Call'}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Client: {r.client}</p>
                  <p className="text-[10px] text-slate-400">{r.time}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-emerald-600">{r.price}</p>
              </div>
            </div>

            {r.type === 'new' && (
              <div className="flex items-center gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                  <X className="w-3 h-3" /> Decline
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500">
                  <Check className="w-3 h-3" /> Accept
                </button>
              </div>
            )}

            {r.type === 'scheduled' && (
              <button className="w-full mt-3 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                View Details
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}