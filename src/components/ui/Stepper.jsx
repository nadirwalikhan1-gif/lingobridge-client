export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isActive = index + 1 === currentStep
        const isCompleted = index + 1 < currentStep
        
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-button text-sm font-medium ${
              isActive 
                ? 'bg-violet-600 text-white' 
                : isCompleted 
                  ? 'bg-violet-100 text-violet-700' 
                  : 'bg-slate-100 text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                isActive ? 'bg-white text-violet-600' : isCompleted ? 'bg-violet-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {isCompleted ? '✓' : index + 1}
              </span>
              {step}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${isCompleted ? 'bg-violet-600' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}