// Sidebar.jsx — shared sidebar for all roles
// Fixed: name now derives from firstName/lastName/email if name is missing

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// ── helpers ──
const getUserName = (user) => {
  if (!user) return 'User';
  return (
    user.name ||
    (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
    user.firstName ||
    user.displayName ||
    user.email?.split('@')[0] ||
    'User'
  );
};

const getUserInitials = (user) => {
  const name = getUserName(user);
  if (name === 'User') return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function Sidebar({
  role,
  navItems = [],
  footer,
  isCollapsed: controlledCollapsed,
  onCollapse,
  mobile,
  onClose,
  logoText,
  logoSubtext,
}) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleCollapseToggle = () => {
    if (onCollapse) {
      onCollapse();
    } else {
      setInternalCollapsed((c) => !c);
    }
  };

  const userName = getUserName(user);
  const userInitials = getUserInitials(user);
  const userEmail = user?.email || '';

  return (
    <div
      className={`flex flex-col h-full bg-[#1C1A2E] text-white transition-all duration-200 ${
        isCollapsed ? 'w-[56px]' : 'w-[220px]'
      }`}
    >
      {/* ── Logo ── */}
      <div className={`border-b border-white/8 shrink-0 ${isCollapsed ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between gap-2">
          <div
            className={`w-7 h-7 rounded-lg bg-[#7F77DD] flex items-center justify-center shrink-0 ${
              isCollapsed ? 'mx-auto' : ''
            }`}
          >
            <span className="text-[11px] font-bold text-white">L</span>
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-[14px] font-semibold text-white truncate leading-tight">
                {logoText || 'LingoBridge'}
              </h1>
              <p className="text-[10px] text-white/40 truncate mt-0.5">
                {logoSubtext || 'Connect. Communicate.'}
              </p>
            </div>
          )}

          {!mobile && (
            <button
              onClick={handleCollapseToggle}
              className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const to = item.to || item.path;
          const isActive =
            location.pathname === to || location.pathname.startsWith(`${to}/`);

          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => mobile && onClose?.()}
              title={isCollapsed ? item.label : undefined}
              className={() =>
                `relative flex items-center rounded-lg transition-colors ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#7F77DD]/20 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {/* Active accent bar */}
              {isActive && !isCollapsed && (
                <span className="absolute left-0 w-0.5 h-6 bg-[#7F77DD] rounded-r-full" />
              )}

              {/* Icon */}
              <item.icon
                className={`shrink-0 transition-colors ${
                  isCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'
                } ${isActive ? 'text-[#A8A3E8]' : ''}`}
              />

              {/* Label + live dot + badge — hidden when collapsed */}
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate text-[13px] font-medium">
                    {item.label}
                  </span>

                  {/* Live dot — pulsing green indicator (e.g. Live Sessions) */}
                  {item.dot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse shrink-0" />
                  )}

                  {/* Badge — optional pulse for urgent counts */}
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                        item.pulseBadge
                          ? 'bg-[#7F77DD] text-white animate-pulse'
                          : 'bg-[#7F77DD]/20 text-[#A8A3E8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Collapsed: badge dot — pulses if pulseBadge */}
              {isCollapsed && item.badge && (
                <span
                  className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                    item.pulseBadge ? 'bg-[#E24B4A] animate-pulse' : 'bg-[#7F77DD]'
                  }`}
                />
              )}

              {/* Collapsed: live dot — green pulse for dot items */}
              {isCollapsed && item.dot && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      {footer ? (
        <div className={`border-t border-white/8 shrink-0 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="w-7 h-7 rounded-full bg-[#7F77DD]/20 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-[#A8A3E8]">
                  {userInitials}
                </span>
              </div>
            </div>
          ) : (
            footer
          )}
        </div>
      ) : (
        <div className={`border-t border-white/8 shrink-0 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-7 h-7 rounded-full bg-[#7F77DD]/20 flex items-center justify-center cursor-default"
                title={userName}
              >
                <span className="text-[10px] font-semibold text-[#A8A3E8]">
                  {userInitials}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-full bg-[#7F77DD]/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-semibold text-[#A8A3E8]">
                    {userInitials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white truncate">
                    {userName}
                  </p>
                  <p className="text-[10px] text-white/40 truncate">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-[12px] text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}