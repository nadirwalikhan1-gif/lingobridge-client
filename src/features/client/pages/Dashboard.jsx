import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Video, Phone, ChevronRight, Calendar, Plus, Star,
  Loader2, AlertCircle, Wallet, Clock, TrendingUp,
  MessageSquare, FileText, ArrowRight
} from 'lucide-react'
import { api } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'

// ─── Language Display Helper ────────────────────────────────────────────────
const LANGUAGE_NAMES = {
  'en-us': 'English (US)', 'en-gb': 'English (UK)', 'en-ca': 'English (Canada)',
  'ps-east': 'Pashto (Eastern)', 'ps-west': 'Pashto (Western)',
  'pa-gurmukhi': 'Punjabi (Gurmukhi)', 'pa-shahmukhi': 'Punjabi (Shahmukhi)',
}
const langDisplay = (code) => LANGUAGE_NAMES[code] ?? code

// ─── API Functions ──────────────────────────────────────────────────────────
// Single combined endpoint — replaces 5 separate round trips with 1
const fetchDashboard = async () => {
  return api.get('/v1/dashboard')
}

const rebookSession = async (sessionId) => {
  const { data } = await api.post('/v1/sessions/rebook', { sessionId })
  return data
}

// ─── Star Rating Component ────────────────────────────────────────────────
function StarRating({ rating, size = 'w-3 h-3' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`${size} ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Live Countdown Hook ──────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [label, setLabel] = useState('')
  const [isImminent, setIsImminent] = useState(false)

  useEffect(() => {
    if (!targetDate) return
    function tick() {
      const diff = new Date(targetDate) - Date.now()
      if (diff <= 0) { setLabel('Starting now'); setIsImminent(true); return }
      const totalMins = Math.floor(diff / 60000)
      const hrs = Math.floor(totalMins / 60)
      const mins = totalMins % 60
      setIsImminent(totalMins < 15)
      if (hrs > 0) setLabel(`in ${hrs}h ${mins}m`)
      else if (mins > 0) setLabel(`in ${mins} min`)
      else setLabel('in <1 min')
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [targetDate])

  return { label, isImminent }
}

// ─── Stat Cards ─────────────────────────────────────────────────────────────
function ClientStats({ stats, wallet, navigate }) {
  const lowBalance = wallet?.available < 20

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <div 
        className={`rounded-xl px-6 py-5 flex flex-col justify-between min-h-[110px] cursor-pointer transition-transform hover:scale-[1.02] ${lowBalance ? 'bg-[#7B1F1F]' : 'bg-[#1a1635]'}`}
        onClick={() => navigate('/wallet')}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Wallet balance</p>
          {lowBalance && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-200">Low balance</span>
          )}
        </div>
        <div className="mt-2">
          <p className="text-[42px] font-semibold leading-none text-white tracking-tight">
            ${wallet?.available?.toFixed(2) ?? '0.00'}
          </p>
          <p className={`text-[12px] mt-2 flex items-center gap-1 ${lowBalance ? 'text-red-300' : 'text-[#4ade80]'}`}>
            {lowBalance ? '⚠ Top up before your next session' : <><span className="text-[10px]">✓</span> Available</>}
          </p>
        </div>
      </div>

      <div 
        className="rounded-xl px-4 py-4 bg-[#EEEDFE] flex flex-col justify-between min-h-[110px] cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={() => navigate('/history')}
      >
        <p className="text-[11px] text-[#534AB7] uppercase tracking-widest font-medium">Total sessions</p>
        <div className="mt-2">
          <p className="text-[28px] font-semibold leading-none text-[#26215C]">{stats?.totalSessions ?? 0}</p>
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">↑ {stats?.sessionsTrend ?? '0 this month'}</p>
        </div>
      </div>

      <div 
        className="rounded-xl px-4 py-4 bg-lb-surface border border-lb-border flex flex-col justify-between min-h-[110px] cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={() => navigate('/favourites')}
      >
        <p className="text-[10px] text-lb-muted uppercase tracking-widest font-medium">Favourites</p>
        <div>
          <p className="text-[28px] font-semibold text-lb-ink leading-none">{stats?.favourites ?? 0}</p>
          <p className="text-[11px] mt-1.5 text-[#0F6E56]">{stats?.favouritesTrend ?? '+0 new'}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Upcoming Session Card ────────────────────────────────────────────────────
function UpcomingSessionCard({ session, navigate }) {
  const { label, isImminent } = useCountdown(session.scheduledAt)
  const pairLabel = `${langDisplay(session.fromLang)} → ${langDisplay(session.toLang)}`

  const handleJoin = useCallback(async () => {
    try {
      const { data } = await api.post(`/v1/sessions/${session.id}/join`)
      window.open(data.roomUrl, '_blank')
    } catch (err) {
      toast.error('Failed to join session. Please try again.')
    }
  }, [session.id])

  return (
    <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-colors ${
      isImminent ? 'border-[#1D9E75] bg-[#E1F5EE]' : 'border-lb-border bg-lb-surface'
    }`}>
      <div className="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-semibold text-[#534AB7] shrink-0">
        {session.interpreter?.initials || '??'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-lb-ink truncate">{pairLabel}</p>
        <div className="flex items-center gap-1 mt-0.5 text-lb-muted">
          {session.type === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
          <span className="text-[10px]">{session.interpreter?.name} · {session.duration} min</span>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className="text-[10px] font-medium text-lb-ink">{session.time}</span>
        {isImminent ? (
          <button 
            onClick={handleJoin}
            className="px-2.5 py-1 text-[10px] font-semibold bg-[#1D9E75] text-white rounded-lg animate-pulse hover:bg-[#167a5c] transition-colors"
          >
            Join now
          </button>
        ) : (
          <span className="text-[10px] text-[#7F77DD] font-medium">{label}</span>
        )}
      </div>
    </div>
  )
}

// ─── Recent Sessions ──────────────────────────────────────────────────────────
function RecentSessionsList({ sessions, isLoading, error, navigate }) {
  if (isLoading) return (
    <div className="lb-card p-6 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-7 h-7 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-3/4" />
            <div className="h-2 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  if (error) return (
    <div className="lb-card p-6 text-center">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
      <p className="text-[13px] text-slate-600">No sessions yet</p>
      <button 
        onClick={() => window.location.reload()}
        className="text-[12px] text-violet-600 hover:text-violet-700 mt-2"
      >
        Retry
      </button>
    </div>
  )

  if (!sessions?.length) {
    return (
      <div className="lb-card flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-12 h-12 rounded-full bg-[#EEEDFE] flex items-center justify-center">
          <Video className="w-5 h-5 text-[#7F77DD]" />
        </div>
        <p className="text-[14px] font-medium text-lb-ink">No sessions yet</p>
        <p className="text-[12px] text-lb-muted text-center max-w-[200px]">
          Book your first session and get connected with an interpreter instantly.
        </p>
        <button 
          onClick={() => navigate('/booking')}
          className="mt-1 px-4 py-1.5 text-[12px] font-medium bg-[#7F77DD] text-white rounded-lg hover:bg-[#534AB7] transition-colors"
        >
          Book a session
        </button>
      </div>
    )
  }

  return (
    <div className="lb-card">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[14px] font-medium text-lb-ink">Recent sessions</h3>
        <button 
          onClick={() => navigate('/history')}
          className="text-[12px] text-[#7F77DD] font-medium hover:text-[#534AB7] transition-colors"
        >
          View all
        </button>
      </div>
      <div className="divide-y divide-lb-border">
        {sessions.map((s) => (
          <div 
            key={s.id} 
            className="flex items-center gap-2.5 py-2 cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
            onClick={() => navigate(`/history/${s.id}`)}
          >
            <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[10px] font-semibold text-[#534AB7] shrink-0">
              {s.interpreter?.initials || '??'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium text-lb-ink">
                  {langDisplay(s.fromLang)} → {langDisplay(s.toLang)}
                </span>
                {s.type === 'video' ? <Video className="w-2.5 h-2.5 text-lb-muted" /> : <Phone className="w-2.5 h-2.5 text-lb-muted" />}
              </div>
              <p className="text-[11px] text-lb-muted mt-0.5">
                {s.interpreter?.name} · {s.duration} min · {s.date}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[12px] font-medium text-lb-ink">${s.price?.toFixed(2)}</span>
              <StarRating rating={s.rating} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Recent Activity ──────────────────────────────────────────────────────────
function RecentActivity({ activities, isLoading, navigate }) {
  if (isLoading) return (
    <div className="lb-card p-6">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4 animate-pulse" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
          <div className="w-6 h-6 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-3/4" />
            <div className="h-2 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )

  const iconMap = {
    session: { bg: 'bg-[#EEEDFE]', icon: <Video className="w-3.5 h-3.5 text-[#534AB7]" /> },
    review: { bg: 'bg-[#FFF8E6]', icon: <Star className="w-3.5 h-3.5 text-[#BA7517]" /> },
    wallet: { bg: 'bg-[#E1F5EE]', icon: <TrendingUp className="w-3.5 h-3.5 text-[#0F6E56]" /> },
    message: { bg: 'bg-violet-50', icon: <MessageSquare className="w-3.5 h-3.5 text-violet-600" /> },
  }

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Recent activity</h3>
      {!activities?.length ? (
        <p className="text-[12px] text-lb-muted text-center py-4">No recent activity</p>
      ) : (
        <div className="divide-y divide-lb-border">
          {activities.map((a) => {
            const { bg, icon } = iconMap[a.type] || iconMap.session
            return (
              <div 
                key={a.id} 
                className="flex items-center gap-2.5 py-2 cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                onClick={() => {
                  if (a.link) navigate(a.link)
                  else if (a.type === 'message') navigate('/messages')
                  else if (a.type === 'session') navigate('/history')
                }}
              >
                <div className={`w-6 h-6 rounded-full ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-lb-ink truncate">{a.text}</p>
                  <p className="text-[10px] text-lb-muted mt-0.5">{a.time}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
function QuickActions({ lastSession, navigate }) {
  if (!lastSession) {
    return (
      <div className="lb-card">
        <h3 className="text-[13px] font-medium text-lb-ink mb-3">Quick actions</h3>
        <button 
          onClick={() => navigate('/booking')}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-[#7F77DD] bg-[#7F77DD] hover:bg-[#534AB7] text-white transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-medium">Book your first session</p>
            <p className="text-[10px] text-white/70">Get started with an interpreter</p>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-white/60" />
        </button>
      </div>
    )
  }

  const rebookLabel = `${langDisplay(lastSession.fromLang)} → ${langDisplay(lastSession.toLang)}`

  const actions = [
    {
      label: `Rebook ${lastSession.interpreter?.name?.split(' ')[0] ?? 'interpreter'}`,
      desc: `${rebookLabel} · ${lastSession.duration} min`,
      icon: (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[9px] font-semibold text-[#534AB7]">
          {lastSession.interpreter?.initials || '??'}
        </div>
      ),
      bg: 'bg-[#7F77DD]',
      textColor: 'text-white',
      descColor: 'text-white/70',
      primary: true,
      onClick: () => navigate(`/booking?interpreter=${lastSession.interpreterId}&from=${lastSession.fromLang}&to=${lastSession.toLang}&type=${lastSession.type}`)
    },
    {
      label: 'New session',
      desc: 'Different language or interpreter',
      icon: <Video className="w-4 h-4 text-[#534AB7]" />,
      bg: 'bg-[#EEEDFE]',
      textColor: 'text-lb-ink',
      descColor: 'text-lb-muted',
      onClick: () => navigate('/booking')
    },
    {
      label: 'Schedule later',
      desc: 'Plan and book in advance',
      icon: <Calendar className="w-3.5 h-3.5 text-lb-muted" />,
      bg: 'bg-lb-surface',
      textColor: 'text-lb-ink',
      descColor: 'text-lb-muted',
      onClick: () => navigate('/booking?schedule=true')
    },
  ]

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Quick actions</h3>
      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
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
            <ChevronRight className={`w-3.5 h-3.5 ${a.primary ? 'text-white/60' : 'text-lb-muted'}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Wallet Snapshot ──────────────────────────────────────────────────────────
function WalletSnapshot({ balance, isLoading, navigate }) {
  if (isLoading) return (
    <div className="lb-card p-6 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  )

  const low = balance?.available < 20
  const isNegative = balance?.available < 0

  return (
    <div className="lb-card">
      <h3 className="text-[13px] font-medium text-lb-ink mb-3">Wallet</h3>
      <div className="divide-y divide-lb-border">
        {[
          { label: 'Spent today', value: `$${(balance?.spentToday ?? 0).toFixed(2)}` },
          { label: 'Spent this week', value: `$${(balance?.spentWeek ?? 0).toFixed(2)}` },
          { label: 'Spent this month', value: `$${(balance?.spentMonth ?? 0).toFixed(2)}` },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between py-1.5">
            <span className="text-[12px] text-lb-muted">{r.label}</span>
            <span className="text-[12px] font-medium text-lb-ink">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-lb-border">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="text-[11px] text-lb-muted">Available balance</span>
          <span className={`text-[20px] font-semibold ${isNegative ? 'text-red-600' : low ? 'text-amber-500' : 'text-[#26215C]'}`}>
            ${balance?.available?.toFixed(2) ?? '0.00'}
          </span>
        </div>
        {isNegative && <p className="text-[10px] text-red-500 text-right mb-2">⚠ Balance overdrawn — add funds immediately</p>}
        {low && !isNegative && <p className="text-[10px] text-amber-500 text-right mb-2">⚠ Balance low — top up to avoid interruptions</p>}
        {!low && <p className="text-[10px] text-lb-subtle text-right mb-3">Ready to use</p>}
        <button 
          onClick={() => navigate('/wallet')}
          className="w-full bg-[#1a1635] hover:bg-[#26215C] text-white text-[13px] font-medium rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2"
        >
          <Wallet className="w-4 h-4" /> Add funds
        </button>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Real-time WebSocket for session updates

  // Single combined query — 1 round trip instead of 5
  const { data: dashboard, isLoading, error: dashboardError } = useQuery({
  queryKey: ['dashboard'],
  queryFn: fetchDashboard,
  staleTime: 30000,
})

const stats      = dashboard?.stats
const sessions   = dashboard?.sessions
const upcoming   = dashboard?.upcoming
const activities = dashboard?.activities
const wallet     = dashboard?.wallet
const sessionsError = dashboardError

  if (isLoading && !stats && !sessions) {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="text-xs text-lb-muted">Welcome back, {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'there'}</p>
          <h1 className="text-lg font-semibold text-lb-ink mt-0.5">Client workspace</h1>
        </div>
        <button 
          onClick={() => navigate('/booking')}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#1a1635] text-white hover:bg-[#26215C] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Book session
        </button>
      </div>

      <ClientStats stats={stats} wallet={wallet} navigate={navigate} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <RecentSessionsList 
            sessions={sessions} 
            isLoading={false}
            error={sessionsError}
            navigate={navigate} 
          />
          <RecentActivity 
            activities={activities} 
            isLoading={isLoading}
            navigate={navigate}
          />
        </div>

        <div className="space-y-4">
          <QuickActions lastSession={sessions?.[0]} navigate={navigate} />

          <div className="lb-card">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-[13px] font-medium text-lb-ink">Today's sessions</h3>
              <button 
                onClick={() => navigate('/calendar')}
                className="text-[12px] text-[#7F77DD] font-medium hover:text-[#534AB7] transition-colors"
              >
                Calendar
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !upcoming?.length ? (
              <p className="text-[12px] text-lb-muted text-center py-4">No sessions today</p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcoming.map((s) => (
                  <UpcomingSessionCard key={s.id} session={s} navigate={navigate} />
                ))}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-lb-border">
              <button 
                onClick={() => navigate('/booking')}
                className="w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white text-[12px] font-medium rounded-lg py-1.5 transition-colors"
              >
                + Book new session
              </button>
            </div>
          </div>

          <WalletSnapshot balance={wallet} isLoading={isLoading} navigate={navigate} />
        </div>
      </div>
    </div>
  )
}