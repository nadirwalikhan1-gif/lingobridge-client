import { Routes, Route, Navigate, Link } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import AdminDashboard from './features/admin/pages/Dashboard'
import InterpreterDashboard from './features/interpreter/pages/Dashboard'
import BookingPage from './features/booking/pages/BookingPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'

// Client pages
import ClientDashboard from './features/client/pages/Dashboard'
import SessionHistory from './features/client/pages/SessionHistory'
import WalletPage from './features/client/pages/Wallet'
import MessagesPage from './features/client/pages/Messages'
import FavouritesPage from './features/client/pages/Favourites'
import ProfilePage from './features/client/pages/Profile'
import TeamsPage from './features/booking/pages/TeamsPage'

const isAuthenticated = true

function RoleSwitcher() {
  return (
    <div className="flex items-center justify-center h-dvh bg-lb-bg">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-lb-border-light max-w-md w-full">
        <h1 className="text-2xl font-bold text-lb-text mb-2 text-center">LingoBridge</h1>
        <p className="text-sm text-lb-text-secondary mb-6 text-center">Select a dashboard to preview</p>
        <div className="space-y-3">
          <Link to="/admin/dashboard" className="flex items-center justify-center w-full px-4 py-3 bg-admin-sidebar text-white rounded-lg font-medium hover:opacity-90 transition">
            Admin Dashboard
          </Link>
          <Link to="/interpreter/dashboard" className="flex items-center justify-center w-full px-4 py-3 bg-interpreter-sidebar text-white rounded-lg font-medium hover:opacity-90 transition">
            Interpreter Dashboard
          </Link>
          <Link to="/client/dashboard" className="flex items-center justify-center w-full px-4 py-3 bg-client-sidebar text-white rounded-lg font-medium hover:opacity-90 transition">
            Client Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

function RoleRoutes({ role }) {
  return (
    <DashboardLayout role={role}>
      <Routes>
        <Route path="dashboard" element={
          role === 'admin' ? <AdminDashboard /> :
          role === 'interpreter' ? <InterpreterDashboard /> :
          <ClientDashboard />
        } />
        <Route path="booking" element={<BookingPage />} />

        {/* Admin routes */}
        {role === 'admin' && (
          <>
            <Route path="users" element={<Placeholder title="Users" />} />
            <Route path="interpreters" element={<Placeholder title="Interpreters" />} />
            <Route path="sessions" element={<Placeholder title="Sessions" />} />
            <Route path="transactions" element={<Placeholder title="Transactions" />} />
            <Route path="reports" element={<Placeholder title="Reports" />} />
            <Route path="disputes" element={<Placeholder title="Disputes" />} />
            <Route path="reviews" element={<Placeholder title="Reviews" />} />
            <Route path="coupons" element={<Placeholder title="Coupons" />} />
            <Route path="settings" element={<Placeholder title="Settings" />} />
          </>
        )}

        {/* Client routes */}
        {role === 'client' && (
          <>
            <Route path="history" element={<SessionHistory />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="favourites" element={<FavouritesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="settings" element={<Placeholder title="Settings" />} />
            <Route path="help" element={<Placeholder title="Help & Support" />} />
          </>
        )}

        {/* Interpreter routes */}
        {role === 'interpreter' && (
          <>
            <Route path="requests" element={<Placeholder title="Requests" />} />
            <Route path="sessions" element={<Placeholder title="My Sessions" />} />
            <Route path="earnings" element={<Placeholder title="Earnings" />} />
            <Route path="payouts" element={<Placeholder title="Payouts" />} />
            <Route path="availability" element={<Placeholder title="Availability" />} />
            <Route path="reviews" element={<Placeholder title="Reviews" />} />
            <Route path="profile" element={<Placeholder title="Profile" />} />
            <Route path="settings" element={<Placeholder title="Settings" />} />
            <Route path="help" element={<Placeholder title="Help & Support" />} />
          </>
        )}

        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-lb-text-secondary">
      <h2 className="text-xl font-semibold text-lb-text mb-2">{title}</h2>
      <p className="text-sm">This page is under construction.</p>
    </div>
  )
}

export default function App() {
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<RoleSwitcher />} />
      <Route path="/admin/*" element={<RoleRoutes role="admin" />} />
      <Route path="/interpreter/*" element={<RoleRoutes role="interpreter" />} />
      <Route path="/client/*" element={<RoleRoutes role="client" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}