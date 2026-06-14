// src/features/admin/components/AdminRoute.jsx
// Role-based route protection. Redirects non-admin users to home.

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-lb-bg flex items-center justify-center">
        <div className="space-y-3 w-64">
          <div className="h-4 bg-lb-border rounded animate-pulse" />
          <div className="h-4 bg-lb-border rounded animate-pulse w-3/4" />
        </div>
      </div>
    )
  }

  const role = user?.user_metadata?.role
  if (!user || role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
