import { X, Phone } from 'lucide-react'
import { useEffect } from 'react'
import SessionSummary from './SessionSummary'

export default function MobileSummarySheet({ open, onClose, fromLang, toLang, sessionType, duration, price }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white pt-3 pb-2 px-4 flex justify-center border-b border-lb-border-light z-10">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
          <button onClick={onClose} className="absolute right-4 top-3 p-1 text-lb-text-secondary hover:text-lb-text">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <SessionSummary
            fromLang={fromLang}
            toLang={toLang}
            sessionType={sessionType}
            duration={duration}
            price={price}
          />
        </div>
      </div>
    </div>
  )
}