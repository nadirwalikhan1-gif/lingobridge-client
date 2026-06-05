// Dashboard.jsx — Client dashboard v3
// FIX: vault-model — demo sessions and stats use CLIENT_RATES pricing
// Languages: 3 English variants (from) → 2 Pashto + 2 Punjabi variants (to)
// Interpreters: South Asian names matched to correct language/dialect

import { useEffect, useState } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
// FIX: vault-model — import client rates for dynamic pricing
import { CLIENT_RATES } from '@/config/constants'

// ─── Language System (7 codes only — synced from BookingPage.jsx) ─────────────
const LANGUAGE_NAMES = {
  'en-us':        'English (US)',
  'en-gb':        'English (UK)',
  'en-ca':        'English (Canada)',
  'ps-east':      'Pashto (Eastern)',
  'ps-west':      'Pashto (Western)',
  'pa-gurmukhi':  'Punjabi (Gurmukhi)',
  'pa-shahmukhi': 'Punjabi (Shahmukhi)',
}
const langDisplay = (code) => LANGUAGE_NAMES[code] ?? code

// ─── Interpreters (South Asian names matched to dialect) ──────────────────────
const INTERPRETERS = [
  { id: 1,  name: 'Khalid Ahmadzai',   initials: 'KA', langs: ['ps-east', 'ps-west'] },
  { id: 2,  name: 'Noorullah Wardak',  initials: 'NW', langs: ['ps-east'] },
  { id: 3,  name: 'Zarghona Shinwari', initials: 'ZS', langs: ['ps-east', 'ps-west'] },
  { id: 4,  name: 'Habibullah Safi',   initials: 'HS', langs: ['ps-west'] },
  { id: 5,  name: 'Rajinder Singh',    initials: 'RS', langs: ['pa-gurmukhi'] },
  { id: 6,  name: 'Amrit Kaur',        initials: 'AK', langs: ['pa-gurmukhi'] },
  { id: 7,  name: 'Gurpreet Sandhu',   initials: 'GS', langs: ['pa-gurmukhi'] },
  { id: 8,  name: 'Imran Chaudhry',    initials: 'IC', langs: ['pa-shahmukhi'] },
  { id: 9,  name: 'Sadia Butt',        initials: 'SB', langs: ['pa-shahmukhi'] },
  { id: 10, name: 'Usman Rajput',      initials: 'UR', langs: ['pa-shahmukhi'] },
]

// FIX: vault-model — helper to compute price from minutes and session type
const computePrice = (minutes, type) => {
  const rate = CLIENT_RATES[type] || 0
  return +(minutes * rate).toFixed(2)
}

// FIX: vault-model — raw session data with minutes, price computed dynamically
const MOCK_SESSIONS_RAW = [
  {
    id: 1,
    interpreter: 'Khalid Ahmadzai',
    avatar:      'KA',
    fromLang:    'en-us',
    toLang:      'ps-east',
    type:        'video',
    duration:    '45 min',
    minutes:     45,
    rating:      5,
    date:        'Today, 10:30 AM',
  },
  {
    id: 2,
    interpreter: 'Imran Chaudhry',
    avatar:      'IC',
    fromLang:    'en-gb',
    toLang:      'pa-shahmukhi',
    type:        'audio',
    duration:    '30 min',
    minutes:     30,
    rating:      4,
    date:        'Yesterday, 2:15 PM',
  },
  {
    id: 3,
    interpreter: 'Rajinder Singh',
    avatar:      'RS',
    fromLang:    'en-ca',
    toLang:      'pa-gurmukhi',
    type:        'video',
    duration:    '60 min',
    minutes:     60,
    rating:      5,
    date:        'Jan 10, 4:00 PM',
  },
  {
    id: 4,
    interpreter: 'Zarghona Shinwari',
    avatar:      'ZS',
    fromLang:    'en-us',
    toLang:      'ps-west',
    type:        'audio',
    duration:    '30 min',
    minutes:     30,
    rating:      5,
    date:        'Jan 8, 11:00 AM',
  },
]

