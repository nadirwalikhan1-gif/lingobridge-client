// Dashboard.jsx — Client dashboard rebuilt to match interpreter design language
// Same lb-* tokens · same card anatomy · same spacing rhythm · same component patterns

import { useEffect, useState } from 'react'

const MOCK_STATS = {
  totalSessions: '24',
  sessionsTrend: '+3 this month',
  favourites: '12',
  favouritesTrend: '+2 new',
  walletBalance: '$45.60',
  walletTrend: 'Available',
  rating: '4.9',
  ratingTrend: 'Top 5%',
}

const MOCK_SESSIONS = [
  { id: 1, interpreter: 'Maria Gonzalez', avatar: 'MG', fromLang: 'Spanish', toLang: 'English', type: 'video', duration: '45 min', price: '$32.50', rating: 5, date: 'Today, 10:30 AM' },
  { id: 2, interpreter: 'John Doe',       avatar: 'JD', fromLang: 'French',  toLang: 'English', type: 'audio', duration: '30 min', price: '$22.00', rating: 4, date: 'Yesterday, 2:15 PM' },
  { id: 3, interpreter: 'Sarah Chen',     avatar: 'SC', fromLang: 'Mandarin',toLang: 'English', type: 'video', duration: '60 min', price: '$45.00', rating: 5, date: 'Jan 10, 4:00 PM' },
]

const MOCK_ACTIVITY = [
  { id: 1, type: 'session', text: 'Completed video session with Maria G.', time: '2 hours ago' },
  { id: 2, type: 'review',  text: 'Left a 5-star review for John D.',       time: 'Yesterday' },
  { id: 3, type: 'wallet',  text: 'Added $50.00 to wallet',                 time: '3 days ago' },
]

const MOCK_UPCOMING = [
  { id: 1, time: '02:30 PM', interpreter: 'Maria G.', fromLang: 'Spanish', toLang: 'English', type: 'video', duration: '30 min', initials: 'MG', soon: true },
  { id: 2, time: '05:00 PM', interpreter: 'Ali Khan',  fromLang: 'Urdu',    toLang: 'English', type: 'audio', duration: '15 min', initials: 'AK', soon: false },
]

// ─── Icons ────────────────────────────────────────────────────────────────────
function VideoIcon({ className = 'w-2.5 h-2.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M15 10l4.553-2.069A1 1 0 0121 8.829v6.342a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
    </svg>
  )
}
function AudioIcon({ className = 'w-2.5 h-2.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
  )
}
function CalIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}
function StarIcon({ filled }) {
  return (
    <svg className={`w-3 h-3 ${filled ? 'text-amber-400 fill-amber-400' : 'text-lb-border fill-lb-border'}`} viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  )
}

