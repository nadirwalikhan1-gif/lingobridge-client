// Settings.jsx — Interpreter Settings Page
// Socket-driven, no mock data, skeleton → real state

import { useState, useEffect } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import {
  Bell, Shield, Smartphone, Moon, Globe,
  CheckCircle2, AlertCircle, ChevronRight, LogOut
} from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-lb-border rounded ${className}`} />
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, description, checked, onChange, disabled = false }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-lb-ink">{label}</p>
        {description && <p className="text-[11px] text-lb-muted mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#7F77DD] focus:ring-offset-1 ${
          checked ? 'bg-[#7F77DD]' : 'bg-lb-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  )
}

// ── Select row ────────────────────────────────────────────────────────────────
function SelectRow({ label, description, value, options, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-lb-ink">{label}</p>
        {description && <p className="text-[11px] text-lb-muted mt-0.5">{description}</p>}
      </div>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="text-[12px] text-lb-ink bg-lb-surface border border-lb-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#7F77DD] cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── Link row ──────────────────────────────────────────────────────────────────
function LinkRow({ label, description, onClick, destructive = false }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between gap-3 py-3 w-full text-left group"
    >
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-medium ${destructive ? 'text-red-600' : 'text-lb-ink'}`}>{label}</p>
        {description && <p className="text-[11px] text-lb-muted mt-0.5">{description}</p>}
      </div>
      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${destructive ? 'text-red-400' : 'text-lb-subtle'}`} />
    </button>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────
function SettingsSection({ icon: Icon, title, children }) {
  return (
    <div className="lb-card rounded-lb-card px-4 mb-3">
      <div className="flex items-center gap-2 py-3 border-b border-lb-border">
        <div className="w-7 h-7 rounded-lg bg-[#EEEDFE] flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-[#534AB7]" />
        </div>
        <p className="text-[13px] font-semibold text-lb-ink">{title}</p>
      </div>
      <div className="divide-y divide-lb-border/60">
        {children}
      </div>
    </div>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const [settings, setSettings] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user?.id) return

    socket.emit('get-interpreter-settings', { userId: user.id })

    const onSettings = (data) => {
      setSettings(data)
      setLoading(false)
    }

    const onSettingsSaved = (data) => {
      setSaving(false)
      if (data?.ok) {
        setToast({ ok: true, text: 'Settings saved.' })
      } else {
        setToast({ ok: false, text: data?.reason ?? 'Failed to save. Try again.' })
      }
      setTimeout(() => setToast(null), 3000)
    }

    socket.on('interpreter-settings', onSettings)
    socket.on('settings-saved',       onSettingsSaved)

    const t = setTimeout(() => setLoading(false), 5000)

    return () => {
      socket.off('interpreter-settings', onSettings)
      socket.off('settings-saved',       onSettingsSaved)
      clearTimeout(t)
    }
  }, [user?.id])

  // Optimistic update + emit
  function update(path, value) {
    setSettings(prev => {
      const next = { ...prev }
      // Support nested paths like 'notifications.email'
      const keys = path.split('.')
      let ref = next
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...ref[keys[i]] }
        ref = ref[keys[i]]
      }
      ref[keys[keys.length - 1]] = value
      return next
    })

    const socket = getSocket()
    if (socket) {
      setSaving(true)
      socket.emit('update-interpreter-settings', { path, value })
    }
  }

  const s = settings ?? {}
  const notif = s.notifications ?? {}
  const privacy = s.privacy ?? {}
  const app = s.app ?? {}

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-lb-ink">Settings</h1>
        {saving && <p className="text-[11px] text-lb-muted animate-pulse">Saving…</p>}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4 ${
          toast.ok ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
        }`}>
          {toast.ok
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            : <AlertCircle  className="w-4 h-4 text-red-500    shrink-0" />
          }
          <p className={`text-[12px] font-medium ${toast.ok ? 'text-emerald-800' : 'text-red-700'}`}>
            {toast.text}
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="lb-card rounded-lb-card p-4">
              <Skeleton className="h-4 w-40 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Notifications */}
          <SettingsSection icon={Bell} title="Notifications">
            <ToggleRow
              label="New session requests"
              description="Alert when a client requests your availability"
              checked={notif.newRequests ?? true}
              onChange={v => update('notifications.newRequests', v)}
            />
            <ToggleRow
              label="Session reminders"
              description="Reminder 15 minutes before an upcoming session"
              checked={notif.sessionReminders ?? true}
              onChange={v => update('notifications.sessionReminders', v)}
            />
            <ToggleRow
              label="Payout notifications"
              description="When a payout is processed or requires attention"
              checked={notif.payouts ?? true}
              onChange={v => update('notifications.payouts', v)}
            />
            <ToggleRow
              label="New reviews"
              description="When a client leaves you a review"
              checked={notif.reviews ?? true}
              onChange={v => update('notifications.reviews', v)}
            />
            <ToggleRow
              label="Email notifications"
              description="Receive a daily summary by email"
              checked={notif.email ?? false}
              onChange={v => update('notifications.email', v)}
            />
            <ToggleRow
              label="Push notifications"
              description="Browser or mobile push alerts"
              checked={notif.push ?? false}
              onChange={v => update('notifications.push', v)}
            />
          </SettingsSection>

          {/* Privacy */}
          <SettingsSection icon={Shield} title="Privacy">
            <ToggleRow
              label="Show profile to clients"
              description="Clients can view your name and rating before booking"
              checked={privacy.profileVisible ?? true}
              onChange={v => update('privacy.profileVisible', v)}
            />
            <ToggleRow
              label="Show online status"
              description="Display when you are online to clients"
              checked={privacy.showOnlineStatus ?? true}
              onChange={v => update('privacy.showOnlineStatus', v)}
            />
            <ToggleRow
              label="Allow direct messages"
              description="Clients can message you before a session starts"
              checked={privacy.allowMessages ?? false}
              onChange={v => update('privacy.allowMessages', v)}
            />
          </SettingsSection>

          {/* App preferences */}
          <SettingsSection icon={Globe} title="App preferences">
            <SelectRow
              label="Language"
              description="Interface language"
              value={app.language ?? 'en'}
              options={[
                { value: 'en', label: 'English' },
                { value: 'ps', label: 'Pashto' },
                { value: 'fa', label: 'Dari / Farsi' },
                { value: 'ur', label: 'Urdu' },
                { value: 'ar', label: 'Arabic' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
              ]}
              onChange={v => update('app.language', v)}
            />
            <SelectRow
              label="Availability status on login"
              description="What status to set when you open the app"
              value={app.loginStatus ?? 'online'}
              options={[
                { value: 'online',  label: 'Online'  },
                { value: 'offline', label: 'Offline' },
                { value: 'last',    label: 'Same as last session' },
              ]}
              onChange={v => update('app.loginStatus', v)}
            />
          </SettingsSection>

          {/* Account */}
          <SettingsSection icon={Shield} title="Account">
            <LinkRow
              label="Change password"
              description="Update your login credentials"
              onClick={() => {/* navigate to change-password or open modal */}}
            />
            <LinkRow
              label="Two-factor authentication"
              description={s.twoFactor ? 'Enabled' : 'Not enabled — recommended'}
              onClick={() => {/* navigate to 2FA setup */}}
            />
            <LinkRow
              label="Download my data"
              description="Export a copy of your account data"
              onClick={() => {
                const socket = getSocket()
                if (socket) socket.emit('request-data-export', { userId: user?.id })
              }}
            />
            <LinkRow
              label="Sign out"
              onClick={logout}
            />
            <LinkRow
              label="Delete account"
              description="Permanently remove your account and data"
              onClick={() => {/* confirm modal */}}
              destructive
            />
          </SettingsSection>
        </>
      )}
    </div>
  )
}
