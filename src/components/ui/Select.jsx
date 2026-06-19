import { forwardRef, useState, useRef, useEffect, useId } from 'react'

const accentMap = {
  admin:       'focus-within:ring-2 focus-within:ring-admin-accent/20 focus-within:border-admin-accent',
  client:      'focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-400',
  interpreter: 'focus-within:ring-2 focus-within:ring-interpreter-accent/20 focus-within:border-interpreter-accent',
}

const accentHighlight = {
  admin:       'bg-admin-accent/10 text-admin-accent',
  client:      'bg-violet-50 text-violet-700',
  interpreter: 'bg-interpreter-accent/10 text-interpreter-accent',
}

const sizes = {
  sm: { trigger: 'h-9 text-xs', dropdown: 'text-xs' },
  md: { trigger: 'h-10 text-sm', dropdown: 'text-sm' },
  lg: { trigger: 'h-12 text-base', dropdown: 'text-base' },
}

const Select = forwardRef(function Select(
  { label, error, options = [], accent = 'admin', size = 'sm', className = '', value, onChange, ...props },
  _ref
) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const labelId = useId()

  const accentClasses    = accentMap[accent]       || accentMap.admin
  const highlightClasses = accentHighlight[accent]  || accentHighlight.admin
  const sizeClasses      = sizes[size]              || sizes.sm

  const selected = options.find((o) => o.value === value) || options[0]

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'Enter' || e.key === ' ') { setOpen((v) => !v); return }
    if (!open) return
    const idx = options.findIndex((o) => o.value === value)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = options[(idx + 1) % options.length]
      onChange?.({ target: { value: next.value } })
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = options[(idx - 1 + options.length) % options.length]
      onChange?.({ target: { value: prev.value } })
    }
  }

  const handleSelect = (optValue) => {
    onChange?.({ target: { value: optValue } })
    setOpen(false)
  }

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label id={labelId} className="block text-[9px] font-medium text-slate-400 mb-1 uppercase tracking-wide">
          {label}
        </label>
      )}

      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={label ? labelId : undefined}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => setOpen((v) => !v)}
        className={`
          relative w-full px-3 ${sizeClasses.trigger}
          bg-white border rounded-xl text-slate-700
          flex items-center justify-between gap-2
          cursor-pointer select-none outline-none transition-colors
          ${accentClasses}
          ${error ? 'border-red-300' : 'border-slate-200'}
        `}
        {...props}
      >
        <span className="flex items-center gap-1.5 truncate leading-none">
          {selected?.label}
        </span>
        <svg
          className={`shrink-0 w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div
          role="listbox"
          className={`
            absolute z-50 mt-1 w-full
            bg-white border border-slate-200 rounded-xl
            shadow-lg shadow-slate-200/50 overflow-y-auto max-h-52
            ${sizeClasses.dropdown}
          `}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`
                  flex items-center gap-2 px-3 py-2 cursor-pointer
                  transition-colors duration-100
                  ${isSelected
                    ? highlightClasses
                    : 'text-slate-700 hover:bg-slate-50'}
                `}
              >
                {opt.label}
              </div>
            )
          })}
        </div>
      )}

      {error && <p className="mt-1 text-[9px] text-red-500">{error}</p>}
    </div>
  )
})

export default Select
