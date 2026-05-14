import { LayoutDashboard, Users, Headphones, Calendar, CreditCard, BarChart3, AlertTriangle, Star, Ticket, Settings, LogOut, Globe } from 'lucide-react'
import Sidebar from './Sidebar'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Interpreters', icon: Headphones, path: '/admin/interpreters' },
  { label: 'Sessions', icon: Calendar, path: '/admin/sessions' },
  { label: 'Transactions', icon: CreditCard, path: '/admin/transactions' },
  { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { label: 'Disputes', icon: AlertTriangle, path: '/admin/disputes' },
  { label: 'Reviews', icon: Star, path: '/admin/reviews' },
  { label: 'Coupons', icon: Ticket, path: '/admin/coupons' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
]

export default function AdminSidebar() {
  return (
    <Sidebar
      role="admin"
      logoText="LingoBridge"
      logoSubtext="Admin Panel"
      navItems={navItems}
      footer={
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <img src="/avatars/admin.jpg" alt="" className="w-9 h-9 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-white/50 truncate">Super Administrator</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white/80 bg-white/5 border border-white/10 rounded-button hover:bg-white/10">
            <Globe className="w-4 h-4" />
            View Website
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      }
    />
  )
}