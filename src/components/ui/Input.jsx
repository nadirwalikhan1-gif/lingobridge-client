import { forwardRef, useId } from 'react'

const Input = forwardRef(function Input({ label, error, id, className = '', ...props }, ref) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-lb-ink mb-1.5 tracking-wide">
          {label}
        </label>
      )}
      <input
        ref={ref} id={inputId}
        className={`lb-input ${error ? '!border-red-400 focus:!border-red-500 focus:![box-shadow:0_0_0_3px_rgba(220,38,38,0.12)]' : ''}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  )
})
export default Input
