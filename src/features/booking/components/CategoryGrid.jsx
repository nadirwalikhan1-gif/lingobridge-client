// CategoryGrid.jsx — rebuilt with lb-* tokens to match interpreter design language
import { Heart, Scale, Briefcase, GraduationCap, Plane, MoreHorizontal, Check } from 'lucide-react'

const categories = [
  { id: 'medical',   label: 'Medical',   icon: Heart,          desc: 'Hospitals, clinics & emergencies' },
  { id: 'legal',     label: 'Legal',     icon: Scale,          desc: 'Courts, contracts & immigration'  },
  { id: 'business',  label: 'Business',  icon: Briefcase,      desc: 'Meetings, negotiations & trade'   },
  { id: 'education', label: 'Education', icon: GraduationCap,  desc: 'Schools, universities & training' },
  { id: 'travel',    label: 'Travel',    icon: Plane,          desc: 'Tourism, hotels & transport'      },
  { id: 'general',   label: 'General',   icon: MoreHorizontal, desc: 'Everyday conversations'           },
]

export default function CategoryGrid({ selected, onSelect }) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-3 shrink-0">
        <div>
          <h3 className="text-[13px] font-medium text-lb-ink">Popular categories</h3>
          <p className="text-[11px] text-lb-muted mt-0.5">Select a category for your session</p>
        </div>
        {selected && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#E1F5EE] text-[#0F6E56] flex items-center gap-1">
            <Check className="w-2.5 h-2.5" />
            {categories.find(c => c.id === selected)?.label}
          </span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-0">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isSelected = selected === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelect?.(cat.id)}
              className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-[#7F77DD] bg-[#EEEDFE]'
                  : 'border-lb-border bg-lb-surface hover:border-[#7F77DD] hover:bg-[#EEEDFE]/40'
              }`}
              aria-pressed={isSelected}
            >
              {/* Icon chip */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isSelected ? 'bg-[#7F77DD]' : 'bg-lb-border'
              }`}>
                <Icon
                  className={`w-5 h-5 transition-colors ${isSelected ? 'text-white' : 'text-lb-muted'}`}
                  strokeWidth={1.5}
                />
              </div>

              {/* Label */}
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <span className={`text-[12px] font-medium transition-colors ${isSelected ? 'text-[#26215C]' : 'text-lb-ink'}`}>
                    {cat.label}
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-[#534AB7]" />}
                </div>
                <p className={`text-[10px] mt-0.5 leading-relaxed transition-colors ${
                  isSelected ? 'text-[#534AB7]' : 'text-lb-muted'
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