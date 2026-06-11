import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import CallRoom from './features/call/pages/CallRoom';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './features/admin/pages/Dashboard';
import InterpreterDashboard from './features/interpreter/pages/Dashboard';
import BookingPage from './features/booking/pages/BookingPage';
import LoginPage from './pages/LoginPage';

// ── Client pages ──────────────────────────────────────────────
import ClientDashboard  from './features/client/pages/Dashboard';
import SessionHistory   from './features/client/pages/SessionHistory';
import Wallet           from './features/client/pages/Wallet';
import Messages         from './features/client/pages/Messages';
import Favourites       from './features/client/pages/Favourites';
import RecentReviews    from './features/client/pages/RecentReviews';
import Profile          from './features/client/pages/Profile';
import Settings         from './features/client/pages/Settings';
import Teams            from './features/booking/pages/Teams';

// ── Interpreter pages ─────────────────────────────────────────
import Availability         from './features/interpreter/pages/Availability';
import Requests             from './features/interpreter/pages/Requests';
import MySessions           from './features/interpreter/pages/MySessions';
import Earnings             from './features/interpreter/pages/Earnings';
import Payouts              from './features/interpreter/pages/Payouts';
import InterpreterReviews   from './features/interpreter/pages/Reviews';
import InterpreterProfile   from './features/interpreter/pages/Profile';
import InterpreterSettings  from './features/interpreter/pages/Settings';
import Help                 from './features/interpreter/pages/Help';

// ── Admin pages ─────────────────────────────────────────────
import AdminLayout          from './features/admin/components/AdminLayout';
import Users                from './features/admin/pages/Users';
import Interpreters         from './features/admin/pages/Interpreters';
import Sessions             from './features/admin/pages/Sessions';
import Transactions         from './features/admin/pages/Transactions';
import Reviews              from './features/admin/pages/Reviews';
import Disputes             from './features/admin/pages/Disputes';
import AdminRequests        from './features/admin/pages/Requests';
import AdminPayouts         from './features/admin/pages/Payouts';
import Comms                from './features/admin/pages/Comms';
import AdminSettings        from './features/admin/pages/Settings';

// ─── Route Guards ─────────────────────────────────────────────

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.user_metadata?.role;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return children;
}

function roleHome(role) {
  if (role === 'admin')       return '/admin/dashboard';
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
    <AdminLayout>
      <Routes>
        <Route path="dashboard"      element={<AdminDashboard />} />
        <Route path="users"          element={<Users />} />
        <Route path="interpreters"   element={<Interpreters />} />
        <Route path="sessions"       element={<Sessions />} />
        <Route path="requests"       element={<AdminRequests />} />
        <Route path="transactions"   element={<Transactions />} />
        <Route path="reviews"        element={<Reviews />} />
        <Route path="disputes"       element={<Disputes />} />
        <Route path="payouts"        element={<AdminPayouts />} />
        <Route path="communications" element={<Comms />} />
        <Route path="settings"       element={<AdminSettings />} />
        <Route path="*"              element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function InterpreterRoutes() {
  return (
    <DashboardLayout role="interpreter">
      <Routes>
        <Route path="dashboard"    element={<InterpreterDashboard />} />
        <Route path="availability" element={<Availability />} />
        <Route path="requests"     element={<Requests />} />
        <Route path="sessions"     element={<MySessions />} />
        <Route path="earnings"     element={<Earnings />} />
        <Route path="payouts"      element={<Payouts />} />
        <Route path="reviews"      element={<InterpreterReviews />} />
        <Route path="profile"      element={<InterpreterProfile />} />
        <Route path="settings"     element={<InterpreterSettings />} />
        <Route path="help"         element={<Help />} />
        <Route path="*"            element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

function ClientRoutes() {
  return (
    <DashboardLayout role="client">
      <Routes>
        <Route path="dashboard"  element={<ClientDashboard />} />
        <Route path="booking"    element={<BookingPage />} />
        <Route path="history"    element={<SessionHistory />} />
        <Route path="wallet"     element={<Wallet />} />
        <Route path="messages"   element={<Messages />} />
        <Route path="favourites" element={<Favourites />} />
        <Route path="reviews"    element={<RecentReviews />} />
        <Route path="profile"    element={<Profile />} />
        <Route path="teams"      element={<Teams />} />
        <Route path="settings"   element={<Settings />} />
        <Route path="help"       element={<Placeholder title="Help & Support" />} />
        <Route path="*"          element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

// ─── Root Router ───────────────────────────────────────────────

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*"      element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const role = user.user_metadata?.role;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={roleHome(role)} replace />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/interpreter/*"
        element={
          <ProtectedRoute allowedRoles={['interpreter']}>
            <InterpreterRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/*"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientRoutes />
          </ProtectedRoute>
        }
      />

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