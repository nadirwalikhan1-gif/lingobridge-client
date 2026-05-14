import { Headphones, Video } from 'lucide-react'

const types = [
  {
    value: 'audio',
    label: 'Audio Call',
    desc: 'Best for quick conversations',
    icon: Headphones,
  },
  {
    value: 'video',
    label: 'Video Call',
    desc: 'Best for detailed communication',
    icon: Video,
  },
]

export default function SessionTypeSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {types.map((type) => {
          const Icon = type.icon
          const isActive = selected === type.value
          return (
            <button
              key={type.value}
              onClick={() => onSelect(type.value)}
              className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 text-center transition-all duration-200 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                isActive
                  ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
              aria-pressed={isActive}
              aria-label={`${type.label} — ${type.desc}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                isActive ? 'bg-violet-100' : 'bg-slate-100'
              }`}>
                <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-violet-600' : 'text-slate-500'}`} />
              </div>
              <div>
                <p className={`text-[13px] font-semibold leading-tight transition-colors duration-200 ${isActive ? 'text-violet-900' : 'text-slate-900'}`}>{type.label}</p>
                <p className={`text-[10px] mt-0.5 leading-tight transition-colors duration-200 ${
                  isActive ? 'text-violet-600' : 'text-slate-400'
                }`}>
                  {type.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}