// InterpreterSidebar.jsx — fixed to pass all props through to Sidebar
// Previously ignored isCollapsed/onCollapse so collapse never worked

import { LayoutDashboard, Clock, Inbox, Calendar, DollarSign, Wallet, Star, User, Settings, HelpCircle, LogOut } from 'lucide-react'
import Sidebar from './Sidebar'

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/interpreter/dashboard' },
  { label: 'Availability', icon: Clock,           path: '/interpreter/availability' },
  { label: 'Requests',     icon: Inbox,           path: '/interpreter/requests', badge: '2' },
  { label: 'My Sessions',  icon: Calendar,        path: '/interpreter/sessions' },
  { label: 'Earnings',     icon: DollarSign,      path: '/interpreter/earnings' },
  { label: 'Payouts',      icon: Wallet,          path: '/interpreter/payouts' },
  { label: 'Reviews',      icon: Star,            path: '/interpreter/reviews' },
  { label: 'Profile',      icon: User,            path: '/interpreter/profile' },
  { label: 'Settings',     icon: Settings,        path: '/interpreter/settings' },
  { label: 'Help & Support', icon: HelpCircle,    path: '/interpreter/help' },
]

// ...props passes isCollapsed, onCollapse, mobile, onClose through from DashboardLayout
export default function InterpreterSidebar(props) {
  return (
    <Sidebar
      role="interpreter"
      logoText="Andiraw"
      logoSubtext="Connect. Communicate. Anywhere."
      navItems={navItems}
      {...props}
    />
  )
}
