import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  MessageSquare,
  Heart,
  Star,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import Avatar from '@/components/ui/Avatar';

export default function SidebarCollapsed({ onExpand }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isClient = user?.role === 'client';

  const navItems = [
    { to: '/client/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/client/booking', icon: Calendar, label: 'Book a Session' },
    { to: '/client/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/client/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/client/favourites', icon: Heart, label: 'Favourites' },
    { to: '/client/reviews', icon: Star, label: 'Reviews' },
    { to: '/client/profile', icon: User, label: 'Profile' },
    { to: '/client/teams', icon: Users, label: 'For Teams', badge: 'New' },
    { to: '/client/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white items-center py-3">
      {/* Logo */}
      <div className="mb-4">
        <button
          onClick={onExpand}
          aria-label="Expand sidebar"
          className="w-8 h-8 rounded-lg bg-lb-primary/20 flex items-center justify-center hover:bg-lb-primary/30 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4 text-lb-primary" />
        </button>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center gap-1 overflow-y-auto no-scrollbar w-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive: navActive }) =>
                `relative flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                  navActive || isActive
                    ? 'bg-white/20 text-white' // More visible active highlight
                    : 'text-white/40 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-slate-900" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Avatar - using Avatar component with fallback */}
      <div className="mt-auto flex flex-col items-center gap-3 pt-3 border-t border-slate-800 w-full px-2">
        <Avatar
          src={user?.avatar}
          fallback={user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JD'}
          className="w-8 h-8"
        />
        <button
          onClick={logout}
          aria-label="Logout"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
