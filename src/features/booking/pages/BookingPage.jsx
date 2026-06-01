// BookingPage.jsx — 5-step auto-advance booking flow
// Steps: 1 Languages · 2 Type+Duration · 3 Categories · 4 Interpreters · 5 Review
// Auto-advance on selection (except step 4 interpreter — manual confirm)
// Back button only for correction · Slide transitions · 5-dot progress indicator

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import LanguageSelector from '../components/LanguageSelector'
import SessionTypeSelector from '../components/SessionTypeSelector'
import DurationSelector from '../components/DurationSelector'
import CategoryGrid from '../components/CategoryGrid'
import InterpreterCards from '../components/InterpreterCards'
import SessionSummary from '../components/SessionSummary'

const INTERPRETERS = [
  { id: 1, name: 'Abid Khan' },
  { id: 2, name: 'Ahmad Zia' },
  { id: 3, name: 'Rajinder Singh' },
  { id: 4, name: 'Imran Sandhu' },
  { id: 5, name: 'Amrit Kaur' },
]

const WALLET_BALANCE = 45.60

const STEPS = [
  { id: 1, label: 'Languages' },
  { id: 2, label: 'Session' },
  { id: 3, label: 'Category' },
  { id: 4, label: 'Interpreter' },
  { id: 5, label: 'Confirm' },
]

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
    </svg>
  )
}
function CardIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
    </svg>
  )
}
function WarnIcon() {
  return (
    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M5 13l4 4L19 7"/>
    </svg>
  )
}

// ─── 5-Dot Progress Indicator ─────────────────────────────────────────────────
function ProgressDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-3 shrink-0 py-1">
      {STEPS.map((s) => {
        const done   = step > s.id
        const active = step === s.id
        return (
          <div key={s.id} className="flex flex-col items-center gap-1.5">
            <div
              className={`rounded-full transition-all duration-400 ${
                done
                  ? 'w-2.5 h-2.5 bg-[#7F77DD]'
                  : active
                    ? 'w-3 h-3 bg-[#7F77DD] ring-4 ring-[#EEEDFE]'
                    : 'w-2 h-2 bg-lb-border'
              }`}
            />
            <span className={`text-[9px] font-medium uppercase tracking-wide transition-colors ${
              active ? 'text-[#534AB7]' : done ? 'text-[#7F77DD]' : 'text-lb-muted'
            }`}>
              {s.label}
            </span>
          </div>
        )
      })}
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

