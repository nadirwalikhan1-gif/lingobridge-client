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
  ChevronLeft,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar({ onCollapse, mobile, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isClient = user?.role === 'client';

  const clientNavItems = [
    { to: '/client/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/client/booking', icon: Calendar, label: 'Book a Session' },
    { to: '/client/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/client/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/client/favourites', icon: Heart, label: 'Favourites' },
    { to: '/client/reviews', icon: Star, label: 'Reviews' },
    { to: '/client/profile', icon: User, label: 'Profile' },
  ];

  const teamNavItem = {
    to: '/client/teams',
    icon: Users,
    label: 'For Teams',
    badge: 'New',
  };

  const settingsItem = {
    to: '/client/settings',
    icon: Settings,
    label: 'Settings',
  };

  const navItems = isClient ? [...clientNavItems, teamNavItem, settingsItem] : [];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo Area */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-white truncate">LingoBridge</h1>
            <p className="text-[10px] text-white/40 mt-0.5 truncate">Connect. Communicate.</p>
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors flex-shrink-0 ml-2"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => mobile && onClose?.()}
              className={({ isActive: navActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  navActive || isActive
                    ? 'bg-white/15 text-white border-l-2 border-lb-primary'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                    item.label === 'For Teams'
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-lb-primary/20 text-lb-primary'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Wallet Card */}
      {isClient && (
        <div className="p-3 mx-3 mb-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-lb-primary flex-shrink-0" />
            <span className="text-xs text-white/60 truncate">Wallet Balance</span>
          </div>
          <p className="text-lg font-bold text-white">
            $45.60
          </p>
        </div>
      )}

      {/* User & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-lb-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-lb-primary">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-white/40 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}