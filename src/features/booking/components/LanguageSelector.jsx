// LanguageSelector.jsx — rebuilt with lb-* tokens to match interpreter design language
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { FROM_LANGUAGES, TO_LANGUAGES } from '../../../config/constants'

function SwapIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
    </svg>
  )
}

function LanguageDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(l => l.code === value)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="flex-1" ref={ref}>
      <p className="text-[10px] font-medium text-lb-muted uppercase tracking-wider mb-1.5">{label}</p>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-left ${
            open ? 'border-[#7F77DD] bg-lb-surface' : 'border-lb-border bg-lb-surface hover:border-[#7F77DD]'
          }`}
        >
          {selected?.flag && (
            <img src={selected.flag} alt="" className="w-5 h-3.5 rounded-sm object-cover shrink-0" />
          )}
          <span className="text-[12px] font-medium text-lb-ink truncate flex-1">{selected?.label}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-lb-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-20 w-full mt-1 bg-white rounded-lg border border-lb-border shadow-lg py-1 max-h-44 overflow-y-auto">
            {options.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onChange(lang.code); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                  value === lang.code
                    ? 'bg-[#EEEDFE] text-[#534AB7]'
                    : 'text-lb-ink hover:bg-lb-surface'
                }`}
              >
                {lang.flag && (
                  <img src={lang.flag} alt="" className="w-5 h-3.5 rounded-sm object-cover shrink-0" />
                )}
                <span className="text-[12px] font-medium truncate">{lang.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LanguageSelector({ fromLang, toLang, onFromChange, onToChange, onSwap }) {
  return (
    <div className="flex items-end gap-2">
      <LanguageDropdown
        label="From"
        value={fromLang}
        options={FROM_LANGUAGES}
        onChange={onFromChange}
      />

      {/* Swap button — same lb-surface style */}
      <button
        onClick={onSwap}
        className="w-8 h-8 mb-0.5 rounded-lg bg-lb-surface border border-lb-border flex items-center justify-center hover:border-[#7F77DD] hover:bg-[#EEEDFE] transition-colors shrink-0"
        aria-label="Swap languages"
      >
        <SwapIcon />
      </button>

      <LanguageDropdown
        label="To"
        value={toLang}
        options={TO_LANGUAGES}
        onChange={onToChange}
      />
    </div>
  )
}