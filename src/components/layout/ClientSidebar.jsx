// ClientSidebar.jsx — fixed
// Added navItems here (were missing — Sidebar had no labels to show)
// Passes all props through so isCollapsed/onCollapse work from DashboardLayout

import React from 'react';
import {
  LayoutDashboard, Calendar, Wallet, MessageSquare,
  Heart, Star, User, Users, Settings,
} from 'lucide-react';
import Sidebar from './Sidebar';

const navItems = [
  { label: 'Dashboard',      icon: LayoutDashboard, path: '/client/dashboard' },
  { label: 'Book a Session', icon: Calendar,        path: '/client/booking' },
  { label: 'Wallet',         icon: Wallet,          path: '/client/wallet' },
  { label: 'Messages',       icon: MessageSquare,   path: '/client/messages' },
  { label: 'Favourites',     icon: Heart,           path: '/client/favourites' },
  { label: 'Reviews',        icon: Star,            path: '/client/reviews' },
  { label: 'Profile',        icon: User,            path: '/client/profile' },
  { label: 'For Teams',      icon: Users,           path: '/client/teams', badge: 'New' },
  { label: 'Settings',       icon: Settings,        path: '/client/settings' },
]

// ...props passes isCollapsed, onCollapse, mobile, onClose through from DashboardLayout
export default function ClientSidebar(props) {
  return (
    <Sidebar
      role="client"
      logoText="LingoBridge"
      logoSubtext="Connect. Communicate."
      navItems={navItems}
      {...props}
    />
  );
}