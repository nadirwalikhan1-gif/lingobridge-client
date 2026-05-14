import { Heart, Scale, Briefcase, GraduationCap, Plane, MoreHorizontal, Check } from 'lucide-react'

const categories = [
  { id: 'medical',   label: 'Medical',   icon: Heart, desc: 'Hospitals, clinics & emergencies' },
  { id: 'legal',     label: 'Legal',     icon: Scale, desc: 'Courts, contracts & immigration' },
  { id: 'business',  label: 'Business',  icon: Briefcase, desc: 'Meetings, negotiations & trade' },
  { id: 'education', label: 'Education', icon: GraduationCap, desc: 'Schools, universities & training' },
  { id: 'travel',    label: 'Travel',    icon: Plane, desc: 'Tourism, hotels & transport' },
  { id: 'general',   label: 'General',   icon: MoreHorizontal, desc: 'Everyday conversations' },
]

export default function CategoryGrid({ selected, onSelect }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900 tracking-tight">
            Popular Categories
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Select a category for your session</p>
        </div>
        {selected && (
          <span className="text-[11px] font-medium text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
            {categories.find(c => c.id === selected)?.label} selected
          </span>
        )}
      </div>

      {/* Grid - 3 columns × 2 rows */}
      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isSelected = selected === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelect?.(cat.id)}
              className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                isSelected
                  ? 'border-violet-500 bg-violet-50 shadow-sm'
                  : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
              }`}
              aria-pressed={isSelected}
              aria-label={`${cat.label} — ${cat.desc}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isSelected ? 'bg-violet-100 scale-110' : 'bg-white shadow-sm group-hover:scale-105'
              }`}>
                <Icon 
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isSelected ? 'text-violet-600' : 'text-slate-400 group-hover:text-violet-500'
                  }`} 
                  strokeWidth={1.5} 
                />
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className={`text-[13px] font-semibold transition-colors duration-200 ${
                    isSelected ? 'text-violet-900' : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {cat.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-600" />}
                </div>
                <p className={`text-[10px] mt-1 leading-relaxed transition-colors duration-200 ${
                  isSelected ? 'text-violet-600' : 'text-slate-400'
                }`}>
                  {cat.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}