// Availability.jsx — full production page
// Manages working hours, quick status, vacation mode, and availability insights

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'

// ── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DEFAULT_SCHEDULE = DAYS.map((day) => ({
  day,
  available: day !== 'Sat' && day !== 'Sun',
  start: '09:00',
  end: '17:00',
}))

const TIME_OPTIONS = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hh  = String(h).padStart(2, '0')
    const mm  = String(m).padStart(2, '0')
    const val = `${hh}:${mm}`
    const ampm = h < 12 ? 'AM' : 'PM'
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
    TIME_OPTIONS.push({ value: val, label: `${displayH}:${mm} ${ampm}` })
  }
}

const STATUS = {
  ONLINE:  'online',
  BREAK:   'break',
  OFFLINE: 'offline',
}

const STATUS_CONFIG = {
  online:  { dot: '#1D9E75', label: 'Online',   sub: 'Visible to clients',        bg: 'bg-[#E1F5EE]', text: 'text-[#0F6E56]',  border: 'border-[#1D9E75]' },
  break:   { dot: '#BA7517', label: 'On Break',  sub: 'Paused — no new calls',     bg: 'bg-[#FAEEDA]', text: 'text-[#854F0B]',  border: 'border-[#BA7517]' },
  offline: { dot: '#9CA3AF', label: 'Offline',   sub: 'Hidden from clients',       bg: 'bg-lb-surface', text: 'text-lb-muted',  border: 'border-lb-border' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt24to12(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const ampm   = h < 12 ? 'AM' : 'PM'
  const dispH  = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${dispH}:${String(m).padStart(2, '0')} ${ampm}`
}

function hoursFromSlot(start, end) {
  if (!start || !end) return 0
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60)
}

function totalWeeklyHours(schedule) {
  return schedule
    .filter((s) => s.available)
    .reduce((sum, s) => sum + hoursFromSlot(s.start, s.end), 0)
}

function activeDays(schedule) {
  return schedule.filter((s) => s.available).length
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-lb-border rounded w-32" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="lb-card h-20" />
        ))}
      </div>
      <div className="lb-card h-64" />
      <div className="lb-card h-32" />
    </div>
  )
}

function OverviewCard({ label, value, sub, color = 'text-lb-ink', icon }) {
  return (
    <div className="lb-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-lb-muted uppercase tracking-widest font-medium">{label}</p>
        {icon}
      </div>
      <p className={`text-[26px] font-semibold leading-none ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-[11px] text-lb-subtle">{sub}</p>}
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F77DD] focus:ring-offset-1 ${
        checked ? 'bg-[#7F77DD]' : 'bg-lb-border'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function TimeSelect({ value, onChange, disabled, label }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="text-[11px] text-lb-ink bg-lb-surface border border-lb-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#7F77DD] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {TIME_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function DayRow({ slot, onChange }) {
  const cfg = slot.available
    ? 'border-[#CECBF6] bg-[#EEEDFE]/40'
    : 'border-lb-border bg-white'

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${cfg}`}>
      {/* Day label */}
      <div className="w-8 shrink-0">
        <p className={`text-[12px] font-semibold ${slot.available ? 'text-[#534AB7]' : 'text-lb-muted'}`}>
          {slot.day}
        </p>
      </div>

      {/* Toggle */}
      <Toggle
        checked={slot.available}
        onChange={() => onChange({ ...slot, available: !slot.available })}
        label={`Available on ${slot.day}`}
      />

      {/* Time range */}
      {slot.available ? (
        <div className="flex items-center gap-2 flex-1">
          <TimeSelect
            value={slot.start}
            onChange={(v) => onChange({ ...slot, start: v })}
            label={`${slot.day} start time`}
          />
          <span className="text-[11px] text-lb-subtle">to</span>
          <TimeSelect
            value={slot.end}
            onChange={(v) => onChange({ ...slot, end: v })}
            label={`${slot.day} end time`}
          />
          <span className="text-[11px] text-lb-subtle ml-1">
            ({hoursFromSlot(slot.start, slot.end).toFixed(1)}h)
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-lb-subtle flex-1">Not available</p>
      )}
    </div>
  )
}

function InsightRow({ icon, text, color = 'text-lb-muted' }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`shrink-0 mt-0.5 ${color}`}>{icon}</span>
      <p className={`text-[12px] leading-relaxed ${color}`}>{text}</p>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Availability() {
  const { user } = useAuth()

  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [savedAt,       setSavedAt]       = useState(null)
  const [status,        setStatus]        = useState(STATUS.ONLINE)
  const [schedule,      setSchedule]      = useState(DEFAULT_SCHEDULE)
  const [overview,      setOverview]      = useState(null)   // { hoursThisWeek, upcomingSessions, acceptanceRate, utilizationPct }
  const [vacationMode,  setVacationMode]  = useState(false)
  const [vacationStart, setVacationStart] = useState('')
  const [vacationEnd,   setVacationEnd]   = useState('')
  const [vacationSaved, setVacationSaved] = useState(false)

  // ── Fetch schedule + overview from API ─────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return

    fetch('/api/interpreter/schedule', {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.schedule) && data.schedule.length) {
          setSchedule(data.schedule)
        }
        if (data.status) setStatus(data.status)
        if (data.overview) setOverview(data.overview)
        if (data.vacationMode != null) setVacationMode(data.vacationMode)
        if (data.vacationStart) setVacationStart(data.vacationStart)
        if (data.vacationEnd)   setVacationEnd(data.vacationEnd)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user?.id])

  // ── Socket: real-time status sync ──────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onStatusUpdate = (data) => {
      if (data.userId && data.userId !== user?.id) return
      if (data.status) setStatus(data.status)
    }

    socket.on('status-update', onStatusUpdate)
    return () => socket.off('status-update', onStatusUpdate)
  }, [user?.id])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStatusChange = useCallback((next) => {
    setStatus(next)
    const socket = getSocket()
    if (socket) {
      if (next === STATUS.ONLINE)  socket.emit('register',    { role: 'interpreter' })
      if (next === STATUS.BREAK)   socket.emit('go-on-break', { role: 'interpreter' })
      if (next === STATUS.OFFLINE) socket.emit('go-offline',  { role: 'interpreter' })
    }
    fetch('/api/interpreter/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    }).catch(() => {})
  }, [])

  const handleDayChange = useCallback((updated) => {
    setSchedule((prev) => prev.map((s) => s.day === updated.day ? updated : s))
  }, [])

  const handleSaveSchedule = useCallback(async () => {
    setSaving(true)
    try {
      await fetch('/api/interpreter/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      })
      setSavedAt(new Date())
    } catch (_) {
      // silent — user can retry
    } finally {
      setSaving(false)
    }
  }, [schedule])

  const handleSaveVacation = useCallback(async () => {
    if (!vacationStart || !vacationEnd) return
    try {
      await fetch('/api/interpreter/vacation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacationMode, vacationStart, vacationEnd }),
      })
      setVacationSaved(true)
      setTimeout(() => setVacationSaved(false), 3000)
    } catch (_) {}
  }, [vacationMode, vacationStart, vacationEnd])

  // ── Derived stats ───────────────────────────────────────────────────────────
  const weeklyHours    = totalWeeklyHours(schedule)
  const activeCount    = activeDays(schedule)
  const statusCfg      = STATUS_CONFIG[status] || STATUS_CONFIG.offline

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-4 max-w-3xl">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-semibold text-lb-ink">Availability</h1>
        <p className="text-[13px] text-lb-muted mt-0.5">Manage your working hours and online status</p>
      </div>

      {/* ── Overview cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <OverviewCard
          label="Hours this week"
          value={overview?.hoursThisWeek != null ? `${overview.hoursThisWeek}h` : `${weeklyHours}h`}
          sub={`${activeCount} active days`}
          color="text-[#26215C]"
          icon={
            <svg className="w-4 h-4 text-[#7F77DD]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
            </svg>
          }
        />
        <OverviewCard
          label="Upcoming sessions"
          value={overview?.upcomingSessions ?? '—'}
          sub="Confirmed bookings"
          color="text-[#0F6E56]"
          icon={
            <svg className="w-4 h-4 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          }
        />
        <OverviewCard
          label="Acceptance rate"
          value={overview?.acceptanceRate != null ? `${overview.acceptanceRate}%` : '—'}
          sub="Last 30 days"
          color={overview?.acceptanceRate >= 85 ? 'text-[#0F6E56]' : 'text-[#854F0B]'}
          icon={
            <svg className="w-4 h-4 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          }
        />
        <OverviewCard
          label="Utilization"
          value={overview?.utilizationPct != null ? `${overview.utilizationPct}%` : '—'}
          sub="Booked vs available"
          color="text-lb-ink"
          icon={
            <svg className="w-4 h-4 text-lb-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M3 3v18h18M7 16v-4M12 16V8M17 16v-7"/>
            </svg>
          }
        />
      </div>

      {/* ── Quick status controls ─────────────────────────────────────────────── */}
      <div className="lb-card">
        <h3 className="text-[13px] font-medium text-lb-ink mb-3">Current status</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(STATUS).map((s) => {
            const cfg     = STATUS_CONFIG[s]
            const active  = status === s
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all ${
                  active
                    ? `${cfg.bg} ${cfg.border}`
                    : 'bg-white border-lb-border hover:bg-lb-surface'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${active ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: cfg.dot }}
                />
                <span className={`text-[12px] font-semibold ${active ? cfg.text : 'text-lb-muted'}`}>
                  {cfg.label}
                </span>
                <span className={`text-[10px] text-center leading-tight ${active ? cfg.text : 'text-lb-subtle'}`}>
                  {cfg.sub}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Weekly scheduler ──────────────────────────────────────────────────── */}
      <div className="lb-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[13px] font-medium text-lb-ink">Weekly schedule</h3>
            <p className="text-[11px] text-lb-muted mt-0.5">
              {weeklyHours.toFixed(1)} hours across {activeCount} days
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savedAt && (
              <span className="text-[11px] text-[#0F6E56] flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="text-[12px] font-medium px-4 py-2 rounded-xl bg-[#7F77DD] text-white hover:bg-[#534AB7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : 'Save schedule'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {schedule.map((slot) => (
            <DayRow key={slot.day} slot={slot} onChange={handleDayChange} />
          ))}
        </div>

        {/* Weekly summary bar */}
        <div className="mt-4 pt-4 border-t border-lb-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-lb-muted">Weekly coverage</span>
            <span className="text-[11px] font-medium text-lb-ink">{activeCount}/7 days</span>
          </div>
          <div className="flex gap-1">
            {schedule.map((s) => (
              <div
                key={s.day}
                title={s.available ? `${s.day}: ${fmt24to12(s.start)} – ${fmt24to12(s.end)}` : `${s.day}: Off`}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s.available ? 'bg-[#7F77DD]' : 'bg-lb-border'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {schedule.map((s) => (
              <span key={s.day} className="flex-1 text-center text-[9px] text-lb-subtle">{s.day}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Availability insights ─────────────────────────────────────────────── */}
      <div className="lb-card">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-[#534AB7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 className="text-[13px] font-medium text-lb-ink">Availability insights</h3>
        </div>
        <div className="space-y-3">
          {weeklyHours < 20 ? (
            <InsightRow
              color="text-[#854F0B]"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              }
              text={`Your schedule shows ${weeklyHours.toFixed(1)} available hours this week. Interpreters with 20+ hours receive significantly more booking requests.`}
            />
          ) : (
            <InsightRow
              color="text-[#0F6E56]"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
              text={`${weeklyHours.toFixed(1)} hours scheduled this week — good coverage. Maintaining consistent availability builds client trust and repeat bookings.`}
            />
          )}
          {!schedule.find((s) => s.day === 'Sat' && s.available) && (
            <InsightRow
              color="text-[#534AB7]"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              }
              text="Saturday demand is high on this platform. Enabling even a 4-hour Saturday slot can increase your weekly earnings by 15–25%."
            />
          )}
          {overview?.acceptanceRate != null && overview.acceptanceRate < 85 && (
            <InsightRow
              color="text-[#A32D2D]"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              }
              text={`Your acceptance rate is ${overview.acceptanceRate}%, below the 85% minimum. Missing requests during scheduled hours may cause your profile to be deprioritised.`}
            />
          )}
        </div>
      </div>

      {/* ── Vacation mode ─────────────────────────────────────────────────────── */}
      <div className="lb-card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-[13px] font-medium text-lb-ink">Vacation mode</h3>
            <p className="text-[11px] text-lb-muted mt-0.5">Pause all bookings for a date range</p>
          </div>
          <Toggle checked={vacationMode} onChange={() => setVacationMode((v) => !v)} label="Vacation mode" />
        </div>

        {vacationMode && (
          <div className="space-y-3 pt-3 border-t border-lb-border">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="vacation-start" className="text-[11px] text-lb-muted font-medium block mb-1.5">Start date</label>
                <input
                  id="vacation-start"
                  type="date"
                  value={vacationStart}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setVacationStart(e.target.value)}
                  className="w-full text-[12px] text-lb-ink bg-lb-surface border border-lb-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#7F77DD]"
                />
              </div>
              <div>
                <label htmlFor="vacation-end" className="text-[11px] text-lb-muted font-medium block mb-1.5">End date</label>
                <input
                  id="vacation-end"
                  type="date"
                  value={vacationEnd}
                  min={vacationStart || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setVacationEnd(e.target.value)}
                  className="w-full text-[12px] text-lb-ink bg-lb-surface border border-lb-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#7F77DD]"
                />
              </div>
            </div>

            {vacationStart && vacationEnd && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#FAEEDA] border border-[#F5D0A9]">
                <svg className="w-3.5 h-3.5 text-[#854F0B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-[11px] text-[#854F0B]">
                  Bookings will be paused from <strong>{vacationStart}</strong> to <strong>{vacationEnd}</strong>. Existing confirmed sessions are not affected.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              {vacationSaved && (
                <span className="text-[11px] text-[#0F6E56] flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  Saved
                </span>
              )}
              <button
                onClick={handleSaveVacation}
                disabled={!vacationStart || !vacationEnd}
                className="ml-auto text-[12px] font-medium px-4 py-2 rounded-xl bg-[#7F77DD] text-white hover:bg-[#534AB7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save vacation dates
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