// ─── Stat Cards (matches interpreter EarningsStats pattern) ──────────────────
function ClientStats({ stats }) {
  const cards = [
    { label: 'Total sessions',  value: stats.totalSessions,  delta: stats.sessionsTrend,   accent: true  },
    { label: 'Wallet balance',  value: stats.walletBalance,  delta: stats.walletTrend,      accent: true  },
    { label: 'Favourite interpreters', value: stats.favourites, delta: stats.favouritesTrend, accent: false },
    { label: 'Your rating',     value: stats.rating,         delta: stats.ratingTrend,      accent: false },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-lg px-4 py-3.5 ${c.accent ? 'bg-[#EEEDFE]' : 'bg-lb-surface'}`}
        >
          <p className={`text-[11px] mb-1.5 ${c.accent ? 'text-[#534AB7]' : 'text-lb-muted'}`}>{c.label}</p>
          <p className={`text-[22px] font-medium leading-none ${c.accent ? 'text-[#26215C]' : 'text-lb-ink'}`}>{c.value}</p>
          {c.delta && (
            <p className="text-[11px] mt-1.5 flex items-center gap-1 text-[#0F6E56]">
              <span>↑</span>{c.delta}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Recent Sessions (matches interpreter RecentSessions pattern) ────────────
function RecentSessionsList({ sessions }) {
  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[14px] font-medium text-lb-ink">Recent sessions</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">View all</button>
      </div>

      <div className="divide-y divide-lb-border">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5 py-2">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-medium text-[#534AB7] shrink-0">
              {s.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-lb-ink">{s.fromLang} → {s.toLang}</span>
                {s.type === 'video'
                  ? <VideoIcon className="w-2.5 h-2.5 text-lb-muted" />
                  : <AudioIcon className="w-2.5 h-2.5 text-lb-muted" />
                }
              </div>
              <p className="text-[11px] text-lb-muted mt-0.5">{s.interpreter} · {s.duration} · {s.date}</p>
            </div>

            {/* Rating + price */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[12px] font-medium text-lb-ink">{s.price}</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < s.rating} />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Quick Actions (matches interpreter card style) ──────────────────────────
function QuickActions() {
  const actions = [
    {
      label: 'Book video session',
      desc: 'Face-to-face interpretation',
      icon: <VideoIcon className="w-4 h-4 text-[#534AB7]" />,
      bg: 'bg-[#EEEDFE]',
    },
    {
      label: 'Book audio session',
      desc: 'Voice-only interpretation',
      icon: <AudioIcon className="w-4 h-4 text-[#0F6E56]" />,
      bg: 'bg-[#E1F5EE]',
    },
    {
      label: 'Schedule later',
      desc: 'Plan your next session',
      icon: <CalIcon />,
      bg: 'bg-lb-surface',
    },
  ]

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Quick actions</h3>
      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.label}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-lb-border hover:border-[#7F77DD] hover:bg-lb-surface transition-colors text-left"
          >
            <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center shrink-0`}>
              {a.icon}
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-medium text-lb-ink">{a.label}</p>
              <p className="text-[10px] text-lb-muted">{a.desc}</p>
            </div>
            <svg className="w-3.5 h-3.5 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Upcoming Sessions (matches interpreter TodaysSchedule) ──────────────────
function UpcomingSessions({ sessions }) {
  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-medium text-lb-ink">Today's sessions</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">Calendar</button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-[12px] text-lb-muted text-center py-4">No sessions today</p>
      ) : (
        <div className="divide-y divide-lb-border">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-2.5 py-2">
              <span className="text-[11px] font-medium text-lb-ink w-[52px] shrink-0">{s.time}</span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.soon ? 'bg-[#1D9E75]' : 'bg-[#7F77DD]'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-lb-ink truncate">{s.fromLang} → {s.toLang}</p>
                <div className="flex items-center gap-1 mt-0.5 text-lb-muted">
                  {s.type === 'video' ? <VideoIcon /> : <AudioIcon />}
                  <span className="text-[10px]">{s.type === 'video' ? 'Video' : 'Audio'} · {s.duration} · {s.initials}</span>
                </div>
              </div>
              {s.soon && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#E1F5EE] text-[#0F6E56] shrink-0">Soon</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-lb-border">
        <button className="w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[12px] font-medium rounded-lg py-1.5 transition-colors">
          + Book new session
        </button>
      </div>
    </div>
  )
}

// ─── Wallet Snapshot (matches interpreter WalletSummary) ─────────────────────
function WalletSnapshot() {
  const rows = [
    { label: 'Spent today',   value: '$32.50' },
    { label: 'Spent this week', value: '$99.50' },
    { label: 'Spent this month', value: '$150.00' },
  ]
  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Wallet</h3>

      <div className="divide-y divide-lb-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-1.5">
            <span className="text-[12px] text-lb-muted">{r.label}</span>
            <span className="text-[12px] font-medium text-lb-ink">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-lb-border">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="text-[11px] text-lb-muted">Available balance</span>
          <span className="text-[17px] font-medium text-[#26215C]">$45.60</span>
        </div>
        <p className="text-[10px] text-lb-subtle text-right mb-2">Ready to use</p>
        <button className="w-full bg-lb-surface hover:bg-lb-border text-lb-ink text-[12px] font-medium rounded-lg py-1.5 transition-colors border border-lb-border">
          ↑ Add funds
        </button>
      </div>
    </div>
  )
}

// ─── Recent Activity (matches interpreter card row style) ────────────────────
function RecentActivity({ activity }) {
  const iconMap = {
    session: { bg: 'bg-[#EEEDFE]', color: 'text-[#534AB7]', icon: <VideoIcon className="w-3.5 h-3.5 text-[#534AB7]" /> },
    review:  { bg: 'bg-[#FFF8E6]', color: 'text-[#BA7517]', icon: <span className="text-[11px] text-[#BA7517]">★</span> },
    wallet:  { bg: 'bg-[#E1F5EE]', color: 'text-[#0F6E56]', icon: <span className="text-[11px] text-[#0F6E56]">↑</span> },
  }
  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-medium text-lb-ink">Recent activity</h3>
      </div>
      <div className="divide-y divide-lb-border">
        {activity.map((a) => {
          const { bg, icon } = iconMap[a.type] || iconMap.session
          return (
            <div key={a.id} className="flex items-center gap-2.5 py-2">
              <div className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-lb-ink truncate">{a.text}</p>
                <p className="text-[10px] text-lb-muted mt-0.5">{a.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Skeleton (matches interpreter DashboardSkeleton) ────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 bg-lb-border rounded w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-lb-border rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="xl:col-span-2 h-72 bg-lb-border rounded-xl" />
        <div className="h-72 bg-lb-border rounded-xl" />
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-3">
      {/* Header — mirrors interpreter workspace header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Welcome back, Sarah</p>
          <h1 className="text-lg font-medium text-lb-ink mt-0.5">Client workspace</h1>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#EEEDFE] text-[#534AB7] transition-colors">
          + Book session
        </button>
      </div>

      {/* Stats strip */}
      <ClientStats stats={MOCK_STATS} />

      {/* Main 2/3 + 1/3 grid — mirrors interpreter layout exactly */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Left col — main content */}
        <div className="xl:col-span-2 space-y-3">
          <RecentSessionsList sessions={MOCK_SESSIONS} />
          <RecentActivity activity={MOCK_ACTIVITY} />
        </div>

        {/* Right col — sidebar */}
        <div className="space-y-3">
          <UpcomingSessions sessions={MOCK_UPCOMING} />
          <WalletSnapshot />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}