// FIX: vault-model — compute prices from CLIENT_RATES
const MOCK_SESSIONS = MOCK_SESSIONS_RAW.map(s => ({
  ...s,
  price: `$${computePrice(s.minutes, s.type).toFixed(2)}`,
}))

// FIX: vault-model — compute stats from actual session data
const totalSpent = MOCK_SESSIONS_RAW.reduce((sum, s) => sum + computePrice(s.minutes, s.type), 0)
const todaySpent = MOCK_SESSIONS_RAW
  .filter(s => s.date.startsWith('Today'))
  .reduce((sum, s) => sum + computePrice(s.minutes, s.type), 0)

const MOCK_STATS = {
  totalSessions:   '24',
  sessionsTrend:   '+3 this month',
  favourites:      '12',
  favouritesTrend: '+2 new',
  walletBalance:   '$45.60',
  walletAvailable: 45.60,
  walletTrend:     'Available',
}

const MOCK_ACTIVITY = [
  { id: 1, type: 'session', text: 'Completed video session with Khalid A.', time: '2 hours ago' },
  { id: 2, type: 'review',  text: 'Left a 5-star review for Imran C.',      time: 'Yesterday' },
  { id: 3, type: 'wallet',  text: 'Added $50.00 to wallet',                 time: '3 days ago' },
]

const MOCK_UPCOMING = [
  {
    id: 1,
    time:        '02:30 PM',
    scheduledAt: (() => { const d = new Date(); d.setHours(14, 30, 0, 0); return d })(),
    interpreter: 'Noorullah Wardak',
    initials:    'NW',
    fromLang:    'en-us',
    toLang:      'ps-east',
    type:        'video',
    duration:    '30 min',
  },
  {
    id: 2,
    time:        '05:00 PM',
    scheduledAt: (() => { const d = new Date(); d.setHours(17, 0, 0, 0); return d })(),
    interpreter: 'Sadia Butt',
    initials:    'SB',
    fromLang:    'en-gb',
    toLang:      'pa-shahmukhi',
    type:        'audio',
    duration:    '15 min',
  },
]

const LAST_SESSION = MOCK_SESSIONS[0]

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

