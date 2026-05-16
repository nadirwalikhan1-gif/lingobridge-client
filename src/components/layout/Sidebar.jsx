import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar({ role, navItems = [], footer, onCollapse, mobile, onClose, logoText, logoSubtext }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-white truncate">{logoText || 'LingoBridge'}</h1>
            <p className="text-[10px] text-white/40 mt-0.5 truncate">{logoSubtext || 'Connect. Communicate.'}</p>
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
          const to = item.to || item.path;
          const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => mobile && onClose?.()}
              className={() =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/15 text-white border-l-2 border-lb-primary'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 bg-lb-primary/20 text-lb-primary">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Custom Footer (from role sidebar) or default user/logout */}
      {footer ? (
        <div className="p-3 border-t border-slate-800">{footer}</div>
      ) : (
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
      )}
    </div>
  );
}