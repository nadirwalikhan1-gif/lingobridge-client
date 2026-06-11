// src/components/ui/ErrorState.jsx
// Reusable error card with retry. Used across all admin pages.

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorState({ message = 'Something went wrong', onRetry, fullPage = false }) {
  const wrapper = fullPage ? 'min-h-[60vh] flex items-center justify-center' : ''

  return (
    <div className={`${wrapper}`}>
      <div className="lb-card p-6 text-center max-w-md mx-auto">
        <div className="w-10 h-10 rounded-full bg-[#FCEBEB] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5 text-[#A32D2D]" />
        </div>
        <h3 className="text-[13px] font-medium text-lb-ink mb-1">Failed to load</h3>
        <p className="text-[11px] text-lb-muted mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#7F77DD] text-white hover:bg-[#534AB7] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  )
}