// AdminSidebar.jsx — Refactored to match LingoBridge ecosystem
// Live indicators: dot on Live Sessions, pulseBadge on Request Queue + Disputes

import {
  LayoutDashboard,
  Radio,
  Inbox,
  Users,
  Headphones,
  CreditCard,
  AlertTriangle,
  Star,
  MessageSquare,
  Ticket,
  Settings,
  Globe,
  LogOut,
} from 'lucide-react'
import Sidebar from './Sidebar'

const navItems = [
  // Operations group
  { label: 'Overview',        icon: LayoutDashboard, path: '/admin/dashboard' },
  // dot: true — pulsing green live indicator, no count badge
  { label: 'Live Sessions',   icon: Radio,           path: '/admin/sessions',      dot: true },
  // pulseBadge: true — count pulses to signal pending work
  { label: 'Request Queue',   icon: Inbox,           path: '/admin/requests',      badge: '7',  pulseBadge: true },
  { label: 'Interpreters',    icon: Headphones,      path: '/admin/interpreters' },

  // Management group
  { label: 'Users',           icon: Users,           path: '/admin/users' },
  { label: 'Payouts',         icon: CreditCard,      path: '/admin/payouts' },
  // pulseBadge: true — disputes need attention
  { label: 'Disputes',        icon: AlertTriangle,   path: '/admin/disputes',      badge: '3',  pulseBadge: true },
  { label: 'Reviews',         icon: Star,            path: '/admin/reviews' },
  { label: 'Comms',           icon: MessageSquare,   path: '/admin/communications' },

  // System group
  { label: 'Coupons',         icon: Ticket,          path: '/admin/coupons' },
  { label: 'Settings',        icon: Settings,        path: '/admin/settings' },
]

const AdminFooterContent = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-[#7F77DD]/20 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-semibold text-[#A8A3E8]">SA</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-white truncate">Super Admin</p>
        <p className="text-[10px] text-white/40 truncate">Platform Administrator</p>
      </div>
      {/* Live platform dot */}
      <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse shrink-0" />
    </div>
    <button className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
      <Globe className="w-3.5 h-3.5" />
      View website
    </button>
    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
      <LogOut className="w-3.5 h-3.5" />
      Logout
    </button>
  </div>
)

export default function AdminSidebar(props) {
  return (
    <Sidebar
      role="admin"
      logoText="LingoBridge"
      logoSubtext="Mission Control"
      navItems={navItems}
      footer={<AdminFooterContent />}
      {...props}
    />
  )
}