// ─── Main BookingPage ─────────────────────────────────────────────────────────
export default function BookingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep]                         = useState(1)
  const [direction, setDirection]               = useState('forward')
  const [fromLang, setFromLang]                 = useState('en-us')
  const [toLang, setToLang]                     = useState('ps-east')
  const [toLangChosen, setToLangChosen]         = useState(false)
  const [sessionType, setSessionType]           = useState(null)
  const [duration, setDuration]                 = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedInterpreter, setSelectedInterpreter] = useState(null)
  const [selectedPayment, setSelectedPayment]   = useState('4242')
  const [connecting, setConnecting]             = useState(false)

  const advance = () => {
    setDirection('forward')
    setStep(s => Math.min(5, s + 1))
  }

  const goBack = () => {
    setDirection('back')
    setStep(s => Math.max(1, s - 1))
  }

  // ─── Auto-advance handlers ────────────────────────────────────────────────

  // Step 1: auto-advance when the "To" language is chosen (both slots filled)
  const handleToLangChange = (code) => {
    setToLang(code)
    setToLangChosen(true)
    setTimeout(advance, 320) // brief pause so selection is visible
  }

  // Step 2: session type chosen → if duration already set, advance; else wait for duration
  const handleTypeSelect = (type) => {
    setSessionType(type)
    if (duration) setTimeout(advance, 320)
  }

  // Step 2: duration chosen → if type already set, advance; else wait for type
  const handleDurationSelect = (min) => {
    setDuration(min)
    if (sessionType) setTimeout(advance, 320)
  }

  // Step 3: category chosen → auto-advance
  const handleCategorySelect = (id) => {
    setSelectedCategory(id)
    setTimeout(advance, 320)
  }

  // Step 4: interpreter selected — manual confirm via button

  const handleSwapLanguages = () => { setFromLang(toLang); setToLang(fromLang) }

  const rate = sessionType === 'video' ? 1.20 : 0.99
  const base = duration ? +(duration * rate).toFixed(2) : 0
  const platformFee = +(base * 0.05).toFixed(2)
  const total = +(base + platformFee).toFixed(2)
  const hasInsufficientFunds = total > WALLET_BALANCE
  const interpreterName = INTERPRETERS.find(i => i.id === selectedInterpreter)?.name ?? null

  // ─── Connect Call ───────────────────────────────────────────────────────────
  const handleConnectCall = () => {
    const socket = getSocket()
    if (!socket || !socket.connected) { console.error('Socket not connected'); return }
    setConnecting(true)
    socket.emit('request-call', { language: fromLang, sessionType })
    socket.once('call-requested', ({ channelName, agoraToken }) => {
      setConnecting(false)
      const tokenString = agoraToken?.token ?? agoraToken ?? ''
      navigate(`/call/${channelName}?token=${encodeURIComponent(tokenString)}&type=${sessionType}`)
    })
    socket.once('error', (err) => { console.error('request-call error:', err); setConnecting(false) })
  }

  return (
    <div className="h-full flex gap-4 bg-lb-canvas">

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden py-2">

        {/* Progress dots */}
        <div className="lb-card shrink-0 py-3">
          <ProgressDots step={step} />
        </div>

        {/* Step panel */}
        <div className="flex-1 min-h-0 lb-card overflow-hidden relative">
          <div className="h-full p-5 overflow-y-auto no-scrollbar">
            <StepSlide direction={direction} stepKey={step}>

              {/* ── STEP 1: Languages ── */}
              {step === 1 && (
                <>
                  <StepHeader
                    title="What languages do you need?"
                    hint="Select the language you speak, then the language you need interpretation in."
                  />
                  {/* Two clear labelled slots */}
                  <div className="max-w-xl w-full">
                    {/* Speaking slot */}
                    <div className="mb-5">
                      <p className="text-[11px] font-semibold text-lb-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-lb-border flex items-center justify-center text-[9px] font-bold text-lb-muted">1</span>
                        I am speaking in
                      </p>
                      <LanguageSelector
                        fromLang={fromLang}
                        toLang={toLang}
                        onFromChange={setFromLang}
                        onToChange={handleToLangChange}
                        onSwap={handleSwapLanguages}
                      />
                    </div>
                    {/* Hint below */}
                    <div className="flex items-center gap-2 p-3 bg-[#EEEDFE]/40 rounded-lg border border-[#EEEDFE]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] shrink-0" />
                      <p className="text-[11px] text-[#534AB7]">
                        Select your interpretation language to continue automatically.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 2: Session Type + Duration ── */}
              {step === 2 && (
                <>
                  <StepHeader
                    title="How would you like to connect?"
                    hint="Choose the session type and duration. Screen advances automatically once both are selected."
                  />
                  <div className="max-w-xl w-full space-y-6">
                    <div>
                      <p className="text-[11px] font-semibold text-lb-muted uppercase tracking-wider mb-3">Session type</p>
                      <SessionTypeSelector selected={sessionType} onSelect={handleTypeSelect} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-lb-muted uppercase tracking-wider mb-3">Duration</p>
                      <DurationSelector selected={duration} onSelect={handleDurationSelect} sessionType={sessionType || 'audio'} />
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 3: Category ── */}
              {step === 3 && (
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

              {/* ── STEP 4: Interpreter ── */}
              {step === 4 && (
                <>
                  <StepHeader
                    title="Choose your interpreter"
                    hint="Vetted professionals · Background checked · 4.9★ average"
                  />
                  <div className="flex-1 min-h-0">
                    <InterpreterCards selected={selectedInterpreter} onSelect={setSelectedInterpreter} />
                  </div>
                  {/* Manual confirm — only step that needs a button */}
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
                      {selectedInterpreter ? `Continue with ${interpreterName} →` : 'Select an interpreter to continue'}
                    </button>
                  </div>
                </>
              )}

              {/* ── STEP 5: Review & Confirm ── */}
              {step === 5 && (
                <>
                  <StepHeader
                    title="Review your booking"
                    hint="Everything looks right? Connect when ready."
                  />
                  <div className="flex flex-col gap-3 max-w-2xl w-full">

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <ConfirmDetail
                        label="Languages"
                        value={`${fromLang} → ${toLang}`}
                        onEdit={() => { setDirection('back'); setStep(1) }}
                      />
                      <ConfirmDetail
                        label="Session"
                        value={`${sessionType === 'audio' ? 'Audio' : 'Video'} · ${duration} min`}
                        onEdit={() => { setDirection('back'); setStep(2) }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ConfirmDetail
                        label="Category"
                        value={selectedCategory ?? '—'}
                        onEdit={() => { setDirection('back'); setStep(3) }}
                      />
                      <ConfirmDetail
                        label="Interpreter"
                        value={interpreterName ?? '—'}
                        onEdit={() => { setDirection('back'); setStep(4) }}
                      />
                    </div>

                    {/* Payment method */}
                    <div className="p-3 bg-lb-surface rounded-lg border border-lb-border">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-[12px] font-medium text-lb-ink flex items-center gap-2">
                          <CardIcon />
                          Payment method
                        </p>
                        <button className="text-[11px] text-[#7F77DD]">Manage</button>
                      </div>
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
                            <input type="radio" name="payment" checked={selectedPayment === card.id} onChange={() => setSelectedPayment(card.id)} className="w-3.5 h-3.5 accent-[#7F77DD] cursor-pointer shrink-0" />
                            <span className="text-[11px] font-medium text-lb-muted shrink-0">{card.badge}</span>
                            <span className="text-[12px] text-lb-ink flex-1">{card.label.split(' ')[1]}</span>
                            <span className="text-[10px] text-lb-muted ml-auto shrink-0">{card.expiry}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Insufficient funds warning */}
                    {hasInsufficientFunds && (
                      <div className="flex items-start gap-2.5 p-3 bg-[#FFF8E6] border border-[#F0D070] rounded-lg">
                        <WarnIcon />
                        <div>
                          <p className="text-[12px] font-medium text-[#7A5800]">Insufficient funds</p>
                          <p className="text-[11px] text-[#9A7000] mt-0.5">
                            You need ${(total - WALLET_BALANCE).toFixed(2)} more. Add funds to continue.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-2">
                      <button
                        onClick={handleConnectCall}
                        disabled={hasInsufficientFunds || connecting}
                        className={`w-full h-12 flex items-center justify-center gap-2.5 text-[14px] font-medium rounded-lg transition-colors ${
                          hasInsufficientFunds || connecting
                            ? 'bg-lb-surface text-lb-muted cursor-not-allowed border border-lb-border'
                            : 'bg-[#1a1635] hover:bg-[#26215C] text-white'
                        }`}
                      >
                        <PhoneIcon />
                        {connecting
                          ? 'Connecting…'
                          : hasInsufficientFunds
                            ? 'Add funds to connect'
                            : `Connect now · $${total.toFixed(2)}`
                        }
                      </button>
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

            </StepSlide>
          </div>
        </div>

        {/* Back button — always below card, never inside step content */}
        {step > 1 && (
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

      {/* ── Sticky Session Summary ── */}
      <div className="w-[320px] shrink-0 py-2">
        <div className="sticky top-2">
          <SessionSummary
            fromLang={fromLang}
            toLang={toLang}
            sessionType={sessionType}
            duration={duration}
            walletBalance={WALLET_BALANCE}
            hasInsufficientFunds={hasInsufficientFunds}
            selectedInterpreter={interpreterName}
            selectedCategory={selectedCategory}
            currentStep={step}
          />
        </div>
      </div>
    </div>
  )
}