// ─── Live Countdown Hook ──────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [label, setLabel] = useState('')
  const [isImminent, setIsImminent] = useState(false)

  useEffect(() => {
    function tick() {
      const diff = targetDate - Date.now()
      if (diff <= 0) { setLabel('Starting now'); setIsImminent(true); return }
      const totalMins = Math.floor(diff / 60000)
      const hrs  = Math.floor(totalMins / 60)
      const mins = totalMins % 60
      setIsImminent(totalMins < 15)
      if (hrs > 0)       setLabel(`in ${hrs}h ${mins}m`)
      else if (mins > 0) setLabel(`in ${mins} min`)
      else               setLabel('in <1 min')
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [targetDate])

  return { label, isImminent }
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function ClientStats({ stats }) {
  const lowBalance = stats.walletAvailable < 20

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <div className={`rounded-xl px-6 py-5 flex flex-col justify-between min-h-[110px] ${lowBalance ? 'bg-[#7B1F1F]' : 'bg-[#1a1635]'}`}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Wallet balance</p>
          {lowBalance && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-200">Low balance</span>
          )}
        </div>
        <div className="mt-2">
          <p className="text-[42px] font-semibold leading-none text-white tracking-tight">{stats.walletBalance}</p>
          <p className={`text-[12px] mt-2 flex items-center gap-1 ${lowBalance ? 'text-red-300' : 'text-[#4ade80]'}`}>
            {lowBalance
              ? '⚠ Top up before your next session'
              : <><span className="text-[10px]">✓</span> {stats.walletTrend}</>
            }
          </p>
        </div>
      </div>

      <div className="rounded-xl px-4 py-4 bg-[#EEEDFE] flex flex-col justify-between min-h-[110px]">
        <p className="text-[11px] text-[#534AB7] uppercase tracking-widest font-medium">Total sessions</p>
        <div className="mt-2">
          <p className="text-[28px] font-semibold leading-none text-[#26215C]">{stats.totalSessions}</p>
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {stats.sessionsTrend}</p>
        </div>
      </div>

      <div className="rounded-xl px-4 py-4 bg-lb-surface border border-lb-border flex flex-col justify-between min-h-[110px]">
        <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium">Favourites</p>
        <div>
          <p className="text-[28px] font-semibold text-lb-ink leading-none">{stats.favourites}</p>
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">{stats.favouritesTrend}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Upcoming Session Card ────────────────────────────────────────────────────
function UpcomingSessionCard({ session }) {
  const { label, isImminent } = useCountdown(session.scheduledAt)
  const pairLabel = `${langDisplay(session.fromLang)} → ${langDisplay(session.toLang)}`

  return (
    <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-colors ${
      isImminent ? 'border-[#1D9E75] bg-[#E1F5EE]' : 'border-lb-border bg-lb-surface'
    }`}>
      <div className="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-semibold text-[#534AB7] shrink-0">
        {session.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-lb-ink truncate">{pairLabel}</p>
        <div className="flex items-center gap-1 mt-0.5 text-lb-muted">
          {session.type === 'video' ? <VideoIcon /> : <AudioIcon />}
          <span className="text-[10px]">{session.interpreter} · {session.duration}</span>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className="text-[10px] font-medium text-lb-ink">{session.time}</span>
        {isImminent ? (
          <button className="px-2.5 py-1 text-[10px] font-semibold bg-[#1D9E75] text-white rounded-lg animate-pulse">
            Join now
          </button>
        ) : (
          <span className="text-[10px] text-[#7F77DD] font-medium">{label}</span>
        )}
      </div>
    </div>
  )
}

// ─── Today's Sessions ─────────────────────────────────────────────────────────
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
        <div className="flex flex-col gap-2">
          {sessions.map((s) => <UpcomingSessionCard key={s.id} session={s} />)}
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-lb-border">
        <button className="w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[12px] font-medium rounded-lg py-1.5 transition-colors">
          + Book new session
        </button>
      </div>
    </div>
  )
}

// ─── Recent Sessions ──────────────────────────────────────────────────────────
function RecentSessionsList({ sessions }) {
  if (!sessions.length) {
    return (
      <div className="lb-card flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-12 h-12 rounded-full bg-[#EEEDFE] flex items-center justify-center">
          <VideoIcon className="w-5 h-5 text-[#7F77DD]" />
        </div>
        <p className="text-[14px] font-medium text-lb-ink">No sessions yet</p>
        <p className="text-[12px] text-lb-muted text-center max-w-[200px]">
          Book your first session and get connected with an interpreter instantly.
        </p>
        <button className="mt-1 px-4 py-1.5 text-[12px] font-medium bg-[#7F77DD] text-white rounded-lg hover:bg-[#534AB7] transition-colors">
          Book a session
        </button>
      </div>
    )
  }

  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[14px] font-medium text-lb-ink">Recent sessions</h3>
        <button className="text-[12px] text-[#7F77DD] font-medium">View all</button>
      </div>
      <div className="divide-y divide-lb-border">
        {sessions.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5 py-2">
            <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-semibold text-[#534AB7] shrink-0">
              {s.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-lb-ink">
                  {langDisplay(s.fromLang)} → {langDisplay(s.toLang)}
                </span>
                {s.type === 'video'
                  ? <VideoIcon className="w-2.5 h-2.5 text-lb-muted" />
                  : <AudioIcon className="w-2.5 h-2.5 text-lb-muted" />
                }
              </div>
              <p className="text-[11px] text-lb-muted mt-0.5">
                {s.interpreter} · {s.duration} · {s.date}
              </p>
            </div>
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

// ─── Recent Activity ──────────────────────────────────────────────────────────
function RecentActivity({ activity }) {
  const iconMap = {
    session: { bg: 'bg-[#EEEDFE]', icon: <VideoIcon className="w-3.5 h-3.5 text-[#534AB7]" /> },
    review:  { bg: 'bg-[#FFF8E6]', icon: <span className="text-[11px] text-[#BA7517]">★</span> },
    wallet:  { bg: 'bg-[#E1F5EE]', icon: <span className="text-[11px] text-[#0F6E56]">↑</span> },
  }
  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Recent activity</h3>
      <div className="divide-y divide-lb-border">
        {activity.map((a) => {
          const { bg, icon } = iconMap[a.type] || iconMap.session
          return (
            <div key={a.id} className="flex items-center gap-2.5 py-2">
              <div className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
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

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions({ lastSession }) {
  const rebookLabel = `${langDisplay(lastSession.fromLang)} → ${langDisplay(lastSession.toLang)}`

  const actions = [
    {
      label:     `Rebook ${lastSession.interpreter.split(' ')[0]}`,
      desc:      `${rebookLabel} · ${lastSession.duration}`,
      icon:      (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[9px] font-semibold text-[#534AB7]">
          {lastSession.avatar}
        </div>
      ),
      bg:        'bg-[#7F77DD]',
      textColor: 'text-white',
      descColor: 'text-white/70',
      primary:   true,
    },
    {
      label:     'New session',
      desc:      'Different language or interpreter',
      icon:      <VideoIcon className="w-4 h-4 text-[#534AB7]" />,
      bg:        'bg-[#EEEDFE]',
      textColor: 'text-lb-ink',
      descColor: 'text-lb-muted',
    },
    {
      label:     'Schedule later',
      desc:      'Plan and book in advance',
      icon:      <CalIcon />,
      bg:        'bg-lb-surface',
      textColor: 'text-lb-ink',
      descColor: 'text-lb-muted',
    },
  ]

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Quick actions</h3>
      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.label}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left ${
              a.primary
                ? 'border-[#7F77DD] bg-[#7F77DD] hover:bg-[#534AB7] hover:border-[#534AB7]'
                : 'border-lb-border bg-lb-surface hover:border-[#7F77DD] hover:bg-[#EEEDFE]/40'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center shrink-0`}>{a.icon}</div>
            <div className="flex-1">
              <p className={`text-[12px] font-medium ${a.textColor}`}>{a.label}</p>
              <p className={`text-[10px] ${a.descColor}`}>{a.desc}</p>
            </div>
            <svg className={`w-3.5 h-3.5 ${a.primary ? 'text-white/60' : 'text-lb-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Wallet Snapshot ──────────────────────────────────────────────────────────
function WalletSnapshot({ balance }) {
  const low = balance < 20
  // FIX: vault-model — compute stats from actual session data
  const rows = [
    { label: 'Spent today',      value: `$${todaySpent.toFixed(2)}` },
    { label: 'Spent this week',  value: `$${totalSpent.toFixed(2)}` },
    { label: 'Spent this month', value: `$${totalSpent.toFixed(2)}` },
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
      <div className="mt-3 pt-3 border-t border-lb-border">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="text-[11px] text-lb-muted">Available balance</span>
          <span className={`text-[20px] font-semibold ${low ? 'text-red-600' : 'text-[#26215C]'}`}>
            ${balance.toFixed(2)}
          </span>
        </div>
        {low  && <p className="text-[10px] text-red-500 text-right mb-2">⚠ Balance low — top up to avoid interruptions</p>}
        {!low && <p className="text-[10px] text-lb-subtle text-right mb-3">Ready to use</p>}
        <button className="w-full bg-[#1a1635] hover:bg-[#26215C] text-white text-[13px] font-medium rounded-lg py-2.5 transition-colors">
          ↑ Add funds
        </button>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 bg-lb-border rounded w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-lb-border rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 h-72 bg-lb-border rounded-xl" />
        <div className="h-72 bg-lb-border rounded-xl" />
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Welcome back, {user?.displayName ?? user?.name ?? 'Client'}</p>
          <h1 className="text-lg font-semibold text-lb-ink mt-0.5">Client workspace</h1>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#1a1635] text-white hover:bg-[#26215C] transition-colors">
          + Book session
        </button>
      </div>

      <ClientStats stats={MOCK_STATS} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <RecentSessionsList sessions={MOCK_SESSIONS} />
          <RecentActivity activity={MOCK_ACTIVITY} />
        </div>

        <div className="space-y-4">
          <QuickActions lastSession={LAST_SESSION} />
          <UpcomingSessions sessions={MOCK_UPCOMING} />
          <WalletSnapshot balance={MOCK_STATS.walletAvailable} />
        </div>
      </div>
    </div>
  )
}
