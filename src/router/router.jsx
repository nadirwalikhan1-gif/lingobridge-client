// router.jsx — Admin routes with auth guards
import { adminRoutes } from '../features/admin/router'
import { Route } from 'react-router-dom'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Interpreters from './pages/Interpreters'
import Sessions from './pages/Sessions'
import Transactions from './pages/Transactions'
import Reviews from './pages/Reviews'
import Disputes from './pages/Disputes'
import Requests from './pages/Requests'
import Payouts from './pages/Payouts'
import Comms from './pages/Comms'
import Settings from './pages/Settings'

export const adminRoutes = (
  <Route
    path="/admin"
    element={
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    }
  >
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="interpreters" element={<Interpreters />} />
    <Route path="sessions" element={<Sessions />} />
    <Route path="requests" element={<Requests />} />
    <Route path="transactions" element={<Transactions />} />
    <Route path="reviews" element={<Reviews />} />
    <Route path="disputes" element={<Disputes />} />
    <Route path="payouts" element={<Payouts />} />
    <Route path="communications" element={<Comms />} />
    <Route path="settings" element={<Settings />} />
  </Route>
)