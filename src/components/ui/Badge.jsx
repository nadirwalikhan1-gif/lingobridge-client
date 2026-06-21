const variants = {
  neutral:  'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200/70',
  success:  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70',
  warning:  'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/70',
  danger:   'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200/70',
  info:     'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/70',
  client:   'bg-[#EEEDFE] text-[#4C3FCC] ring-1 ring-inset ring-[#C9C5F5]/70',
  primary:  'bg-lb-primary/10 text-lb-primary ring-1 ring-inset ring-lb-primary/20',
}

export default function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span className={`lb-badge ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  )
}
