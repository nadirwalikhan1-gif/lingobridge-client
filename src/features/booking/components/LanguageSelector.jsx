import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowUpDown } from 'lucide-react'
import { FROM_LANGUAGES, TO_LANGUAGES } from '../../../config/constants'

export default function LanguageSelector({ fromLang, toLang, onFromChange, onToChange, onSwap }) {
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const fromRef = useRef(null)
  const toRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (fromRef.current && !fromRef.current.contains(e.target)) setFromOpen(false)
      if (toRef.current && !toRef.current.contains(e.target)) setToOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedFrom = FROM_LANGUAGES.find((l) => l.code === fromLang)
  const selectedTo = TO_LANGUAGES.find((l) => l.code === toLang)

  return (
    <div className="relative">

      {/* FROM — English variants only */}
      <div className="mb-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">From</p>
        <div className="relative" ref={fromRef}>
          <button
            onClick={() => setFromOpen(!fromOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            aria-haspopup="listbox"
            aria-expanded={fromOpen}
            aria-label="Select source language"
          >
            <img src={selectedFrom?.flag} alt="" className="w-5 h-3.5 rounded-sm object-cover shrink-0" />
            <span className="text-[12px] font-medium text-slate-700 truncate flex-1" title={selectedFrom?.label}>{selectedFrom?.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${fromOpen ? 'rotate-180' : ''}`} />
          </button>

          {fromOpen && (
            <div className="absolute z-20 w-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1 max-h-48 overflow-y-auto" role="listbox" aria-label="Source language options">
              {FROM_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { onFromChange(lang.code); setFromOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors focus:outline-none focus:bg-violet-50 ${
                    fromLang === lang.code ? 'bg-violet-50 text-violet-700' : 'text-slate-700'
                  }`}
                  role="option"
                  aria-selected={fromLang === lang.code}
                >
                  <img src={lang.flag} alt="" className="w-5 h-3.5 rounded-sm object-cover shrink-0" />
                  <span className="text-[11px] font-medium truncate" title={lang.label}>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swap */}
      <div className="flex justify-center my-2">
        <button
          onClick={onSwap}
          className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-violet-50 hover:border-violet-200 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          aria-label="Swap languages"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* TO — Pashto & Punjabi only */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">To</p>
        <div className="relative" ref={toRef}>
          <button
            onClick={() => setToOpen(!toOpen)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            aria-haspopup="listbox"
            aria-expanded={toOpen}
            aria-label="Select target language"
          >
            <img src={selectedTo?.flag} alt="" className="w-5 h-3.5 rounded-sm object-cover shrink-0" />
            <span className="text-[12px] font-medium text-slate-700 truncate flex-1" title={selectedTo?.label}>{selectedTo?.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${toOpen ? 'rotate-180' : ''}`} />
          </button>

          {toOpen && (
            <div className="absolute z-20 w-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-100 py-1 max-h-48 overflow-y-auto" role="listbox" aria-label="Source language options">
              {TO_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { onToChange(lang.code); setToOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors focus:outline-none focus:bg-violet-50 ${
                    toLang === lang.code ? 'bg-violet-50 text-violet-700' : 'text-slate-700'
                  }`}
                  role="option"
                  aria-selected={toLang === lang.code}
                >
                  <img src={lang.flag} alt="" className="w-5 h-3.5 rounded-sm object-cover shrink-0" />
                  <span className="text-[11px] font-medium truncate" title={lang.label}>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}