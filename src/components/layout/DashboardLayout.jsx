import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import SidebarCollapsed from './SidebarCollapsed';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const isClient = user?.role === 'client';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        {collapsed ? (
          <SidebarCollapsed onExpand={() => setCollapsed(false)} />
        ) : (
          <Sidebar onCollapse={() => setCollapsed(true)} />
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 lg:hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="text-white font-semibold">LingoBridge</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable content area with consistent padding */}
        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <div className="px-4 py-4 lg:p-5">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isClient && <BottomNav />}
      </div>
    </div>
  );
}