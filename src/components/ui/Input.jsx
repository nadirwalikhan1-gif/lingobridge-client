import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2.5 bg-white border rounded-button text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-admin-accent/20 focus:border-admin-accent transition-colors ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Input