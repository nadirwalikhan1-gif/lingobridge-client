import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * ErrorState
 *
 * Shared inline error state for a page/section that failed to load data.
 * Used across the admin dashboard (Sessions, Requests, Users, Settings,
 * Transactions, Reviews, Payouts, Dashboard, Comms, Interpreters).
 *
 * Props:
 *  - message  string  Human-readable error message to display
 *  - onRetry  func     Called when the user clicks "Try again" (optional)
 */
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle size={22} className="text-red-500" />
      </div>
      <p className="text-sm font-medium text-lb-text mb-1">Couldn't load this page</p>
      <p className="text-sm text-lb-muted max-w-sm mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-lb-primary text-white text-sm font-medium hover:bg-lb-deep transition-colors"
        >
          <RotateCcw size={14} />
          Try again
        </button>
      )}
    </div>
  )
}