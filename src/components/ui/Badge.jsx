const variants = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  client: 'bg-violet-100 text-violet-700',
}

export default function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}