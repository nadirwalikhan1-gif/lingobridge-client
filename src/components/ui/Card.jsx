/**
 * Card Component
 * Polish: use lb-card token for consistent radius/shadow/border,
 *         add hover-lift on interactive variant (UI UX Pro Max — Micro SaaS elevation)
 */
export default function Card({ children, className = '', interactive = false }) {
  return (
    <div className={`lb-card ${interactive ? 'hover-lift cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-3.5 border-b border-lb-border ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-5 py-3.5 border-t border-lb-border ${className}`}>
      {children}
    </div>
  )
}
