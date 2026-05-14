import { useState } from 'react'
import {
  ChevronLeft, ShieldCheck,
  Check, Phone, ArrowRight, CreditCard, AlertTriangle
} from 'lucide-react'
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
  { id: 1, label: 'Setup' },
  { id: 2, label: 'Category' },
  { id: 3, label: 'Interpreter' },
  { id: 4, label: 'Confirm' },
]

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [fromLang, setFromLang] = useState('en-us')
  const [toLang, setToLang] = useState('ps-east')
  const [sessionType, setSessionType] = useState('audio')
  const [duration, setDuration] = useState(30)
  const [selectedInterpreter, setSelectedInterpreter] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState('4242')

  const handleSwapLanguages = () => {
    setFromLang(toLang)
    setToLang(fromLang)
  }

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

  const NavBar = ({ nextLabel, nextDisabled }) => (
    <div className="shrink-0 h-14 flex items-center justify-between">
      {step > 1 ? (
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 text-[13px] font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      ) : <div />}

      {step < 4 && (
        <button
          onClick={goNext}
          disabled={nextDisabled}
          className={`flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
            !nextDisabled
              ? 'bg-violet-600 text-white hover:bg-violet-700 hover:shadow-md'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {nextLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  return (
    <div className="h-full flex gap-6 bg-[#F8F7FC]">

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden py-2">

        {/* Step breadcrumbs */}
        <div className="shrink-0">
          <div className="bg-white rounded-2xl shadow-sm px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {STEPS.map((s, i) => {
                  const isCompleted = step > s.id
                  const isActive = step === s.id
                  return (
                    <div key={s.id} className="flex items-center gap-1">
                      <button
                        onClick={() => { if (isCompleted) setStep(s.id) }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                          isCompleted
                            ? 'bg-violet-600 text-white cursor-pointer hover:bg-violet-700'
                            : isActive
                            ? 'bg-violet-100 text-violet-700 cursor-default'
                            : 'bg-slate-100 text-slate-400 cursor-default'
                        }`}
                      >
                        {isCompleted
                          ? <Check className="w-3 h-3" />
                          : <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold border border-current">{s.id}</span>
                        }
                        {s.label}
                      </button>
                      {i < STEPS.length - 1 && (
                        <span className="text-slate-200 text-[10px]">›</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Step {step} of {STEPS.length}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step panel */}
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm overflow-hidden">

            {/* ── STEP 1 ── Guided vertical sections */}
            {step === 1 && (
              <div className="h-full flex flex-col p-7 overflow-y-auto no-scrollbar animate-fadeIn">
                <p className="shrink-0 text-[11px] font-semibold text-violet-500 uppercase tracking-widest mb-8">
                  Step 1 — Session Setup
                </p>

                <div className="flex flex-col gap-12 max-w-3xl mx-auto w-full">
                  {/* FIX: changed gap-8 to gap-12 */}

                  {/* Section: Languages */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                      <p className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">Choose Languages</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <LanguageSelector
                      fromLang={fromLang}
                      toLang={toLang}
                      onFromChange={setFromLang}
                      onToChange={setToLang}
                      onSwap={handleSwapLanguages}
                    />
                  </div>

                  {/* Section: Session Type */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                      <p className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">Choose Session Type</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <SessionTypeSelector
                      selected={sessionType}
                      onSelect={setSessionType}
                    />
                  </div>

                  {/* Section: Duration */}
                  <div className="pt-4">
                    {/* FIX: added pt-4 for extra top padding */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                      <p className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider">Choose Duration</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <DurationSelector
                      selected={duration}
                      onSelect={setDuration}
                      sessionType={sessionType}
                    />
                  </div>

                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="h-full flex flex-col p-7 animate-fadeIn">
                <div className="shrink-0 mb-4">
                  <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest">
                    Step 2 — Select Category
                  </p>
                </div>
                <div className="flex-1 min-h-0">
                  <CategoryGrid
                    selected={selectedCategory}
                    onSelect={(cat) => setSelectedCategory(cat)}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="h-full flex flex-col p-7 animate-fadeIn">
                <div className="shrink-0 mb-4">
                  <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest">
                    Step 3 — Choose Interpreter
                  </p>
                </div>
                <div className="flex-1 min-h-0">
                  <InterpreterCards
                    selected={selectedInterpreter}
                    onSelect={(interp) => setSelectedInterpreter(interp)}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 4 ── */}
            {step === 4 && (
              <div className="h-full flex flex-col p-7 animate-fadeIn">
                <div className="shrink-0 mb-4">
                  <p className="text-[11px] font-semibold text-violet-500 uppercase tracking-widest">
                    Step 4 — Review & Confirm
                  </p>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-4">

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Session</p>
                      <p className="text-[13px] font-semibold text-slate-800">
                        {sessionType === 'audio' ? 'Audio Call' : 'Video Call'} · {duration} min
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">${total.toFixed(2)} total · HIPAA-ready</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</p>
                      <p className="text-[13px] font-semibold text-slate-800">{selectedCategory}</p>
                      <button
                        onClick={() => setStep(2)}
                        className="text-[11px] text-violet-500 hover:text-violet-700 mt-1 transition-colors"
                      >
                        Change →
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[12px] font-semibold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        Payment Method
                      </p>
                      <button className="text-[11px] text-violet-500 hover:text-violet-700 font-medium transition-colors">
                        Manage
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${selectedPayment === '4242' ? 'bg-white border-violet-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" name="payment" checked={selectedPayment === '4242'} onChange={() => setSelectedPayment('4242')} className="w-3.5 h-3.5 accent-violet-600 shrink-0 cursor-pointer" />
                        <span className="text-[11px] font-bold text-blue-700 italic shrink-0">VISA</span>
                        <span className="text-[12px] text-slate-600">•••• 4242</span>
                        <span className="text-[10px] text-slate-400 ml-auto shrink-0">12/28</span>
                      </label>
                      <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${selectedPayment === '8888' ? 'bg-white border-violet-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" name="payment" checked={selectedPayment === '8888'} onChange={() => setSelectedPayment('8888')} className="w-3.5 h-3.5 accent-violet-600 shrink-0 cursor-pointer" />
                        <div className="flex shrink-0">
                          <div className="w-3.5 h-3.5 rounded-full bg-red-500/90" />
                          <div className="w-3.5 h-3.5 rounded-full bg-orange-400/90 -ml-2" />
                        </div>
                        <span className="text-[12px] text-slate-600">•••• 8888</span>
                        <span className="text-[10px] text-slate-400 ml-auto shrink-0">12/30</span>
                      </label>
                    </div>
                  </div>

                  {hasInsufficientFunds && (
                    <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="leading-tight">
                        <p className="text-[11px] font-semibold text-amber-800">Insufficient Funds</p>
                        <p className="text-[10px] text-amber-600 mt-0.5">
                          You need ${(total - WALLET_BALANCE).toFixed(2)} more. Add funds to continue.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    <button
                      disabled={hasInsufficientFunds}
                      className={`w-full h-14 flex items-center justify-center gap-3 text-[15px] font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                        hasInsufficientFunds
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-500/30 active:scale-[0.99]'
                      }`}
                    >
                      <Phone className="w-5 h-5" />
                      {hasInsufficientFunds ? 'Add Funds to Connect' : `Connect Now · $${total.toFixed(2)}`}
                    </button>
                    <div className="flex items-center justify-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        100% Secure
                      </span>
                      <span className="text-slate-200">·</span>
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        HIPAA-ready
                      </span>
                      <span className="text-slate-200">·</span>
                      <span className="text-[11px] text-slate-400">Connected in under 60 seconds</span>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Nav bar */}
          <NavBar
            nextLabel={
              step === 1 ? 'Choose a Category' :
              step === 2 ? 'Choose an Interpreter' :
              'Review & Confirm'
            }
            nextDisabled={!canAdvance()}
          />
        </div>
      </div>

      {/* Sticky Session Summary */}
      <div className="w-[340px] shrink-0 py-2">
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