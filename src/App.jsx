import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from './providers/AuthProvider';

// ─── Always-eager: auth shell + layout chrome ────────────────────────────────
// These must be synchronous — they render before any authenticated page loads.
import LoginPage      from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout    from './features/admin/components/AdminLayout';

// ─── Admin pages (lazy — only admins ever load these) ────────────────────────
const AdminDashboard  = lazy(() => import('./features/admin/pages/Dashboard'));
const Users           = lazy(() => import('./features/admin/pages/Users'));
const Interpreters    = lazy(() => import('./features/admin/pages/Interpreters'));
const Sessions        = lazy(() => import('./features/admin/pages/Sessions'));
const AdminRequests   = lazy(() => import('./features/admin/pages/Requests'));
const Transactions    = lazy(() => import('./features/admin/pages/Transactions'));
const Reviews         = lazy(() => import('./features/admin/pages/Reviews'));
const Disputes        = lazy(() => import('./features/admin/pages/Disputes'));
const AdminPayouts    = lazy(() => import('./features/admin/pages/Payouts'));
const Comms           = lazy(() => import('./features/admin/pages/Comms'));
const AdminSettings   = lazy(() => import('./features/admin/pages/Settings'));

// ─── Interpreter pages (lazy — only interpreters ever load these) ─────────────
const InterpreterDashboard = lazy(() => import('./features/interpreter/pages/Dashboard'));
const Availability         = lazy(() => import('./features/interpreter/pages/Availability'));
const Requests             = lazy(() => import('./features/interpreter/pages/Requests'));
const MySessions           = lazy(() => import('./features/interpreter/pages/MySessions'));
const Earnings             = lazy(() => import('./features/interpreter/pages/Earnings'));
const Payouts              = lazy(() => import('./features/interpreter/pages/Payouts'));
const InterpreterReviews   = lazy(() => import('./features/interpreter/pages/Reviews'));
const InterpreterProfile   = lazy(() => import('./features/interpreter/pages/Profile'));
const InterpreterSettings  = lazy(() => import('./features/interpreter/pages/Settings'));
const Help                 = lazy(() => import('./features/interpreter/pages/Help'));

// ─── Client pages (lazy — only clients ever load these) ──────────────────────
const ClientDashboard = lazy(() => import('./features/client/pages/Dashboard'));
const BookingPage     = lazy(() => import('./features/booking/pages/BookingPage'));
const SessionHistory  = lazy(() => import('./features/client/pages/SessionHistory'));
const Wallet          = lazy(() => import('./features/client/pages/Wallet'));
const Messages        = lazy(() => import('./features/client/pages/Messages'));
const Favourites      = lazy(() => import('./features/client/pages/Favourites'));
const RecentReviews   = lazy(() => import('./features/client/pages/RecentReviews'));
const Profile         = lazy(() => import('./features/client/pages/Profile'));
const Teams           = lazy(() => import('./features/booking/pages/Teams'));
const Settings        = lazy(() => import('./features/client/pages/Settings'));

// ─── Call room (lazy — heaviest chunk, contains Agora SDK) ───────────────────
// Only loads when a user actually enters a call.
const CallRoom = lazy(() => import('./features/call/pages/CallRoom'));

// ─── Loading fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#12131f]">
      <div className="w-8 h-8 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Route guard ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const role = user.app_metadata?.role || user.user_metadata?.role;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to={roleHome(role)} replace />;
  return children;
}

function roleHome(role) {
  if (role === 'admin')       return '/admin/dashboard';
  if (role === 'interpreter') return '/interpreter/dashboard';
  return '/client/dashboard';
}

function Placeholder({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-lb-text-secondary">
      <h2 className="text-xl font-semibold text-lb-text mb-2">{title}</h2>
      <p className="text-sm">This page is under construction.</p>
    </div>
  );
}

// ─── Role route trees ─────────────────────────────────────────────────────────
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
        <Route path="help"       element={<Placeholder title="Help and Support" />} />
        <Route path="*"          element={<Navigate to="dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
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

  const role = user.app_metadata?.role || user.user_metadata?.role;
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to={roleHome(role)} replace />} />
        <Route path="/admin/*"       element={<ProtectedRoute allowedRoles={['admin']}><AdminRoutes /></ProtectedRoute>} />
        <Route path="/interpreter/*" element={<ProtectedRoute allowedRoles={['interpreter']}><InterpreterRoutes /></ProtectedRoute>} />
        <Route path="/client/*"      element={<ProtectedRoute allowedRoles={['client']}><ClientRoutes /></ProtectedRoute>} />
        <Route path="/call/:channelId" element={<ProtectedRoute allowedRoles={['client', 'interpreter', 'admin']}><CallRoom /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={roleHome(role)} replace />} />
      </Routes>
    </Suspense>
  );
}
