// BookingPage.jsx — rebuilt to match interpreter lb-* design language
// Same tokens · same card anatomy · same spacing · same pill/badge system
// Booking flow feels like a natural extension of the dashboard ecosystem

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import LanguageSelector from '../components/LanguageSelector'
import SessionTypeSelector from '../components/SessionTypeSelector'
import DurationSelector from '../components/DurationSelector'
import CategoryGrid from '../components/CategoryGrid'
import InterpreterCards from '../components/InterpreterCards'
import SessionSummary from '../components/SessionSummary'

// Interpreter list — ids must match what the server uses to look up socket connections
const INTERPRETERS = [
  { id: 1, name: 'Abid Khan' },
  { id: 2, name: 'Ahmad Zia' },
  { id: 3, name: 'Rajinder Singh' },
  { id: 4, name: 'Imran Sandhu' },
  { id: 5, name: 'Amrit Kaur' },
]

const WALLET_BALANCE = 45.60
const STEPS = [
  { id: 1, label: 'Setup' },
  { id: 2, label: 'Category' },
  { id: 3, label: 'Interpreter' },
  { id: 4, label: 'Confirm' },
]

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M15 19l-7-7 7-7"/>
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M9 5l7 7-7 7"/>
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

// ─── Step Breadcrumb ──────────────────────────────────────────────────────────
function StepBar({ step }) {
  return (
    <div className="lb-card shrink-0">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => {
            const done   = step > s.id
            const active = step === s.id
            return (
              <div key={s.id} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  done   ? 'bg-[#7F77DD] text-white' :
                  active ? 'bg-[#EEEDFE] text-[#534AB7]' :
                           'bg-lb-surface text-lb-muted'
                }`}>
                  {done
                    ? <CheckIcon />
                    : <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[9px] font-bold">{s.id}</span>
                  }
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <span className="text-lb-border text-[10px]">›</span>
                )}
              </div>
            )
          })}
        </div>
        <span className="text-[11px] text-lb-muted">Step {step} of {STEPS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-lb-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-[#7F77DD] rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ─── Nav bar ─────────────────────────────────────────────────────────────────
function NavBar({ step, goBack, goNext, nextLabel, nextDisabled }) {
  return (
    <div className="shrink-0 h-14 flex items-center justify-between">
      {step > 1 ? (
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-lb-muted rounded-lg border border-lb-border bg-lb-surface hover:border-[#7F77DD] hover:text-lb-ink transition-colors"
        >
          <ChevronLeft />
          Back
        </button>
      ) : <div />}

      {step < 4 && (
        <button
          onClick={goNext}
          disabled={nextDisabled}
          className={`flex items-center gap-2 px-5 py-2 text-[13px] font-medium rounded-lg transition-colors ${
            !nextDisabled
              ? 'bg-[#7F77DD] text-white hover:bg-[#534AB7]'
              : 'bg-lb-surface text-lb-muted cursor-not-allowed border border-lb-border'
          }`}
        >
          {nextLabel}
          <ChevronRight />
        </button>
      )}
    </div>
  )
}

function StepLabel({ label }) {
  return (
    <p className="text-[11px] font-medium text-[#534AB7] bg-[#EEEDFE] px-2.5 py-1 rounded-full inline-block mb-5 shrink-0">
      {label}
    </p>
  )
}

function SectionHead({ num, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-5 h-5 rounded-full bg-[#7F77DD] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{num}</span>
      <p className="text-[12px] font-medium text-lb-muted uppercase tracking-wider">{title}</p>
      <div className="flex-1 h-px bg-lb-border" />
    </div>
  )
}

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

  const [step, setStep] = useState(1)
  const [fromLang, setFromLang] = useState('en-us')
  const [toLang, setToLang] = useState('ps-east')
  const [sessionType, setSessionType] = useState('audio')
  const [duration, setDuration] = useState(30)
  const [selectedInterpreter, setSelectedInterpreter] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState('4242')
  const [connecting, setConnecting] = useState(false)

  const handleSwapLanguages = () => { setFromLang(toLang); setToLang(fromLang) }

  const rate = sessionType === 'video' ? 1.20 : 0.99
  const base = +(duration * rate).toFixed(2)
  const platformFee = +(base * 0.05).toFixed(2)
  const total = +(base + platformFee).toFixed(2)
  const hasInsufficientFunds = total > WALLET_BALANCE
  const interpreterName = INTERPRETERS.find(i => i.id === selectedInterpreter)?.name ?? null

  const canAdvance = () => {
    if (step === 1) return true
    if (step === 2) return !!selectedCategory
    if (step === 3) return !!selectedInterpreter
    return false
  }

  const goNext = () => { if (step < 4 && canAdvance()) setStep(s => s + 1) }
  const goBack = () => { if (step > 1) setStep(s => s - 1) }

  // ─── Connect Call ───────────────────────────────────────────────────────────
  const handleConnectCall = () => {
    const socket = getSocket()

    if (!socket || !socket.connected) {
      console.error('Socket not connected')
      return
    }

    setConnecting(true)

    // FIX: emit 'request-call' (matches server requestHandler.mjs)
    socket.emit('request-call', {
      language: fromLang,
      sessionType,
    })

    console.log('📞 request-call emitted', { language: fromLang, sessionType })

    // FIX: wait for server 'call-requested' event before navigating
    socket.once('call-requested', ({ channelName, agoraToken }) => {
      console.log('✅ call-requested received', { channelName, agoraToken })
      setConnecting(false)
      navigate(`/call/${channelName}?token=${agoraToken ?? ''}&type=${sessionType}`)
    })

    // Handle error from server
    socket.once('error', (err) => {
      console.error('❌ request-call error:', err)
      setConnecting(false)
    })
  }

  return (
    <div className="h-full flex gap-4 bg-lb-canvas">

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden py-2">

        {/* Step breadcrumb */}
        <StepBar step={step} />

        {/* Step panel */}
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex-1 min-h-0 lb-card overflow-hidden">

            {/* STEP 1 */}
            {step === 1 && (
              <div className="h-full flex flex-col p-5 overflow-y-auto no-scrollbar">
                <StepLabel label="Step 1 — Session setup" />
                <div className="flex flex-col gap-10 max-w-3xl mx-auto w-full">
                  <div>
                    <SectionHead num="1" title="Choose languages" />
                    <LanguageSelector
                      fromLang={fromLang} toLang={toLang}
                      onFromChange={setFromLang} onToChange={setToLang}
                      onSwap={handleSwapLanguages}
                    />
                  </div>
                  <div>
                    <SectionHead num="2" title="Session type" />
                    <SessionTypeSelector selected={sessionType} onSelect={setSessionType} />
                  </div>
                  <div>
                    <SectionHead num="3" title="Duration" />
                    <DurationSelector selected={duration} onSelect={setDuration} sessionType={sessionType} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="h-full flex flex-col p-5">
                <StepLabel label="Step 2 — Select category" />
                <div className="flex-1 min-h-0">
                  <CategoryGrid selected={selectedCategory} onSelect={setSelectedCategory} />
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="h-full flex flex-col p-5">
                <StepLabel label="Step 3 — Choose interpreter" />
                <div className="flex-1 min-h-0">
                  <InterpreterCards selected={selectedInterpreter} onSelect={setSelectedInterpreter} />
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="h-full flex flex-col p-5 overflow-y-auto no-scrollbar">
                <StepLabel label="Step 4 — Review & confirm" />

                <div className="flex flex-col gap-3 max-w-2xl w-full">
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <ConfirmDetail
                      label="Session"
                      value={`${sessionType === 'audio' ? 'Audio' : 'Video'} · ${duration} min`}
                    />
                    <ConfirmDetail
                      label="Category"
                      value={selectedCategory ?? '—'}
                      onEdit={() => setStep(2)}
                    />
                  </div>
                  <ConfirmDetail
                    label="Interpreter"
                    value={interpreterName ?? '—'}
                    onEdit={() => setStep(3)}
                  />

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
                          : 'bg-[#7F77DD] hover:bg-[#534AB7] text-white'
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
              </div>
            )}
          </div>

          {/* Nav bar */}
          <NavBar
            step={step}
            goBack={goBack}
            goNext={goNext}
            nextLabel={
              step === 1 ? 'Choose a category' :
              step === 2 ? 'Choose an interpreter' :
              'Review & confirm'
            }
            nextDisabled={!canAdvance()}
          />
        </div>
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