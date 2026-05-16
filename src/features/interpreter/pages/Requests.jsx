import { useState } from 'react'
import { Phone, Video, Clock, Globe, Check, X, MapPin } from 'lucide-react'

const requests = [
  { id: 1, client: 'John Doe',    fromLang: 'English', toLang: 'Spanish', duration: '30 min', type: 'video', price: 45.00, time: 'Just now',   location: 'New York, USA', avatar: 'JD' },
  { id: 2, client: 'Sarah Smith', fromLang: 'Arabic',  toLang: 'English', duration: '45 min', type: 'audio', price: 32.50, time: '2 min ago',  location: 'London, UK',    avatar: 'SS' },
  { id: 3, client: 'Ali Khan',    fromLang: 'Urdu',    toLang: 'English', duration: '60 min', type: 'video', price: 67.00, time: '5 min ago',  location: 'Karachi, PK',   avatar: 'AK' },
]

export default function Requests() {
  const [activeRequests, setActiveRequests] = useState(requests)

  const handleAccept  = (id) => setActiveRequests(prev => prev.filter(r => r.id !== id))
  const handleDecline = (id) => setActiveRequests(prev => prev.filter(r => r.id !== id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Requests</h1>
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-medium">{activeRequests.length} Active</span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {activeRequests.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-slate-100 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No active requests</p>
            <p className="text-xs text-slate-400">New requests will appear here in real-time</p>
          </div>
        ) : (
          activeRequests.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-xl border-2 border-emerald-100 hover:border-emerald-200 shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-interpreter-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-interpreter-accent">{r.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{r.client}</h3>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {r.fromLang} → {r.toLang}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {r.location}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
                  r.type === 'video' ? 'bg-interpreter-accent/10 text-interpreter-accent' : 'bg-slate-100 text-slate-600'
                }`}>
                  {r.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                  {r.type === 'video' ? 'Video Call' : 'Audio Call'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {r.duration}
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-emerald-600">${r.price.toFixed(2)}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">{r.time}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAccept(r.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept Request
                </button>
                <button
                  onClick={() => handleDecline(r.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-red-600 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}