import { Phone } from 'lucide-react'

export default function MobileBottomBar({ total, onConnect }) {
  return (
    <div className="h-bottombar bg-white border-t border-lb-border-light shrink-0 flex items-center justify-between px-4 z-20">
      <div>
        <p className="text-xs text-lb-text-secondary">Total Price</p>
        <p className="text-xl font-bold text-lb-primary">${total.toFixed(2)}</p>
      </div>
      <button
        onClick={onConnect}
        className="h-[44px] px-6 bg-lb-primary text-white text-sm font-semibold rounded-lb-button hover:bg-lb-deep flex items-center gap-2"
      >
        <Phone className="w-4 h-4" />
        Connect Now
      </button>
    </div>
  )
}