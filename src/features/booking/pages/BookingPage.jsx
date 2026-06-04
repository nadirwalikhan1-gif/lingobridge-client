// BookingPage.jsx — 6-step auto-advance booking flow + step-7 connecting screen
//
// Roadmap fixes applied (targeting 9+ score):
//   #1  On-demand indicator: "< 1 min" note on confirm; sidebar receives isOnDemand=true
//   #2  LANGUAGE_NAMES map + langDisplay() — locale codes replaced with human names everywhere
//   #3  Step 7 connecting screen — shown after "Connect now", before Agora navigates
//   #4  Progressive sidebar props — null passed for fields not yet confirmed by user
//   #5  Unified purple CTA (#7F77DD) on Step 6 — was #1a1635 (dark navy)
//   #10 Back button present & consistent Steps 2–6 (already was; hidden on step 7)
//   #11 Wallet as payment option, pre-selected; hasInsufficientFunds only when wallet+short
//   #13 "Book again" shortcut card at top of Step 1
//   #14 Terms/charge acknowledgement line below CTA
//   #15 Progress bar labels clickable for completed steps; ConnectingDots animation
//
// Requires child-component changes (not in this file):
//   #6  SessionTypeSelector — equal rest-state visual weight for both options
//   #7  InterpreterCards   — badge legend (Top Rated / Expert / Pro)
//   #8  InterpreterCards   — clean single-sentence bio, no mid-word truncation
//   #9  DurationSelector   — show all options in 2×2 grid, remove pagination
//   #12 InterpreterCards   — availability signal ("Available now" / "Joins in ~2 min")

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import LanguageSelector from '../components/LanguageSelector'
import SessionTypeSelector from '../components/SessionTypeSelector'
import DurationSelector from '../components/DurationSelector'
import CategoryGrid from '../components/CategoryGrid'
import InterpreterCards from '../components/InterpreterCards'
import SessionSummary from '../components/SessionSummary'

// ─── Static Data ───────────────────────────────────────────────────────────────
const INTERPRETERS = [
  { id: 1, name: 'Abid Khan' },
  { id: 2, name: 'Ahmad Zia' },
  { id: 3, name: 'Rajinder Singh' },
  { id: 4, name: 'Imran Sandhu' },
  { id: 5, name: 'Amrit Kaur' },
]

const WALLET_BALANCE = 45.60

// Fix #2 — locale code → human-readable display name
const LANGUAGE_NAMES = {
  'en-us':        'English (US)',
  'en-gb':        'English (UK)',
  'en-ca':        'English (Canada)',
  'ps-east':      'Pashto (Eastern)',
  'ps-west':      'Pashto (Western)',
  'pa-gurmukhi':  'Punjabi (Gurmukhi)',
  'pa-shahmukhi': 'Punjabi (Shahmukhi)',
}
const langDisplay = (code) => LANGUAGE_NAMES[code] ?? code

// Fix #13 — "Book again" last session (replace with API/localStorage in production)
const LAST_SESSION = {
  fromLang:    'en-us',
  toLang:      'ps-east',
  sessionType: 'audio',
  duration:    15,
  category:    'Medical',
  interpreter: INTERPRETERS[0],
}

const STEPS = [
  { id: 1, label: 'Languages' },
  { id: 2, label: 'Type' },
  { id: 3, label: 'Duration' },
  { id: 4, label: 'Category' },
  { id: 5, label: 'Interpreter' },
  { id: 6, label: 'Confirm' },
]

