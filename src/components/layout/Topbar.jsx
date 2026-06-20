import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Topbar
 * Polish: subtle background blur on scroll feel, refined height,
 *         avatar uses brand tint, notification dot positioned better
 */
export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();

  const isBookingPage = location.pathname === '/client/booking';

  const getTitle = () => {
    if (isBookingPage) return 'Book a Session';
    return location.pathname.split('/').pop().replace(/-/g, ' ') || 'Dashboard';
  };

  return (
    <header className="h-11 bg-white/90 backdrop-blur-sm border-b border-lb-border flex items-center justify-between px-4 lg:px-5 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden p-1.5 rounded-lg hover:bg-lb-surface text-lb-muted hover:text-lb-ink transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-semibold text-lb-ink capitalize tracking-[-0.01em]">
          {getTitle()}
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">
        <button
          aria-label="Notifications"
          className="relative p-1.5 rounded-lg hover:bg-lb-surface text-lb-muted hover:text-lb-ink transition-colors"
        >
          <Bell className="w-4 h-4" />
          {!isBookingPage && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 bg-lb-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              2
            </span>
          )}
        </button>

        <div className="w-7 h-7 rounded-full bg-[#EEEDFE] ring-2 ring-lb-primary/15 ring-offset-1 flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#4C3FCC]">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  );
}
