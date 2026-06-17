import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './features/admin/components/AdminLayout';

// ─── Eager-loaded: small layout + auth components ────────────────────────────
// All page components are lazy-loaded below to split the bundle by role.

// ─── Client pages ────────────────────────────────────────────────────────────
const ClientDashboard   = lazy(() => import('./features/client/pages/Dashboard'));
const BookingPage       = lazy(() => import('./features/booking/pages/BookingPage'));
const Teams             = lazy(() => import('./features/booking/pages/Teams'));
const SessionHistory    = lazy(() => import('./features/client/pages/SessionHistory'));
const Wallet            = lazy(() => import('./features/client/pages/Wallet'));
const Messages          = lazy(() => import('./features/client/pages/Messages'));
const Favourites        = lazy(() => import('./features/client/pages/Favourites'));
const RecentReviews     = lazy(() => import('./features/client/pages/RecentReviews'));
const Profile           = lazy(() => import('./features/client/pages/Profile'));
const Settings          = lazy(() => import('./features/client/pages/Settings'));

// ─── Interpreter pages ───────────────────────────────────────────────────────
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

// ─── Admin pages ───────────────────────────────────────────────────────────
const AdminDashboard   = lazy(() => import('./features/admin/pages/Dashboard'));
const Users            = lazy(() => import('./features/admin/pages/Users'));
const Interpreters     = lazy(() => import('./features/admin/pages/Interpreters'));
const Sessions         = lazy(() => import('./features/admin/pages/Sessions'));
const Transactions     = lazy(() => import('./features/admin/pages/Transactions'));
const Reviews          = lazy(() => import('./features/admin/pages/Reviews'));
const Disputes         = lazy(() => import('./features/admin/pages/Disputes'));
const AdminRequests    = lazy(() => import('./features/admin/pages/Requests'));
const AdminPayouts     = lazy(() => import('./features/admin/pages/Payouts'));
const Comms            = lazy(() => import('./features/admin/pages/Comms'));
const AdminSettings    = lazy(() => import('./features/admin/pages/Settings'));

// ─── Shared pages ────────────────────────────────────────────────────────────
const CallRoom   = lazy(() => import('./features/call/pages/CallRoom'));
const LoginPage  = lazy(() => import('./pages/LoginPage'));

// ─── Loading fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#534AB7]" />
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  const role = user.user_metadata?.role;
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

function AdminRoutes() {
  return (
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </AdminLayout>
  );
}

function InterpreterRoutes() {
  return (
    <DashboardLayout role="interpreter">
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </DashboardLayout>
  );
}

function ClientRoutes() {
  return (
    <DashboardLayout role="client">
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </DashboardLayout>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*"      element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }
  const role = user.user_metadata?.role;
  return (
    <Routes>
      <Route path="/" element={<Navigate to={roleHome(role)} replace />} />
      <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminRoutes /></ProtectedRoute>} />
      <Route path="/interpreter/*" element={<ProtectedRoute allowedRoles={['interpreter']}><InterpreterRoutes /></ProtectedRoute>} />
      <Route path="/client/*" element={<ProtectedRoute allowedRoles={['client']}><ClientRoutes /></ProtectedRoute>} />
      <Route path="/call/:channelId" element={<ProtectedRoute allowedRoles={['client', 'interpreter', 'admin']}><CallRoom /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={roleHome(role)} replace />} />
    </Routes>
  );
}