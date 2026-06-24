export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-card shadow-card border border-slate-100 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 py-4 border-b border-slate-100 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return <div className={`px-5 py-4 border-t border-slate-100 ${className}`}>{children}</div>
}
