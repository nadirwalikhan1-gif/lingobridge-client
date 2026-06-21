// src/features/admin/components/AdminLayout.jsx
import { AdminDataProvider, useAdminData } from '../context/AdminDataContext'
import AdminSidebar from '../../../components/layout/AdminSidebar'

function AdminLayoutInner({ children }) {
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
        {children}
      </main>
    </div>
  )
}

export default function AdminLayout({ children }) {
  return (
    <AdminDataProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminDataProvider>
  )
}
