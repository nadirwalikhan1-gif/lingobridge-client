export default function BookingWizard({ step, children }) {
  return (
    <div className="card p-2 border border-slate-100 bg-white rounded-xl relative">
      {/* Tiny step badge only — no text header, no description */}
      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[9px] font-bold text-white z-10">
        {step}
      </div>
      <div className="pt-1">
        {children}
      </div>
    </div>
  )
}
