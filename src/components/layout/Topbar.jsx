import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();

  const isBookingPage = location.pathname === '/client/booking';

  const getTitle = () => {
    if (isBookingPage) return 'Book a Session'
    return location.pathname.split('/').pop().replace(/-/g, ' ') || 'Dashboard'
  }

  return (
    <header className="h-11 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-5 flex-shrink-0">
      {/* Left: Mobile menu + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-semibold text-slate-800 capitalize">
          {getTitle()}
        </h2>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
          {!isBookingPage && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-lb-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          )}
        </button>

        <div className="w-7 h-7 rounded-full bg-lb-primary/20 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-lb-primary">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  );
}