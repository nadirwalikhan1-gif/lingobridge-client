import { useState } from 'react'

// RatingModal.jsx — post-call rating modal
// Client sees: call quality + interpreter rating + comment
// Interpreter sees: call quality only

function StarRating({ value, onChange, label }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/70 text-sm">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <svg
              className={`w-9 h-9 transition-colors ${
                star <= value ? 'text-[#F5C518]' : 'text-white/20'
              }`}
              fill={star <= value ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function RatingModal({ role = 'client', onSubmit, onSkip }) {
  const isClient = role === 'client'

  const [callQuality, setCallQuality]         = useState(0)
  const [interpreterRating, setInterpreterRating] = useState(0)
  const [comment, setComment]                 = useState('')
  const [submitted, setSubmitted]             = useState(false)

  function handleSubmit() {
    if (callQuality === 0) return
    if (isClient && interpreterRating === 0) return

    const payload = isClient
      ? { callQuality, interpreterRating, comment }
      : { callQuality }

    onSubmit(payload)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a2e] rounded-2xl p-8 max-w-sm w-full flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#EEEDFE] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#7F77DD]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white text-lg font-medium">Thanks for your feedback!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm w-full flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-semibold">Rate your call</h2>
            <p className="text-white/50 text-xs mt-0.5">Your feedback helps us improve</p>
          </div>
          <button onClick={onSkip} className="text-white/30 hover:text-white/60 transition-colors text-xs">
            Skip
          </button>
        </div>

        {/* Call quality — shown to both */}
        <StarRating
          value={callQuality}
          onChange={setCallQuality}
          label="Call quality"
        />

        {/* Interpreter rating — client only */}
        {isClient && (
          <>
            <StarRating
              value={interpreterRating}
              onChange={setInterpreterRating}
              label="Rate the interpreter"
            />
            <div className="flex flex-col gap-2">
              <p className="text-white/70 text-sm">Comments (optional)</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience…"
                rows={3}
                className="bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 resize-none focus:outline-none focus:border-[#7F77DD] transition-colors"
              />
            </div>
          </>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={callQuality === 0 || (isClient && interpreterRating === 0)}
          className="w-full py-3 rounded-xl bg-[#7F77DD] text-white font-medium text-sm hover:bg-[#534AB7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit rating
        </button>
      </div>
    </div>
  )
}