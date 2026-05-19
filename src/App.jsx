import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import CallRoom from './features/call/pages/CallRoom';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './features/admin/pages/Dashboard';
import InterpreterDashboard from './features/interpreter/pages/Dashboard';
import BookingPage from './features/booking/pages/BookingPage';
import LoginPage from './pages/LoginPage';

// Client pages
import ClientDashboard from './features/client/pages/Dashboard';
import SessionHistory from './features/client/pages/SessionHistory';
import WalletPage from './features/client/pages/Wallet';
import MessagesPage from './features/client/pages/Messages';
import FavouritesPage from './features/client/pages/Favourites';
import ProfilePage from './features/client/pages/Profile';
import TeamsPage from './features/booking/pages/TeamsPage';

// ─── Route Guards ─────────────────────────────────────────────

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.user_metadata?.role;
  if (allowedRoles && !allowedRoles.includes(role)) {
    // User is authenticated but wrong role → send to their home
    return <Navigate to={roleHome(role)} replace />;
  }

  return children;
}

function roleHome(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'interpreter') return '/interpreter/dashboard';
  return '/client/dashboard';
}

// ─── Placeholder ──────────────────────────────────────────────

function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-lb-text-secondary">
      <h2 className="text-xl font-semibold text-lb-text mb-2">{title}</h2>
      <p className="text-sm">This page is under construction.</p>
    </div>
  );
}

// ─── Role-Specific Route Trees ─────────────────────────────────

function AdminRoutes() {
  return (
    <DashboardLayout role="admin">
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Placeholder title="Users" />} />
        <Route path="interpreters" element={<Placeholder title="Interpreters" />} />
        <Route path="sessions" element={<Placeholder title="Sessions" />} />
        <Route path="transactions" element={<Placeholder title="Transactions" />} />
        <Route path="reports" element={<Placeholder title="Reports" />} />
        <Route path="disputes" element={<Placeholder title="Disputes" />} />
        <Route path="reviews" element={<Placeholder title="Reviews" />} />
        <Route path="coupons" element={<Placeholder title="Coupons" />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

function InterpreterRoutes() {
  return (
    <DashboardLayout role="interpreter">
      <Routes>
        <Route path="dashboard" element={<InterpreterDashboard />} />
        <Route path="requests" element={<Placeholder title="Requests" />} />
        <Route path="sessions" element={<Placeholder title="My Sessions" />} />
        <Route path="earnings" element={<Placeholder title="Earnings" />} />
        <Route path="payouts" element={<Placeholder title="Payouts" />} />
        <Route path="availability" element={<Placeholder title="Availability" />} />
        <Route path="reviews" element={<Placeholder title="Reviews" />} />
        <Route path="profile" element={<Placeholder title="Profile" />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
        <Route path="help" element={<Placeholder title="Help & Support" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

function ClientRoutes() {
  return (
    <DashboardLayout role="client">
      <Routes>
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="history" element={<SessionHistory />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="favourites" element={<FavouritesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
        <Route path="help" element={<Placeholder title="Help & Support" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

// ─── Root Router ───────────────────────────────────────────────

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Not logged in → only login page is reachable
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const role = user.user_metadata?.role;

  return (
    <Routes>
      {/* Root redirect based on actual role */}
      <Route path="/" element={<Navigate to={roleHome(role)} replace />} />

      {/* Admin namespace — guarded */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* Interpreter namespace — guarded */}
      <Route
        path="/interpreter/*"
        element={
          <ProtectedRoute allowedRoles={['interpreter']}>
            <InterpreterRoutes />
          </ProtectedRoute>
        }
      />

      {/* Client namespace — guarded */}
      <Route
        path="/client/*"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientRoutes />
          </ProtectedRoute>
        }
      />

      {/* Call room — accessible to all authenticated roles */}
      <Route
        path="/call/:channelId"
        element={
          <ProtectedRoute allowedRoles={['client', 'interpreter', 'admin']}>
            <CallRoom />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={roleHome(role)} replace />} />
    </Routes>
  );
}