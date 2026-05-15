import { useState } from 'react'
import { Phone, Video, Clock, Globe, Check, X, MapPin } from 'lucide-react'

const requests = [
  { id: 1, client: 'John Doe', fromLang: 'English', toLang: 'Spanish', duration: '30 min', type: 'video', price: 45.00, time: 'Just now', location: 'New York, USA', avatar: 'JD' },
  { id: 2, client: 'Sarah Smith', fromLang: 'Arabic', toLang: 'English', duration: '45 min', type: 'audio', price: 32.50, time: '2 min ago', location: 'London, UK', avatar: 'SS' },
  { id: 3, client: 'Ali Khan', fromLang: 'Urdu', toLang: 'English', duration: '60 min', type: 'video', price: 67.00, time: '5 min ago', location: 'Karachi, PK', avatar: 'AK' },
]

export default function Requests() {
  const [activeRequests, setActiveRequests] = useState(requests)

  const handleAccept = (id) => {
    setActiveRequests(activeRequests.filter(r => r.id !== id))
  }

  const handleDecline = (id) => {
    setActiveRequests(activeRequests.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Incoming interpretation requests</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium">{activeRequests.length} Active</span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {activeRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">No active requests</h3>
            <p className="text-sm text-slate-500">New requests will appear here in real-time</p>
          </div>
        ) : (
          activeRequests.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm border-2 border-violet-100 p-6 hover:border-violet-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-violet-700">{r.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{r.client}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        {r.fromLang} → {r.toLang}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {r.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    r.type === 'video' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {r.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                    {r.type === 'video' ? 'Video Call' : 'Audio Call'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-5 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {r.duration}
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-medium text-emerald-600">${r.price.toFixed(2)}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">{r.time}</span>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleAccept(r.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-500 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Accept Request
                </button>
                <button 
                  onClick={() => handleDecline(r.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 text-sm font-medium rounded-xl border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
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
