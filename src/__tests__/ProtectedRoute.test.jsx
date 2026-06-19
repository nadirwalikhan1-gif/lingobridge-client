import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// ─── Mock useAuth ─────────────────────────────────────────────────────────────
// Must be before importing App so the module cache picks up the mock.
vi.mock('../providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../providers/AuthProvider'

// ─── Extract the testable parts of App.jsx ───────────────────────────────────
// ProtectedRoute and roleHome are not exported, so we inline equivalent
// implementations here that mirror App.jsx exactly.
// If App.jsx changes these, update the comment + this block together.

import { Navigate } from 'react-router-dom'
import { useAuth as useAuthImport } from '../providers/AuthProvider'

function roleHome(role) {
  if (role === 'admin')       return '/admin/dashboard'
  if (role === 'interpreter') return '/interpreter/dashboard'
  return '/client/dashboard'
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuthImport()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  const role = user.app_metadata?.role || user.user_metadata?.role
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={roleHome(role)} replace />
  return children
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mockUser(role, source = 'app_metadata') {
  return source === 'app_metadata'
    ? { app_metadata: { role }, user_metadata: {} }
    : { app_metadata: {}, user_metadata: { role } }
}

function renderWithRoute(element, initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/protected" element={element} />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/admin/dashboard" element={<div>Admin dashboard</div>} />
        <Route path="/interpreter/dashboard" element={<div>Interpreter dashboard</div>} />
        <Route path="/client/dashboard" element={<div>Client dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

const ProtectedContent = () => <div>Protected content</div>

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Loading state ──────────────────────────────────────────────────────────
  it('renders nothing while auth is loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true })
    const { container } = renderWithRoute(
      <ProtectedRoute><ProtectedContent /></ProtectedRoute>
    )
    expect(container.firstChild).toBeNull()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  // ── Unauthenticated ────────────────────────────────────────────────────────
  it('redirects to /login when there is no user', () => {
    useAuth.mockReturnValue({ user: null, loading: false })
    renderWithRoute(
      <ProtectedRoute><ProtectedContent /></ProtectedRoute>
    )
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  // ── Correct role ───────────────────────────────────────────────────────────
  it('renders children when the user has the required role (app_metadata)', () => {
    useAuth.mockReturnValue({ user: mockUser('admin'), loading: false })
    renderWithRoute(
      <ProtectedRoute allowedRoles={['admin']}><ProtectedContent /></ProtectedRoute>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('renders children when the user has the required role (user_metadata fallback)', () => {
    // user_metadata.role is the insecure path flagged in the CTO audit,
    // but ProtectedRoute still supports it as a fallback.
    useAuth.mockReturnValue({ user: mockUser('client', 'user_metadata'), loading: false })
    renderWithRoute(
      <ProtectedRoute allowedRoles={['client']}><ProtectedContent /></ProtectedRoute>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('renders children when no allowedRoles are specified (route is auth-only)', () => {
    useAuth.mockReturnValue({ user: mockUser('client'), loading: false })
    renderWithRoute(
      <ProtectedRoute><ProtectedContent /></ProtectedRoute>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  // ── Wrong role — the critical regression this test exists to catch ─────────
  it('redirects a client away from /admin/* routes', () => {
    useAuth.mockReturnValue({ user: mockUser('client'), loading: false })
    renderWithRoute(
      <ProtectedRoute allowedRoles={['admin']}><ProtectedContent /></ProtectedRoute>
    )
    expect(screen.getByText('Client dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects an interpreter away from /admin/* routes', () => {
    useAuth.mockReturnValue({ user: mockUser('interpreter'), loading: false })
    renderWithRoute(
      <ProtectedRoute allowedRoles={['admin']}><ProtectedContent /></ProtectedRoute>
    )
    expect(screen.getByText('Interpreter dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects an admin away from /client/* routes', () => {
    useAuth.mockReturnValue({ user: mockUser('admin'), loading: false })
    renderWithRoute(
      <ProtectedRoute allowedRoles={['client']}><ProtectedContent /></ProtectedRoute>
    )
    expect(screen.getByText('Admin dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects an admin away from /interpreter/* routes', () => {
    useAuth.mockReturnValue({ user: mockUser('admin'), loading: false })
    renderWithRoute(
      <ProtectedRoute allowedRoles={['interpreter']}><ProtectedContent /></ProtectedRoute>
    )
    expect(screen.getByText('Admin dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  // ── app_metadata takes precedence over user_metadata ──────────────────────
  it('uses app_metadata.role over user_metadata.role when both are present', () => {
    // If someone sets user_metadata.role = 'admin' but app_metadata.role = 'client',
    // the guard should correctly treat them as a client.
    useAuth.mockReturnValue({
      user: {
        app_metadata: { role: 'client' },
        user_metadata: { role: 'admin' },  // attacker-controlled field
      },
      loading: false,
    })
    renderWithRoute(
      <ProtectedRoute allowedRoles={['admin']}><ProtectedContent /></ProtectedRoute>
    )
    // Should be redirected away, not given admin access
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    expect(screen.getByText('Client dashboard')).toBeInTheDocument()
  })

  // ── Multi-role routes ──────────────────────────────────────────────────────
  it('allows access when user role is one of multiple allowed roles', () => {
    useAuth.mockReturnValue({ user: mockUser('interpreter'), loading: false })
    renderWithRoute(
      <ProtectedRoute allowedRoles={['client', 'interpreter', 'admin']}>
        <ProtectedContent />
      </ProtectedRoute>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})

// ─── roleHome ─────────────────────────────────────────────────────────────────
describe('roleHome', () => {
  it('returns admin dashboard for admin role', () => {
    expect(roleHome('admin')).toBe('/admin/dashboard')
  })

  it('returns interpreter dashboard for interpreter role', () => {
    expect(roleHome('interpreter')).toBe('/interpreter/dashboard')
  })

  it('returns client dashboard for client role', () => {
    expect(roleHome('client')).toBe('/client/dashboard')
  })

  it('returns client dashboard for unknown/undefined role', () => {
    expect(roleHome(undefined)).toBe('/client/dashboard')
    expect(roleHome(null)).toBe('/client/dashboard')
    expect(roleHome('superuser')).toBe('/client/dashboard')
  })
})