// ─── Icons ─────────────────────────────────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}
function CardIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" />
    </svg>
  )
}
// Fix #11 — wallet icon for payment option
function WalletIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3" />
      <path strokeLinecap="round" d="M16 12h5v4h-5a2 2 0 010-4z" />
    </svg>
  )
}
function WarnIcon() {
  return (
    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
// Fix #13 — repeat icon for "Book again" button
function RepeatIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

// ─── Progress Bar — Fix #15: completed labels clickable ───────────────────────
function ProgressBar({ step, onStepClick }) {
  // Cap at 6 for display — step 7 is the connecting screen, shows 100%
  const displayStep = Math.min(step, STEPS.length)
  const pct = Math.round((displayStep / STEPS.length) * 100)

  return (
    <div className="shrink-0 px-1 py-1">
      {/* Bar */}
      <div className="h-[5px] rounded-full bg-lb-border overflow-hidden mb-2.5">
        <div
          className="h-full rounded-full bg-[#7F77DD] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Step labels — completed ones are clickable */}
      <div className="flex justify-between">
        {STEPS.map((s) => {
          const done   = displayStep > s.id
          const active = displayStep === s.id
          return (
            <button
              key={s.id}
              onClick={done ? () => onStepClick(s.id) : undefined}
              disabled={!done}
              title={done ? `Go back to ${s.label}` : undefined}
              className={`text-[9px] font-semibold uppercase tracking-wide transition-colors ${
                active
                  ? 'text-[#534AB7] cursor-default'
                  : done
                    ? 'text-[#7F77DD] hover:text-[#534AB7] cursor-pointer hover:underline underline-offset-2'
                    : 'text-lb-muted cursor-default'
              }`}
            >
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Animated Step Wrapper ────────────────────────────────────────────────────
function StepSlide({ children, direction, stepKey }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20)
    return () => clearTimeout(t)
  }, [stepKey])

  const fromX = direction === 'forward' ? '28px' : '-28px'

  return (
    <div
      style={{
        transition: 'opacity 260ms ease, transform 260ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : `translateX(${fromX})`,
      }}
      className="h-full flex flex-col"
    >
      {children}
    </div>
  )
}

// ─── Step Header ──────────────────────────────────────────────────────────────
function StepHeader({ title, hint }) {
  return (
    <div className="shrink-0 mb-5">
      <h2 className="text-[17px] font-semibold text-lb-ink">{title}</h2>
      {hint && <p className="text-[12px] text-lb-muted mt-1">{hint}</p>}
    </div>
  )
}

// ─── Confirm Detail ───────────────────────────────────────────────────────────
function ConfirmDetail({ label, value, onEdit }) {
  return (
    <div className="p-3 bg-lb-surface rounded-lg border border-lb-border">
      <p className="text-[10px] font-medium text-lb-muted uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-lb-ink">{value}</p>
        {onEdit && (
          <button onClick={onEdit} className="text-[11.5px] font-medium text-[#534AB7] hover:text-[#26215C] transition-colors">
            Change →
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Language Option Button ───────────────────────────────────────────────────
function LangOption({ label, selected, onSelect }) {
  const [flash, setFlash] = useState(false)

  const handleClick = () => {
    setFlash(true)
    onSelect()
    setTimeout(() => setFlash(false), 300)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left text-[13px] font-medium transition-all duration-100 ${
        selected
          ? 'bg-[#7F77DD] border-[#7F77DD] text-white shadow-sm'
          : flash
            ? 'bg-[#EEEDFE] border-[#7F77DD] text-[#534AB7]'
            : 'bg-lb-surface border-lb-border text-lb-ink hover:border-[#7F77DD]/50'
      }`}
    >
      <span>{label}</span>
      {selected && (
        <span className="ml-2 flex items-center justify-center w-4 h-4 rounded-full bg-white/25">
          <CheckIcon />
        </span>
      )}
    </button>
  )
}

// ─── Fix #3: Connecting Dots animation ───────────────────────────────────────
function ConnectingDots() {
  return (
    <div className="flex items-center gap-1.5">
      <style>{`
        @keyframes lb-dot-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.75); }
          50%       { opacity: 1;    transform: scale(1);    }
        }
      `}</style>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-[#7F77DD]"
          style={{ animation: `lb-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

// ─── Main BookingPage ─────────────────────────────────────────────────────────
export default function BookingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep]                               = useState(1)
  const [direction, setDirection]                     = useState('forward')
  const [fromLang, setFromLang]                       = useState('en-us')
  const [toLang, setToLang]                           = useState('ps-east')
  const [toLangChosen, setToLangChosen]               = useState(false)
  const [sessionType, setSessionType]                 = useState(null)
  const [duration, setDuration]                       = useState(null)
  const [selectedCategory, setSelectedCategory]       = useState(null)
  const [selectedInterpreter, setSelectedInterpreter] = useState(null)
  // Fix #11: wallet pre-selected since balance covers most sessions
  const [selectedPayment, setSelectedPayment]         = useState('wallet')
  const [connectError, setConnectError]               = useState(null)

  const advance = () => {
    setDirection('forward')
    setStep((s) => Math.min(7, s + 1))
  }

  const goBack = () => {
    setDirection('back')
    setStep((s) => Math.max(1, s - 1))
  }

  // Fix #15: jump to a completed step via progress bar label
  const handleStepJump = (targetStep) => {
    if (targetStep < step) {
      setDirection('back')
      setStep(targetStep)
    }
  }

  // ─── Auto-advance handlers ────────────────────────────────────────────────
  // Step 1: auto-advance when "To" language is confirmed
  const handleToLangChange = (code) => {
    setToLang(code)
    setToLangChosen(true)
    setTimeout(advance, 320)
  }

  // Step 2: session type → auto-advance
  const handleTypeSelect = (type) => {
    setSessionType(type)
    setTimeout(advance, 320)
  }

  // Step 3: duration → auto-advance
  const handleDurationSelect = (min) => {
    setDuration(min)
    setTimeout(advance, 320)
  }

  // Step 4: category → auto-advance
  const handleCategorySelect = (id) => {
    setSelectedCategory(id)
    setTimeout(advance, 320)
  }

  const handleSwapLanguages = () => {
    setFromLang(toLang)
    setToLang(fromLang)
  }

  // Fix #13: pre-fill everything from last session and jump to confirm
  const handleBookAgain = () => {
    setFromLang(LAST_SESSION.fromLang)
    setToLang(LAST_SESSION.toLang)
    setToLangChosen(true)
    setSessionType(LAST_SESSION.sessionType)
    setDuration(LAST_SESSION.duration)
    setSelectedCategory(LAST_SESSION.category)
    setSelectedInterpreter(LAST_SESSION.interpreter.id)
    setConnectError(null)
    setDirection('forward')
    setStep(6)
  }

  // ─── Derived values ───────────────────────────────────────────────────────
  const rate           = sessionType === 'video' ? 1.20 : 0.99
  const base           = duration ? +(duration * rate).toFixed(2) : 0
  const platformFee    = +(base * 0.05).toFixed(2)
  const total          = +(base + platformFee).toFixed(2)
  const interpreterName = INTERPRETERS.find((i) => i.id === selectedInterpreter)?.name ?? null
  const fromLangName   = langDisplay(fromLang)
  const toLangName     = langDisplay(toLang)

  // Fix #11: insufficient funds only applies when wallet is the chosen payment method
  const walletCoversTotal    = total <= WALLET_BALANCE
  const hasInsufficientFunds = selectedPayment === 'wallet' && !walletCoversTotal

  // ─── Connect Call — Agora flow unchanged ─────────────────────────────────
  const handleConnectCall = () => {
    const socket = getSocket()
    if (!socket || !socket.connected) { console.error('Socket not connected'); return }

    setConnectError(null)
    setDirection('forward')
    setStep(7) // Fix #3: show connecting screen immediately

    socket.emit('request-call', {
  fromLang, toLang, language: fromLang,
  sessionType, duration: `${duration} min`,
  category: selectedCategory, interpreterName,
})

    socket.once('call-requested', ({ channelName, agoraToken }) => {
      const tokenString = agoraToken?.token ?? agoraToken ?? ''
      navigate(
  `/call/${channelName}?` +
  `token=${encodeURIComponent(tokenString)}` +
  `&type=${sessionType}` +
  `&interpreterName=${encodeURIComponent(interpreterName ?? '')}` +
  `&fromLang=${encodeURIComponent(fromLang)}` +
  `&toLang=${encodeURIComponent(toLang)}` +
  `&category=${encodeURIComponent(selectedCategory ?? '')}` +
  `&duration=${duration}` +
  `&rate=${rate}`
)
    })

    socket.once('error', (err) => {
      console.error('request-call error:', err)
      setConnectError('Could not reach an interpreter. Please try again.')
      setDirection('back')
      setStep(6)
    })
  }

  // Cancel while on connecting screen — remove pending socket listeners
  const handleCancelConnect = () => {
    const socket = getSocket()
    if (socket) {
      socket.off('call-requested')
      socket.off('error')
    }
    setConnectError(null)
    setDirection('back')
    setStep(6)
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex gap-4 bg-lb-canvas">

      {/* ── Main Content Column ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden py-2">

        {/* Progress bar — hidden on connecting screen (step 7) */}
        {step <= 6 && (
          <div className="lb-card shrink-0 py-3 px-4">
            <ProgressBar step={step} onStepClick={handleStepJump} />
          </div>
        )}

        {/* Step panel */}
        <div className="flex-1 min-h-0 lb-card overflow-hidden relative">
          <div className="h-full p-5 overflow-y-auto no-scrollbar">
            <StepSlide direction={direction} stepKey={step}>

              {/* ── STEP 1: Languages ── */}
              {step === 1 && (
                <>
                  {/* Fix #13: Book again shortcut — shown only on step 1 */}
                  <div className="mb-5 flex items-center justify-between gap-3 p-3 rounded-xl bg-[#EEEDFE]/50 border border-[#7F77DD]/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-[#534AB7] uppercase tracking-wider mb-1">Last session</p>
                      <p className="text-[12px] text-lb-ink font-medium truncate">
                        {langDisplay(LAST_SESSION.fromLang)} → {langDisplay(LAST_SESSION.toLang)}
                        &nbsp;·&nbsp;{LAST_SESSION.category}
                        &nbsp;·&nbsp;{LAST_SESSION.interpreter.name}
                        &nbsp;·&nbsp;{LAST_SESSION.duration} min
                      </p>
                    </div>
                    <button
                      onClick={handleBookAgain}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[12px] font-medium rounded-lg transition-colors"
                    >
                      <RepeatIcon />
                      Book again
                    </button>
                  </div>

                  <StepHeader
                    title="What languages do you need?"
                    hint="Select the language you speak, then the language you need interpretation in."
                  />
                  <div className="max-w-xl w-full">
                    <div className="mb-5">
                      <p className="text-[11px] font-semibold text-lb-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-lb-border flex items-center justify-center text-[9px] font-bold text-lb-muted">1</span>
                        I am speaking in
                      </p>
                      {/* Fix #2: display name, not locale code */}
                      {fromLang && (
                        <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#7F77DD] border border-[#7F77DD]">
                          <span className="text-[13px] font-semibold text-white flex-1">{fromLangName}</span>
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/25 text-white">
                            <CheckIcon />
                          </span>
                        </div>
                      )}
                      <LanguageSelector
                        fromLang={fromLang}
                        toLang={toLang}
                        onFromChange={setFromLang}
                        onToChange={handleToLangChange}
                        onSwap={handleSwapLanguages}
                      />
                    </div>
                    {/* Fix #2: show display name for to-language pill */}
                    {toLangChosen && (
                      <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#7F77DD] border border-[#7F77DD]">
                        <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mr-1">Interpretation in</span>
                        <span className="text-[13px] font-semibold text-white flex-1">{toLangName}</span>
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/25 text-white">
                          <CheckIcon />
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-3 bg-[#EEEDFE]/40 rounded-lg border border-[#EEEDFE]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] shrink-0" />
                      <p className="text-[11px] text-[#534AB7]">
                        Select your interpretation language to continue automatically.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 2: Session Type ── */}
              {step === 2 && (
                <>
                  <StepHeader
                    title="How would you like to connect?"
                    hint="Choose your session type — screen advances automatically."
                  />
                  <div className="max-w-xl w-full">
                    <p className="text-[11px] font-semibold text-lb-muted uppercase tracking-wider mb-3">Session type</p>
                    {/* Fix #6 (child component): SessionTypeSelector needs equal rest-state visual weight */}
                    <SessionTypeSelector selected={sessionType} onSelect={handleTypeSelect} />
                  </div>
                </>
              )}

              {/* ── STEP 3: Duration ── */}
              {step === 3 && (
                <>
                  <StepHeader
                    title="How long do you need?"
                    hint="Select a duration — screen advances automatically."
                  />
                  <div className="max-w-xl w-full">
                    <p className="text-[11px] font-semibold text-lb-muted uppercase tracking-wider mb-3">Duration</p>
                    {/* Fix #9 (child component): DurationSelector needs to show all options in 2×2 grid without pagination */}
                    <DurationSelector
                      selected={duration}
                      onSelect={handleDurationSelect}
                      sessionType={sessionType || 'audio'}
                    />
                  </div>
                </>
              )}

              {/* ── STEP 4: Category ── */}
              {step === 4 && (
                <>
                  <StepHeader
                    title="What is the session for?"
                    hint="Tap a category to continue — we'll match you with specialists in that field."
                  />
                  <div className="flex-1 min-h-0">
                    <CategoryGrid selected={selectedCategory} onSelect={handleCategorySelect} />
                  </div>
                </>
              )}

              {/* ── STEP 5: Interpreter ── */}
              {step === 5 && (
                <>
                  <StepHeader
                    title="Choose your interpreter"
                    hint="Vetted professionals · Background checked · 4.9★ average"
                  />
                  <div className="flex-1 min-h-0">
                    {/*
                      Fix #7 (child component): InterpreterCards needs a badge legend above
                        the grid — one line explaining Top Rated / Expert / Pro.
                      Fix #8 (child component): bio lines need clean single-sentence truncation.
                      Fix #12 (child component): each card needs availability signal
                        ("Available now" green dot or "Joins in ~2 min" with clock icon).
                    */}
                    <InterpreterCards selected={selectedInterpreter} onSelect={setSelectedInterpreter} />
                  </div>
                  {/* Manual confirm — only step that requires an explicit button */}
                  <div className="shrink-0 pt-4 mt-2 border-t border-lb-border">
                    <button
                      onClick={advance}
                      disabled={!selectedInterpreter}
                      className={`w-full h-11 text-[13px] font-medium rounded-lg transition-colors ${
                        selectedInterpreter
                          ? 'bg-[#7F77DD] hover:bg-[#534AB7] text-white'
                          : 'bg-lb-surface text-lb-muted cursor-not-allowed border border-lb-border'
                      }`}
                    >
                      {selectedInterpreter
                        ? `Continue with ${interpreterName} →`
                        : 'Select an interpreter to continue'}
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 6: Review & Confirm ── */}
              {step === 6 && (
                <>
                  <StepHeader
                    title="Review your booking"
                    hint="Everything looks right? Connect when ready."
                  />
                  <div className="flex flex-col gap-3 max-w-2xl w-full">

                    {/* Fix #1: on-demand indicator — replaces fabricated date/time */}
                    <div className="flex items-center gap-2 p-2.5 bg-[#EAF3DE]/60 border border-[#C6DFA5] rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] shrink-0 animate-pulse" />
                      <p className="text-[11px] font-medium text-[#3B6D11]">
                        On-demand · Your interpreter will join within &lt;1 min
                      </p>
                    </div>

                    {/* Socket error banner (shown after cancel + retry) */}
                    {connectError && (
                      <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <WarnIcon />
                        <p className="text-[12px] text-red-700">{connectError}</p>
                      </div>
                    )}

                    {/* Summary cards — Fix #2: human-readable language names */}
                    <div className="grid grid-cols-2 gap-3">
                      <ConfirmDetail
                        label="Languages"
                        value={`${fromLangName} → ${toLangName}`}
                        onEdit={() => { setDirection('back'); setStep(1) }}
                      />
                      <ConfirmDetail
                        label="Session"
                        value={`${
                          sessionType === 'audio' ? 'Audio'
                            : sessionType === 'video' ? 'Video'
                              : sessionType ?? '—'
                        } · ${duration ?? '—'} min`}
                        onEdit={() => { setDirection('back'); setStep(2) }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ConfirmDetail
                        label="Category"
                        value={selectedCategory ?? '—'}
                        onEdit={() => { setDirection('back'); setStep(4) }}
                      />
                      <ConfirmDetail
                        label="Interpreter"
                        value={interpreterName ?? '—'}
                        onEdit={() => { setDirection('back'); setStep(5) }}
                      />
                    </div>

                    {/* Fix #11: Payment — Wallet tile + card tiles */}
                    <div className="p-3 bg-lb-surface rounded-lg border border-lb-border">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-[12px] font-medium text-lb-ink flex items-center gap-2">
                          <CardIcon />
                          Payment method
                        </p>
                        <button className="text-[11px] text-[#7F77DD]">Manage</button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Wallet option */}
                        <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          selectedPayment === 'wallet'
                            ? 'border-[#7F77DD] bg-white'
                            : 'border-lb-border hover:border-lb-muted'
                        }`}>
                          <input
                            type="radio"
                            name="payment"
                            checked={selectedPayment === 'wallet'}
                            onChange={() => setSelectedPayment('wallet')}
                            className="w-3.5 h-3.5 accent-[#7F77DD] cursor-pointer shrink-0"
                          />
                          <WalletIcon />
                          <span className="text-[12px] text-lb-ink flex-1">Wallet balance</span>
                          <span className={`text-[11px] font-semibold ml-auto shrink-0 ${
                            walletCoversTotal ? 'text-[#1D9E75]' : 'text-amber-600'
                          }`}>
                            ${WALLET_BALANCE.toFixed(2)} available
                          </span>
                        </label>

                        {/* Confirmation note when wallet covers it */}
                        {selectedPayment === 'wallet' && walletCoversTotal && (
                          <p className="flex items-center gap-1.5 px-1 text-[11px] text-[#1D9E75] font-medium">
                            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#1D9E75] text-white shrink-0">
                              <CheckIcon />
                            </span>
                            Wallet covers the full amount — no card charge
                          </p>
                        )}

                        {/* Card tiles */}
                        <div className="flex gap-2">
                          {[
                            { id: '4242', label: 'VISA •••• 4242',       expiry: '12/28', badge: 'VISA' },
                            { id: '8888', label: 'Mastercard •••• 8888', expiry: '12/30', badge: 'MC'   },
                          ].map((card) => (
                            <label key={card.id} className={`flex-1 flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                              selectedPayment === card.id
                                ? 'border-[#7F77DD] bg-white'
                                : 'border-lb-border hover:border-lb-muted'
                            }`}>
                              <input
                                type="radio"
                                name="payment"
                                checked={selectedPayment === card.id}
                                onChange={() => setSelectedPayment(card.id)}
                                className="w-3.5 h-3.5 accent-[#7F77DD] cursor-pointer shrink-0"
                              />
                              <span className="text-[11px] font-medium text-lb-muted shrink-0">{card.badge}</span>
                              <span className="text-[12px] text-lb-ink flex-1">{card.label.split(' ')[1]}</span>
                              <span className="text-[10px] text-lb-muted ml-auto shrink-0">{card.expiry}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Insufficient funds warning — only when wallet is chosen and short */}
                    {hasInsufficientFunds && (
                      <div className="flex items-start gap-2.5 p-3 bg-[#FFF8E6] border border-[#F0D070] rounded-lg">
                        <WarnIcon />
                        <div>
                          <p className="text-[12px] font-medium text-[#7A5800]">Insufficient wallet balance</p>
                          <p className="text-[11px] text-[#9A7000] mt-0.5">
                            You need ${(total - WALLET_BALANCE).toFixed(2)} more. Top up your wallet or choose a card above.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Fix #5: Unified purple CTA — was dark navy #1a1635 */}
                    <div className="mt-2">
                      <button
                        onClick={handleConnectCall}
                        disabled={hasInsufficientFunds}
                        className={`w-full h-12 flex items-center justify-center gap-2.5 text-[14px] font-medium rounded-lg transition-colors ${
                          hasInsufficientFunds
                            ? 'bg-lb-surface text-lb-muted cursor-not-allowed border border-lb-border'
                            : 'bg-[#7F77DD] hover:bg-[#534AB7] text-white'
                        }`}
                      >
                        <PhoneIcon />
                        {hasInsufficientFunds
                          ? 'Add funds to connect'
                          : `Connect now · $${total.toFixed(2)}`}
                      </button>

                      {/* Fix #14: Terms / charge acknowledgement */}
                      <p className="text-center text-[10px] text-lb-muted mt-2 px-4 leading-relaxed">
                        By connecting you agree to our{' '}
                        <a href="/terms" className="underline underline-offset-2 hover:text-lb-ink transition-colors">
                          Terms of Service
                        </a>
                        . Sessions are non-refundable once started.
                      </p>

                      <div className="flex items-center justify-center gap-4 mt-2.5">
                        <span className="flex items-center gap-1.5 text-[10px] text-lb-muted">
                          <ShieldIcon />
                          100% Secure
                        </span>
                        <span className="text-lb-border">·</span>
                        <span className="text-[10px] text-lb-muted">HIPAA-ready</span>
                        <span className="text-lb-border">·</span>
                        <span className="text-[10px] text-lb-muted">Connected in under 60 seconds</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 7: Connecting Screen — Fix #3 ── */}
              {step === 7 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8 text-center">
                  {/* Pulsing avatar */}
                  <div className="relative flex items-center justify-center">
                    <style>{`
                      @keyframes lb-ring {
                        0%   { transform: scale(1);    opacity: 0.7; }
                        100% { transform: scale(1.55); opacity: 0;   }
                      }
                    `}</style>
                    {/* Outer ring */}
                    <div
                      className="absolute w-20 h-20 rounded-full border-2 border-[#7F77DD]/30"
                      style={{ animation: 'lb-ring 1.6s ease-out 0.3s infinite' }}
                    />
                    {/* Inner ring */}
                    <div
                      className="absolute w-20 h-20 rounded-full border-2 border-[#7F77DD]/20"
                      style={{ animation: 'lb-ring 1.6s ease-out 0.7s infinite' }}
                    />
                    {/* Avatar */}
                    <div className="relative w-20 h-20 rounded-full bg-[#EEEDFE] border-2 border-[#7F77DD]/40 flex items-center justify-center text-[26px] font-semibold text-[#534AB7] select-none">
                      {interpreterName
                        ? interpreterName.split(' ').map((n) => n[0]).join('')
                        : '?'}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-[18px] font-semibold text-lb-ink mb-1">
                      Connecting you to {interpreterName ?? 'your interpreter'}…
                    </p>
                    <p className="text-[13px] text-lb-muted">
                      {sessionType === 'video' ? 'Video' : 'Audio'}
                      &nbsp;·&nbsp;{fromLangName} → {toLangName}
                      &nbsp;·&nbsp;{duration} min
                    </p>
                  </div>

                  <ConnectingDots />

                  {/* Session summary card */}
                  <div className="w-full max-w-sm p-4 bg-lb-surface rounded-xl border border-lb-border text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse shrink-0" />
                      <span className="text-[11px] font-semibold text-[#1D9E75] uppercase tracking-wide">
                        Your interpreter will join within &lt;1 min
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-lb-muted">Category</span>
                        <span className="text-lb-ink font-medium">{selectedCategory ?? '—'}</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-lb-muted">Duration</span>
                        <span className="text-lb-ink font-medium">{duration} min</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-lb-muted">Total charge</span>
                        <span className="text-lb-ink font-medium">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-lb-muted">Paid via</span>
                        <span className="text-lb-ink font-medium capitalize">
                          {selectedPayment === 'wallet' ? 'Wallet' : `Card •••• ${selectedPayment}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cancel */}
                  <button
                    onClick={handleCancelConnect}
                    className="text-[12px] text-lb-muted hover:text-lb-ink transition-colors"
                  >
                    Cancel request
                  </button>
                </div>
              )}

            </StepSlide>
          </div>
        </div>

        {/* Fix #10: Back button — consistent position, Steps 2–6 only */}
        {step > 1 && step <= 6 && (
          <div className="shrink-0 h-12 flex items-center">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-lb-muted rounded-lg border border-lb-border bg-lb-surface hover:border-[#7F77DD] hover:text-lb-ink transition-colors"
            >
              <ChevronLeft />
              Back
            </button>
          </div>
        )}
      </div>

      {/* ── Sticky Session Summary ─────────────────────────────────────────── */}
      {/* Fix #4: progressive props — null passed for fields not yet confirmed  */}
      {/* Fix #1: isOnDemand=true so sidebar removes fabricated date/time       */}
      {/* Fix #2: display names passed instead of locale codes                  */}
      <div className="w-[320px] shrink-0 py-2">
        <div className="sticky top-2">
          <SessionSummary
            fromLang={fromLangName}
            toLang={toLangChosen ? toLangName : null}
            sessionType={step >= 3 ? sessionType : null}
            duration={step >= 4 ? duration : null}
            walletBalance={WALLET_BALANCE}
            hasInsufficientFunds={hasInsufficientFunds}
            selectedInterpreter={step >= 6 ? interpreterName : null}
            selectedCategory={step >= 5 ? selectedCategory : null}
            isOnDemand={true}
            currentStep={step}
          />
        </div>
      </div>

    </div>
  )
}