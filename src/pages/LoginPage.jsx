import { useState } from 'react'
import { useAuth } from '../providers/AuthProvider'
import { Navigate } from 'react-router-dom'

export default function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) return <Navigate to="/" replace />

  return (
    <div className="flex items-center justify-center h-dvh bg-lb-bg">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-lb-border-light max-w-md w-full">
        <h1 className="text-2xl font-bold text-lb-text mb-2 text-center">Andiraw</h1>
        <p className="text-sm text-lb-text-secondary mb-6 text-center">Sign in to your account</p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-lb-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-client-sidebar"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-lb-border-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-client-sidebar"
          />
          <button
            onClick={() => login(email, password)}
            className="w-full px-4 py-3 bg-client-sidebar text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}
