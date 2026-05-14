import { LayoutDashboard, Clock, Inbox, Calendar, DollarSign, Wallet, Star, User, Settings, HelpCircle, LogOut } from 'lucide-react'
import Sidebar from './Sidebar'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/interpreter/dashboard' },
  { label: 'Availability', icon: Clock, path: '/interpreter/availability' },
  { label: 'Requests', icon: Inbox, path: '/interpreter/requests', badge: '2' },
  { label: 'My Sessions', icon: Calendar, path: '/interpreter/sessions' },
  { label: 'Earnings', icon: DollarSign, path: '/interpreter/earnings' },
  { label: 'Payouts', icon: Wallet, path: '/interpreter/payouts' },
  { label: 'Reviews', icon: Star, path: '/interpreter/reviews' },
  { label: 'Profile', icon: User, path: '/interpreter/profile' },
  { label: 'Settings', icon: Settings, path: '/interpreter/settings' },
  { label: 'Help & Support', icon: HelpCircle, path: '/interpreter/help' },
]

export default function InterpreterSidebar() {
  return (
    <Sidebar
      role="interpreter"
      logoText="LingoBridge"
      logoSubtext="Connect. Communicate. Anywhere."
      navItems={navItems}
      footer={
        <div className="space-y-4">
          <div className="bg-white/5 rounded-card p-4 border border-white/10">
            <p className="text-xs text-white/50 mb-1">Wallet Balance</p>
            <p className="text-xl font-bold text-white mb-3">$124.75</p>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-button hover:bg-emerald-500">
              <Wallet className="w-4 h-4" />
              Withdraw Funds
            </button>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="relative">
              <img src="/avatars/maria.jpg" alt="" className="w-9 h-9 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-interpreter-sidebar rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Maria Garcia</p>
              <p className="text-xs text-white/50 truncate">Interpreter</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      }
    />
  )
}