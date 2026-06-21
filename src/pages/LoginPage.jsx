import { useState } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { Navigate } from 'react-router-dom'

export default function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) return <Navigate to="/" replace />

  return (
    <div className="flex items-center justify-center h-dvh bg-lb-bg overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 38% at 50% 38%, rgba(108,43,255,0.09) 0%, transparent 70%)' }}
      />

      <div className="relative bg-white rounded-2xl border border-lb-border shadow-lb-modal p-8 max-w-[400px] w-full mx-4 animate-scaleIn">
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#9B8EFF] to-[#6C2BFF] flex items-center justify-center mb-3 shadow-sm">
            <span className="text-white font-bold text-base">A</span>
          </div>
          <h1 className="text-[22px] font-bold text-lb-ink tracking-[-0.025em]">Andiraw</h1>
          <p className="text-xs text-lb-muted mt-1 font-medium">Connect. Communicate.</p>
        </div>

        <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); login(email, password) }}>
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-lb-ink mb-1.5 tracking-wide">Email</label>
            <input id="login-email" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="lb-input" />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-lb-ink mb-1.5 tracking-wide">Password</label>
            <input id="login-password" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" className="lb-input" />
          </div>
          <button type="submit"
            className="w-full mt-1.5 px-4 py-2.5 bg-lb-primary text-white rounded-[10px] text-sm font-semibold hover:bg-lb-deep active:scale-[0.98] transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-lb-primary/30 focus:ring-offset-1">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
