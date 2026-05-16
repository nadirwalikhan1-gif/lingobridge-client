import { useState } from 'react'
import { Phone, Video, Clock, X, Check } from 'lucide-react'

const MOCK_REQUESTS = [
  { id: 1, type: 'new',       fromLang: 'English', toLang: 'Spanish', duration: '30 min', sessionType: 'video', price: '$12.00', client: 'John Doe',   time: '2 mins ago',      avatar: 'JD' },
  { id: 2, type: 'new',       fromLang: 'Urdu',    toLang: 'English', duration: '15 min', sessionType: 'audio', price: '$6.00',  client: 'Ali Khan',   time: '5 mins ago',      avatar: 'AK' },
  { id: 3, type: 'scheduled', fromLang: 'English', toLang: 'Arabic',  duration: '60 min', sessionType: 'video', price: '$24.00', client: 'Sophia Lee', time: 'Today, 11:00 AM', avatar: 'SL' },
]

export default function IncomingRequests({ requests: externalRequests, onAccept, onDecline }) {
  const [localRequests, setLocalRequests] = useState(MOCK_REQUESTS)
  const requests = externalRequests ?? localRequests

  const handleAccept  = (id) => { if (onAccept)  { onAccept(id);  return } setLocalRequests(prev => prev.filter(r => r.id !== id)) }
  const handleDecline = (id) => { if (onDecline) { onDecline(id); return } setLocalRequests(prev => prev.filter(r => r.id !== id)) }

  const newCount = requests.filter(r => r.type === 'new').length

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800">Incoming Requests</h3>
          {newCount > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {newCount}
            </span>
          )}
        </div>
        <button className="text-xs font-medium text-interpreter-accent hover:opacity-80 transition-opacity">
          View All
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">No incoming requests right now</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Avatar with type badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-slate-600">{r.avatar}</span>
                    </div>
                    <span className={`absolute -top-1 -left-1 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      r.type === 'new' ? 'bg-emerald-500' : 'bg-interpreter-accent'
                    }`}>
                      {r.type === 'new' ? 'New' : 'Sched'}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.fromLang} → {r.toLang}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.duration}</span>
                      <span className="flex items-center gap-1">
                        {r.sessionType === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                        {r.sessionType === 'video' ? 'Video' : 'Audio'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{r.client} · {r.time}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-emerald-600 flex-shrink-0">{r.price}</p>
              </div>

              {r.type === 'new' && (
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => handleDecline(r.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3 h-3" /> Decline
                  </button>
                  <button
                    onClick={() => handleAccept(r.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                </div>
              )}

              {r.type === 'scheduled' && (
                <button className="w-full mt-2.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  View Details
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}