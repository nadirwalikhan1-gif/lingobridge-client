import { Inbox } from 'lucide-react'

/**
 * EmptyState
 *
 * Shared "nothing here yet" placeholder for lists/pages with no data,
 * as distinct from ErrorState (which is for failed requests).
 *
 * Props:
 *  - icon         Component  lucide-react icon component (default: Inbox)
 *  - title        string     Short headline, e.g. "No sessions yet"
 *  - message      string     Supporting copy explaining what will appear here
 *  - actionLabel  string     Label for the optional action button
 *  - onAction     func       Called when the action button is clicked (optional)
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-12 h-12 rounded-full bg-lb-surface flex items-center justify-center mb-4">
        <Icon size={22} className="text-lb-muted" />
      </div>
      <p className="text-sm font-medium text-lb-text mb-1">{title}</p>
      {message && (
        <p className="text-sm text-lb-muted max-w-sm mb-5">{message}</p>
      )}
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-lb-primary text-white text-sm font-medium hover:bg-lb-deep transition-colors"
        >
          {actionLabel || 'Get started'}
        </button>
      )}
    </div>
  )
}