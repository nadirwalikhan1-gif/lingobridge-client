/**
 * Badge Component
 * Polish: use lb-badge base class, refined color palette aligned with
 *         Micro SaaS / Indigo-emerald skill recommendation
 */
const variants = {
  neutral:  'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60',
  success:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  warning:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  danger:   'bg-red-50 text-red-600 ring-1 ring-red-200/60',
  info:     'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
  client:   'bg-[#EEEDFE] text-[#4C3FCC] ring-1 ring-[#C9C5F5]/60',
  primary:  'bg-lb-primary/10 text-lb-primary ring-1 ring-lb-primary/20',
}

export default function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span className={`lb-badge ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  )
}
