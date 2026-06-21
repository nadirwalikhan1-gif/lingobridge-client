// Settings.jsx — Admin platform configuration
// Commission rates, session timeouts, feature flags, notification preferences.

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAdminApi } from '../hooks/useAdminApi'
import { api } from '../../../lib/api'
import ErrorState from '../../../components/ui/ErrorState'

export default function Settings() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => api.get('/v1/admin/settings'),
    staleTime: 30000,
  })

  const [form, setForm] = useState({
    commissionRate: 10,
    sessionTimeoutMinutes: 30,
    requestTimeoutSeconds: 180,
    minTopUpAmount: 5,
    maxSessionDurationMinutes: 120,
    autoAssignEnabled: false,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    maintenanceMode: false,
    ...settings,
  })

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/v1/admin/settings', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      refetch()
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-lb-border rounded w-32 animate-pulse" />
        <div className="h-96 bg-lb-border rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />
  }

  const Section = ({ title, children }) => (
    <div className="lb-card p-4 space-y-3">
      <h3 className="text-[13px] font-medium text-lb-ink">{title}</h3>
      {children}
    </div>
  )

  const Field = ({ label, id, children }) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        {id ? (
          <label htmlFor={id} className="text-[12px] text-lb-ink">{label}</label>
        ) : (
          <p className="text-[12px] text-lb-ink">{label}</p>
        )}
      </div>
      {children}
    </div>
  )

  const NumberInput = ({ field, min, max, suffix }) => (
    <div className="flex items-center gap-2">
      <input
        id={field}
        type="number"
        min={min}
        max={max}
        value={form[field]}
        onChange={e => handleChange(field, Number(e.target.value))}
        className="w-20 text-[11px] border border-lb-border rounded px-2 py-1.5 bg-white text-lb-ink text-right focus:outline-none focus:border-[#7F77DD]"
      />
      {suffix && <span className="text-[11px] text-lb-muted">{suffix}</span>}
    </div>
  )

  const Toggle = ({ field, label }) => (
    <button
      onClick={() => handleChange(field, !form[field])}
      role="switch"
      aria-checked={form[field]}
      aria-label={label}
      className={`relative w-9 h-5 rounded-full transition-colors ${
        form[field] ? 'bg-[#7F77DD]' : 'bg-lb-border'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
        form[field] ? 'translate-x-4' : 'translate-x-0'
      }`} />
    </button>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div>
          <p className="lb-page-eyebrow">Platform configuration</p>
          <h1 className="lb-page-title mt-0.5">Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-[11px] text-[#0F6E56] font-medium">Saved successfully</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-[12px] font-medium bg-[#7F77DD] text-white hover:bg-[#534AB7] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Section title="Financial">
          <Field label="Platform commission" id="commissionRate">
            <NumberInput field="commissionRate" min={0} max={50} suffix="%" />
          </Field>
          <Field label="Minimum top-up amount" id="minTopUpAmount">
            <NumberInput field="minTopUpAmount" min={1} max={100} suffix="USD" />
          </Field>
        </Section>

        <Section title="Session Rules">
          <Field label="Session timeout" id="sessionTimeoutMinutes">
            <NumberInput field="sessionTimeoutMinutes" min={5} max={120} suffix="min" />
          </Field>
          <Field label="Request timeout" id="requestTimeoutSeconds">
            <NumberInput field="requestTimeoutSeconds" min={30} max={600} suffix="sec" />
          </Field>
          <Field label="Max session duration" id="maxSessionDurationMinutes">
            <NumberInput field="maxSessionDurationMinutes" min={10} max={300} suffix="min" />
          </Field>
        </Section>

        <Section title="Automation">
          <Field label="Auto-assign requests">
            <Toggle field="autoAssignEnabled" label="Auto-assign requests" />
          </Field>
        </Section>

        <Section title="Notifications">
          <Field label="Email notifications">
            <Toggle field="emailNotificationsEnabled" label="Email notifications" />
          </Field>
          <Field label="SMS notifications">
            <Toggle field="smsNotificationsEnabled" label="SMS notifications" />
          </Field>
        </Section>

        <Section title="System">
          <Field label="Maintenance mode">
            <Toggle field="maintenanceMode" label="Maintenance mode" />
          </Field>
          {form.maintenanceMode && (
            <p className="text-[10px] text-[#A32D2D] bg-[#FCEBEB]/50 p-2 rounded">
              Warning: Maintenance mode will prevent new bookings and show a maintenance page to all users.
            </p>
          )}
        </Section>
      </div>
    </div>
  )
}
