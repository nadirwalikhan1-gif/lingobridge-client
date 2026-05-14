import { useState } from 'react'
import { Star, ChevronRight, BadgeCheck, Clock, Award, Check, Info } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'

const interpreters = [
  {
    id: 1,
    name: 'Abid Khan',
    rating: 4.97,
    reviews: 1243,
    sessions: 2100,
    languages: ['Pashto Eastern'],
    specialty: 'Medical',
    badge: 'Top Rated',
    badgeDesc: 'Highest client satisfaction score',
    bio: 'Certified medical interpreter, 9 years in Lahore hospitals. Emergency & oncology specialist.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
    online: true,
    verified: true,
    responseTime: '<1 min',
  },
  {
    id: 2,
    name: 'Ahmad Zia',
    rating: 4.95,
    reviews: 987,
    sessions: 1650,
    languages: ['Pashto Western'],
    specialty: 'Legal',
    badge: 'Expert',
    badgeDesc: '10+ years in legal interpretation',
    bio: 'Former government interpreter, diplomatic & legal proceedings across Kabul.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    online: true,
    verified: true,
    responseTime: '<2 min',
  },
  {
    id: 3,
    name: 'Rajinder Singh',
    rating: 4.93,
    reviews: 762,
    sessions: 1320,
    languages: ['Punjabi Gurmukhi'],
    specialty: 'Business',
    badge: 'Pro',
    badgeDesc: 'Enterprise-grade interpretation',
    bio: 'Business interpreter for cross-border trade between Punjab and international markets.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    online: true,
    verified: true,
    responseTime: '<2 min',
  },
  {
    id: 4,
    name: 'Imran Sandhu',
    rating: 4.91,
    reviews: 634,
    sessions: 1100,
    languages: ['Punjabi Shahmukhi'],
    specialty: 'Immigration',
    badge: 'Verified',
    badgeDesc: 'Background checked & certified',
    bio: 'Immigration specialist, visa & documentation for South Asian communities. USCIS accredited.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    online: true,
    verified: true,
    responseTime: '<3 min',
  },
  {
    id: 5,
    name: 'Amrit Kaur',
    rating: 4.89,
    reviews: 521,
    sessions: 890,
    languages: ['Punjabi Gurmukhi'],
    specialty: 'Technical',
    badge: 'Rising',
    badgeDesc: 'Fastest growing interpreter',
    bio: 'Technical interpreter with IT & engineering background. Software and patent documentation.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    online: false,
    verified: true,
    responseTime: '<5 min',
  },
]

const BADGE_COLORS = {
  'Top Rated': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Expert':    'bg-violet-50 text-violet-700 border border-violet-200',
  'Pro':       'bg-blue-50 text-blue-700 border border-blue-200',
  'Verified':  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Rising':    'bg-rose-50 text-rose-700 border border-rose-200',
}

export default function InterpreterCards({ selected, onSelect }) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 3
  const totalPages = Math.ceil(interpreters.length / itemsPerPage)
  const visible = interpreters.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage)

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Recommended Interpreters</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Vetted professionals · Background checked · 4.9★ avg</p>
        </div>
        <div className="flex items-center gap-2">
          {selected && (
            <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Check className="w-2.5 h-2.5" />
              {interpreters.find(i => i.id === selected)?.name} selected
            </span>
          )}
          <button className="flex items-center gap-0.5 text-[11px] text-slate-400 hover:text-violet-600 transition-colors">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {visible.map((interp) => {
          const isSelected = selected === interp.id
          return (
            <div
              key={interp.id}
              onClick={() => onSelect?.(interp.id)}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                isSelected
                  ? 'bg-violet-50 border-violet-400 shadow-sm'
                  : 'bg-slate-50/60 border-slate-100 hover:bg-white hover:border-violet-200 hover:shadow-sm'
              }`}
            >
              {/* Small Avatar */}
              <div className="relative shrink-0">
                <Avatar
                  src={interp.avatar}
                  fallback={interp.name}
                  size="sm"
                  className="w-9 h-9 rounded-full object-cover"
                />
                {interp.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
                )}
              </div>

              {/* Name + rating */}
              <div className="w-36 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-semibold text-slate-900 truncate">{interp.name}</span>
                  {interp.verified && <BadgeCheck className="w-3 h-3 text-blue-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-semibold text-slate-700">{interp.rating}</span>
                  <span className="text-[10px] text-slate-400">· {interp.reviews.toLocaleString()} reviews</span>
                </div>
              </div>

              {/* Bio */}
              <p className="flex-1 text-[11px] text-slate-500 leading-relaxed line-clamp-2 min-w-0">
                {interp.bio}
              </p>

              {/* Stats */}
              <div className="shrink-0 flex flex-col gap-1 w-20">
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Award className="w-2.5 h-2.5 text-violet-400" />
                  {interp.sessions.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-2.5 h-2.5" />
                  {interp.responseTime}
                </span>
              </div>

              {/* Specialty + language */}
              <div className="shrink-0 flex flex-col gap-1 w-28">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 w-fit">
                  {interp.specialty}
                </span>
                {interp.languages.map(lang => (
                  <span key={lang} className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-600 border border-violet-100 w-fit">
                    {lang}
                  </span>
                ))}
              </div>

              {/* Badge + Select */}
              <div className="shrink-0 flex flex-col items-end gap-2 w-24">
                <span
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${BADGE_COLORS[interp.badge] || 'bg-slate-100 text-slate-600'}`}
                  title={interp.badgeDesc}
                >
                  {interp.badge}
                  <Info className="w-2 h-2 opacity-50" />
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect?.(interp.id) }}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 ${
                    isSelected
                      ? 'bg-violet-600 text-white'
                      : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 shrink-0">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-[11px] font-medium text-slate-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1"
          >
            ← Prev
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === page ? 'w-4 bg-violet-600' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="text-[11px] font-medium text-slate-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}