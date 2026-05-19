// DashboardLayout.jsx — fixed
// ROOT CAUSE: was swapping to a separate <SidebarCollapsed> component when collapsed,
// so the updated Sidebar's isCollapsed logic never ran and labels were never shown.
// FIX: always render <RoleSidebar>, pass isCollapsed prop, let Sidebar handle both states.

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import ClientSidebar from './ClientSidebar';
import InterpreterSidebar from './InterpreterSidebar';
import AdminSidebar from './AdminSidebar';

function RoleSidebar({ role, ...props }) {
  if (role === 'admin')       return <AdminSidebar {...props} />;
  if (role === 'interpreter') return <InterpreterSidebar {...props} />;
  return <ClientSidebar {...props} />;
}

export default function DashboardLayout({ children, role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const resolvedRole = role ?? user?.role;
  const isClient = resolvedRole === 'client';

  return (
    <div className="flex h-screen bg-lb-canvas overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      {/* Let the Sidebar component control its own width via isCollapsed.
          The container just needs to NOT clamp the width — use w-auto or w-fit. */}
      <div className="hidden lg:flex flex-shrink-0">
        <RoleSidebar
          role={resolvedRole}
          isCollapsed={collapsed}
          onCollapse={() => setCollapsed(c => !c)}
        />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <RoleSidebar
              role={resolvedRole}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <div className="px-4 py-4 lg:p-5">
            {children}
          </div>
        </main>
        {isClient && <BottomNav />}
      </div>
    </div>
  );
}