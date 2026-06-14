import { useState, useEffect } from 'react'

const breakpoints = [
  { name: 'mobile', query: '(max-width: 767px)' },
  { name: 'tablet', query: '(min-width: 768px) and (max-width: 1023px)' },
  { name: 'laptop', query: '(min-width: 1024px) and (max-width: 1279px)' },
  { name: 'desktop', query: '(min-width: 1280px)' },
]

export default function useBreakpoint() {
  const [bp, setBp] = useState('desktop')

  useEffect(() => {
    const handlers = breakpoints.map(({ name, query }) => {
      const mql = window.matchMedia(query)
      const handler = (e) => { if (e.matches) setBp(name) }
      mql.addEventListener('change', handler)
      if (mql.matches) setBp(name)
      return { mql, handler }
    })

    return () => {
      handlers.forEach(({ mql, handler }) => mql.removeEventListener('change', handler))
    }
  }, [])

  return bp
}
