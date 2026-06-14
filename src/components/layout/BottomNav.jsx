import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role !== 'client') return null;

  const navItems = [
    { to: '/client/dashboard', icon: LayoutDashboard, label: 'Home', ariaLabel: 'Dashboard' },
    { to: '/client/booking', icon: Calendar, label: 'Book', ariaLabel: 'Book a Session' },
    { to: '/client/messages', icon: MessageSquare, label: 'Messages', ariaLabel: 'Messages', badge: 3 },
    { to: '/client/profile', icon: User, label: 'Profile', ariaLabel: 'Profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.ariaLabel}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-lb-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {/* Active background pill for better visibility */}
              {isActive && (
                <div className="absolute inset-x-2 top-1 bottom-1 bg-lb-primary/10 rounded-lg" />
              )}
              <div className="relative flex flex-col items-center">
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
