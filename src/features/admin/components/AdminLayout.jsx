// src/features/admin/components/AdminLayout.jsx
// Layout wrapper: provides AdminDataContext + renders AdminSidebar with live counts.

import { Outlet } from 'react-router-dom'
import { AdminDataProvider, useAdminData } from '../context/AdminDataContext'
import AdminSidebar from '../../components/layout/AdminSidebar'

function AdminLayoutInner() {
  const { liveSessions, requestQueue, activeDisputes, isSocketReady } = useAdminData()

  return (
    <div className="min-h-screen bg-lb-bg flex">
      <AdminSidebar
        liveSessionCount={liveSessions.length}
        pendingRequestCount={requestQueue.length}
        openDisputeCount={activeDisputes.length}
        isSocketConnected={isSocketReady}
      />
      <main className="flex-1 p-4 lg:p-6 max-w-[1440px] overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <AdminDataProvider>
      <AdminLayoutInner />
    </AdminDataProvider>
  )
}