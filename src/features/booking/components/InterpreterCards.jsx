// InterpreterCards.jsx — rebuilt with lb-* tokens to match interpreter design language
import { useState } from 'react'
import { Star, BadgeCheck, Clock, Award, Check, Info, ChevronRight } from 'lucide-react'
import Avatar from '../../../components/ui/Avatar'

const interpreters = [
  {
    id: 1, name: 'Abid Khan',      rating: 4.97, reviews: 1243, sessions: 2100,
    languages: ['Pashto Eastern'], specialty: 'Medical',    badge: 'Top Rated',
    badgeDesc: 'Highest client satisfaction score',
    bio: 'Certified medical interpreter, 9 years in Lahore hospitals. Emergency & oncology specialist.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
    online: true,  verified: true, responseTime: '<1 min',
  },
  {
    id: 2, name: 'Ahmad Zia',       rating: 4.95, reviews: 987,  sessions: 1650,
    languages: ['Pashto Western'],  specialty: 'Legal',      badge: 'Expert',
    badgeDesc: '10+ years in legal interpretation',
    bio: 'Former government interpreter, diplomatic & legal proceedings across Kabul.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    online: true,  verified: true, responseTime: '<2 min',
  },
  {
    id: 3, name: 'Rajinder Singh',  rating: 4.93, reviews: 762,  sessions: 1320,
    languages: ['Punjabi Gurmukhi'],specialty: 'Business',   badge: 'Pro',
    badgeDesc: 'Enterprise-grade interpretation',
    bio: 'Business interpreter for cross-border trade between Punjab and international markets.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
    online: true,  verified: true, responseTime: '<2 min',
  },
  {
    id: 4, name: 'Imran Sandhu',    rating: 4.91, reviews: 634,  sessions: 1100,
    languages: ['Punjabi Shahmukhi'],specialty: 'Immigration', badge: 'Verified',
    badgeDesc: 'Background checked & certified',
    bio: 'Immigration specialist, visa & documentation for South Asian communities. USCIS accredited.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    online: true,  verified: true, responseTime: '<3 min',
  },
  {
    id: 5, name: 'Amrit Kaur',      rating: 4.89, reviews: 521,  sessions: 890,
    languages: ['Punjabi Gurmukhi'],specialty: 'Technical',   badge: 'Rising',
    badgeDesc: 'Fastest growing interpreter',
    bio: 'Technical interpreter with IT & engineering background. Software and patent documentation.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    online: false, verified: true, responseTime: '<5 min',
  },
]

// Badge uses interpreter pill system colours
const BADGE_STYLES = {
  'Top Rated': 'bg-[#FFF8E6] text-[#BA7517]',
  'Expert':    'bg-[#EEEDFE] text-[#534AB7]',
  'Pro':       'bg-[#E1F5EE] text-[#0F6E56]',
  'Verified':  'bg-[#E1F5EE] text-[#0F6E56]',
  'Rising':    'bg-[#FCEBEB] text-[#A32D2D]',
}

export default function InterpreterCards({ selected, onSelect }) {
  const [page, setPage] = useState(0)
  const perPage = 3
  const totalPages = Math.ceil(interpreters.length / perPage)
  const visible = interpreters.slice(page * perPage, page * perPage + perPage)

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-baseline justify-between mb-3 shrink-0">
        <div>
          <h3 className="text-[13px] font-medium text-lb-ink">Recommended interpreters</h3>
          <p className="text-[11px] text-lb-muted mt-0.5">Vetted professionals · Background checked · 4.9★ avg</p>
        </div>
        <div className="flex items-center gap-2">
          {selected && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#E1F5EE] text-[#0F6E56] flex items-center gap-1">
              <Check className="w-2.5 h-2.5" />
              {interpreters.find(i => i.id === selected)?.name}
            </span>
          )}
          <button className="flex items-center gap-0.5 text-[11px] text-[#7F77DD]">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Rows — same divide-y anatomy as interpreter RecentSessions */}
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {visible.map((interp) => {
          const isSelected = selected === interp.id
          return (
            <div
              key={interp.id}
              onClick={() => onSelect?.(interp.id)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? 'border-[#7F77DD] bg-[#EEEDFE]'
                  : 'border-lb-border bg-lb-surface hover:border-[#7F77DD] hover:bg-[#EEEDFE]/30'
              }`}
            >
              {/* Avatar with online dot */}
              <div className="relative shrink-0">
                <Avatar
                  src={interp.avatar}
                  fallback={interp.name}
                  size="sm"
                  className="w-9 h-9 rounded-full object-cover"
                />
                {interp.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1D9E75] rounded-full ring-2 ring-white" />
                )}
              </div>

              {/* Name + rating */}
              <div className="w-36 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-medium text-lb-ink truncate">{interp.name}</span>
                  {interp.verified && <BadgeCheck className="w-3 h-3 text-[#534AB7] shrink-0" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-2.5 h-2.5 text-[#BA7517] fill-[#BA7517]" />
                  <span className="text-[11px] font-medium text-lb-ink">{interp.rating}</span>
                  <span className="text-[10px] text-lb-muted">· {interp.reviews.toLocaleString()}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="flex-1 text-[11px] text-lb-muted leading-relaxed line-clamp-2 min-w-0">
                {interp.bio}
              </p>

              {/* Stats */}
              <div className="shrink-0 flex flex-col gap-1 w-20">
                <span className="flex items-center gap-1 text-[10px] text-lb-muted">
                  <Award className="w-2.5 h-2.5 text-[#7F77DD]" />
                  {interp.sessions.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-lb-muted">
                  <Clock className="w-2.5 h-2.5" />
                  {interp.responseTime}
                </span>
              </div>

              {/* Specialty + language pills — same pill system as interpreter */}
              <div className="shrink-0 flex flex-col gap-1 w-28">
                <span className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded bg-lb-surface text-lb-muted border border-lb-border w-fit">
                  {interp.specialty}
                </span>
                {interp.languages.map(lang => (
                  <span key={lang} className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7] w-fit">
                    {lang}
                  </span>
                ))}
              </div>

              {/* Badge + select */}
              <div className="shrink-0 flex flex-col items-end gap-2 w-24">
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${BADGE_STYLES[interp.badge] || 'bg-lb-surface text-lb-muted'}`}>
                  {interp.badge}
                  <Info className="w-2 h-2 opacity-50" />
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect?.(interp.id) }}
                  className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-[#7F77DD] text-white'
                      : 'bg-lb-surface text-[#7F77DD] border border-lb-border hover:bg-[#EEEDFE]'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#7F77DD] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination — same dot style as interpreter */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 shrink-0">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-[11px] font-medium text-lb-muted hover:text-[#7F77DD] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === page ? 'w-4 bg-[#7F77DD]' : 'w-1.5 bg-lb-border hover:bg-lb-muted'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="text-[11px] font-medium text-lb-muted hover:text-[#7F77DD] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}