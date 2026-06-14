// Profile.jsx — Interpreter Profile Page
// Socket + REST driven, no mock data, skeleton → empty state

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { getSocket } from '../../../lib/socket'
import {
  User, Camera, Globe, Phone, Mail, MapPin, Star,
  BookOpen, Languages, Clock, CheckCircle2, AlertCircle,
  Edit3, Save, X
} from 'lucide-react'

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?'
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-lb-border rounded ${className}`} />
}

function Field({ label, value, editing, name, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-lb-subtle uppercase tracking-wider mb-1">{label}</p>
      {editing ? (
        <input
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder || label}
          className="w-full px-3 py-2 text-[13px] text-lb-ink bg-lb-surface border border-lb-border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7F77DD] focus:border-[#7F77DD]"
        />
      ) : (
        <p className="text-[13px] text-lb-ink">{value || <span className="text-lb-subtle">Not set</span>}</p>
      )}
    </div>
  )
}

function TextAreaField({ label, value, editing, name, onChange, placeholder = '' }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-lb-subtle uppercase tracking-wider mb-1">{label}</p>
      {editing ? (
        <textarea
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder || label}
          rows={3}
          className="w-full px-3 py-2 text-[13px] text-lb-ink bg-lb-surface border border-lb-border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7F77DD] focus:border-[#7F77DD] resize-none"
        />
      ) : (
        <p className="text-[13px] text-lb-ink leading-relaxed">
          {value || <span className="text-lb-subtle">Not set</span>}
        </p>
      )}
    </div>
  )
}

function Section({ title, children, onEdit, editing, onSave, onCancel, saving }) {
  return (
    <div className="lb-card rounded-lb-card p-4 mb-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] font-semibold text-lb-ink">{title}</p>
        {onEdit && !editing && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[11px] font-medium text-[#534AB7] hover:text-[#26215C] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 text-[11px] font-medium text-lb-muted hover:text-lb-ink transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1 text-[11px] font-medium text-white bg-[#7F77DD] px-2.5 py-1 rounded-lg hover:bg-[#534AB7] disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [toast,    setToast]    = useState(null)   // { ok, text }

  // Section edit states
  const [editingPersonal,  setEditingPersonal]  = useState(false)
  const [editingProfessional, setEditingProfessional] = useState(false)
  const [savingPersonal,   setSavingPersonal]   = useState(false)
  const [savingProfessional, setSavingProfessional] = useState(false)

  // Draft copies for editing
  const [draftPersonal,     setDraftPersonal]     = useState({})
  const [draftProfessional, setDraftProfessional] = useState({})

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user?.id) return

    socket.emit('get-interpreter-profile', { userId: user.id })

    const onProfile = (data) => {
      setProfile(data)
      setLoading(false)
    }

    const onProfileSaved = (data) => {
      if (data?.ok) {
        setProfile(prev => ({ ...prev, ...data.profile }))
        setToast({ ok: true, text: 'Profile updated successfully.' })
        setEditingPersonal(false)
        setEditingProfessional(false)
      } else {
        setToast({ ok: false, text: data?.reason ?? 'Failed to save. Try again.' })
      }
      setSavingPersonal(false)
      setSavingProfessional(false)
      setTimeout(() => setToast(null), 4000)
    }

    socket.on('interpreter-profile', onProfile)
    socket.on('profile-saved',       onProfileSaved)

    const t = setTimeout(() => setLoading(false), 5000)

    return () => {
      socket.off('interpreter-profile', onProfile)
      socket.off('profile-saved',       onProfileSaved)
      clearTimeout(t)
    }
  }, [user?.id])

  function startEditPersonal() {
    setDraftPersonal({
      firstName:   profile?.firstName   ?? user?.user_metadata?.firstName ?? '',
      lastName:    profile?.lastName    ?? user?.user_metadata?.lastName  ?? '',
      email:       profile?.email       ?? user?.email ?? '',
      phone:       profile?.phone       ?? '',
      location:    profile?.location    ?? '',
      timezone:    profile?.timezone    ?? '',
    })
    setEditingPersonal(true)
  }

  function startEditProfessional() {
    setDraftProfessional({
      bio:          profile?.bio          ?? '',
      languages:    profile?.languages    ?? '',
      specialties:  profile?.specialties  ?? '',
      certifications: profile?.certifications ?? '',
      yearsExp:     profile?.yearsExp     ?? '',
    })
    setEditingProfessional(true)
  }

  function savePersonal() {
    const socket = getSocket()
    if (!socket) return
    setSavingPersonal(true)
    socket.emit('update-interpreter-profile', { section: 'personal', data: draftPersonal })
  }

  function saveProfessional() {
    const socket = getSocket()
    if (!socket) return
    setSavingProfessional(true)
    socket.emit('update-interpreter-profile', { section: 'professional', data: draftProfessional })
  }

  function handlePersonalChange(e) {
    setDraftPersonal(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleProfessionalChange(e) {
    setDraftProfessional(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const name = profile
    ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
    : `${user?.user_metadata?.firstName ?? ''} ${user?.user_metadata?.lastName ?? ''}`.trim() || user?.email

  const initials = getInitials(name || user?.email || '')
  const avgRating  = profile?.avgRating  ?? null
  const totalSessions = profile?.totalSessions ?? null
  const verified   = profile?.verified   ?? false

  return (
    <div className="max-w-2xl mx-auto">

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

      {/* Hero card */}
      <div className="lb-card rounded-lb-card p-5 mb-3 bg-[#26215C] text-white">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-[22px] font-semibold text-white">
              {loading ? '' : initials}
            </div>
            {verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#26215C] flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {loading ? (
              <>
                <Skeleton className="h-5 w-36 bg-white/20 mb-2" />
                <Skeleton className="h-3 w-24 bg-white/10" />
              </>
            ) : (
              <>
                <p className="text-[18px] font-semibold text-white leading-tight">{name || '—'}</p>
                <p className="text-[12px] text-white/60 mt-0.5">{profile?.email ?? user?.email ?? '—'}</p>
                {verified && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> Verified interpreter
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick stats */}
        {!loading && (avgRating !== null || totalSessions !== null) && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-[18px] font-semibold text-white">
                {avgRating != null ? avgRating.toFixed(1) : '—'}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">Avg rating</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-semibold text-white">
                {totalSessions ?? '—'}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-semibold text-white">
                {profile?.acceptanceRate != null ? `${profile.acceptanceRate}%` : '—'}
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">Acceptance</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="lb-card rounded-lb-card p-4">
              <Skeleton className="h-4 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Personal info */}
          <Section
            title="Personal information"
            onEdit={startEditPersonal}
            editing={editingPersonal}
            onSave={savePersonal}
            onCancel={() => setEditingPersonal(false)}
            saving={savingPersonal}
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" name="firstName" value={editingPersonal ? draftPersonal.firstName : profile?.firstName} editing={editingPersonal} onChange={handlePersonalChange} />
              <Field label="Last name"  name="lastName"  value={editingPersonal ? draftPersonal.lastName  : profile?.lastName}  editing={editingPersonal} onChange={handlePersonalChange} />
            </div>
            <Field label="Email"    name="email"    value={editingPersonal ? draftPersonal.email    : (profile?.email ?? user?.email)} editing={editingPersonal} onChange={handlePersonalChange} type="email" />
            <Field label="Phone"    name="phone"    value={editingPersonal ? draftPersonal.phone    : profile?.phone}    editing={editingPersonal} onChange={handlePersonalChange} type="tel" placeholder="+1 (555) 000-0000" />
            <Field label="Location" name="location" value={editingPersonal ? draftPersonal.location : profile?.location} editing={editingPersonal} onChange={handlePersonalChange} placeholder="City, Country" />
            <Field label="Timezone" name="timezone" value={editingPersonal ? draftPersonal.timezone : profile?.timezone} editing={editingPersonal} onChange={handlePersonalChange} placeholder="e.g. America/New_York" />
          </Section>

          {/* Professional info */}
          <Section
            title="Professional details"
            onEdit={startEditProfessional}
            editing={editingProfessional}
            onSave={saveProfessional}
            onCancel={() => setEditingProfessional(false)}
            saving={savingProfessional}
          >
            <TextAreaField label="Bio" name="bio" value={editingProfessional ? draftProfessional.bio : profile?.bio} editing={editingProfessional} onChange={handleProfessionalChange} placeholder="Tell clients about yourself…" />
            <Field label="Languages" name="languages" value={editingProfessional ? draftProfessional.languages : profile?.languages} editing={editingProfessional} onChange={handleProfessionalChange} placeholder="e.g. English, Pashto, Dari" />
            <Field label="Specialties" name="specialties" value={editingProfessional ? draftProfessional.specialties : profile?.specialties} editing={editingProfessional} onChange={handleProfessionalChange} placeholder="e.g. Medical, Legal, Business" />
            <Field label="Certifications" name="certifications" value={editingProfessional ? draftProfessional.certifications : profile?.certifications} editing={editingProfessional} onChange={handleProfessionalChange} placeholder="e.g. ATA Certified, NAATI" />
            <Field label="Years of experience" name="yearsExp" value={editingProfessional ? draftProfessional.yearsExp : profile?.yearsExp} editing={editingProfessional} onChange={handleProfessionalChange} type="number" placeholder="0" />
          </Section>
        </>
      )}
    </div>
  )
}
