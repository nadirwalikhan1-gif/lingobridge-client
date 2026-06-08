// ProfilePage.jsx — full client profile with compliance-ready sections
// Target: 8.5/10 — identity management, GDPR, notification controls

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, Briefcase, Globe,
  Bell, Shield, Lock, Eye, Camera, Check, AlertCircle,
  Save, Loader2, ChevronRight, FileText, Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// ── Mock data — replace with API: GET /api/client/profile ──
const mockProfile = {
  firstName: 'Nadir',
  lastName: 'Wali Khan',
  email: 'nadirwalikhan1@gmail.com',
  phone: '+1 (555) 123-4567',
  avatar: null,
  organization: 'Wali & Associates Legal',
  jobTitle: 'Senior Paralegal',
  industry: 'legal', // legal | healthcare | corporate | government | other
  timezone: 'America/New_York',
  languages: ['English', 'Spanish'],
  bio: 'Managing interpretation services for depositions and client consultations.',
};

const INDUSTRIES = [
  { value: 'legal', label: 'Legal & Law' },
  { value: 'healthcare', label: 'Healthcare & Medical' },
  { value: 'corporate', label: 'Corporate & Business' },
  { value: 'government', label: 'Government & Public' },
  { value: 'education', label: 'Education' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' },
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Tokyo',
];

// ── Section wrapper ──
function Section({ icon: Icon, title, children, description }) {
  return (
    <div className="bg-[#1C1A2E] border border-white/8 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#7F77DD]/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[#7F77DD]" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-[11px] text-white/40 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Input field ──
function Field({ label, icon: Icon, children, required, error }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-medium text-white/70">
        {Icon && <Icon size={12} className="text-white/30" />}
        {label}
        {required && <span className="text-[#E24B4A]">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-[#E24B4A] flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Text input ──
function TextInput({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-[#13111F] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50 focus:ring-1 focus:ring-[#7F77DD]/20 transition-all disabled:opacity-40"
    />
  );
}

// ── Select ──
function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-[#13111F] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50 appearance-none cursor-pointer"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── Toggle switch ──
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-[13px] text-white/70 group-hover:text-white/90 transition-colors">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-[#7F77DD]' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

// ── Profile completeness bar ──
function CompletenessBar({ profile }) {
  const fields = [
    profile.firstName, profile.lastName, profile.email, profile.phone,
    profile.organization, profile.jobTitle, profile.industry, profile.bio,
  ];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);

  return (
    <div className="bg-[#1C1A2E] border border-white/8 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-white">Profile completeness</h3>
          <p className="text-[11px] text-white/40 mt-0.5">
            Complete your profile to unlock all features and ensure compliance.
          </p>
        </div>
        <span className={`text-[20px] font-bold ${pct >= 80 ? 'text-[#1D9E75]' : pct >= 50 ? 'text-[#BA7517]' : 'text-[#E24B4A]'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-[#13111F] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct >= 80 ? 'bg-[#1D9E75]' : pct >= 50 ? 'bg-[#BA7517]' : 'bg-[#E24B4A]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${pct >= 80 ? 'bg-[#1D9E75]' : 'bg-white/20'}`} />
          <span className="text-[11px] text-white/40">Basic info</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${pct >= 60 ? 'bg-[#1D9E75]' : 'bg-white/20'}`} />
          <span className="text-[11px] text-white/40">Professional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${pct >= 80 ? 'bg-[#1D9E75]' : 'bg-white/20'}`} />
          <span className="text-[11px] text-white/40">Preferences</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──
export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: null,
    organization: '',
    jobTitle: '',
    industry: '',
    timezone: 'America/New_York',
    languages: [],
    bio: '',
  });

  const [notifications, setNotifications] = useState({
    emailBooking: true,
    emailReminder: true,
    emailMarketing: false,
    pushSession: true,
    pushMessage: true,
    smsUrgent: false,
  });

  const [privacy, setPrivacy] = {
    shareHistory: false,
    allowAnalytics: true,
    dataRetention: 'standard', // standard | extended | minimal
  };

  // Load profile on mount
  useEffect(() => {
    // Replace with: fetch('/api/client/profile').then(r => r.json())
    const data = mockProfile;
    setProfile({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      avatar: data.avatar || null,
      organization: data.organization || '',
      jobTitle: data.jobTitle || '',
      industry: data.industry || '',
      timezone: data.timezone || 'America/New_York',
      languages: data.languages || [],
      bio: data.bio || '',
    });
  }, []);

  const updateField = (field, value) => {
    setProfile((p) => ({ ...p, [field]: value }));
    if (errors[field]) {
      setErrors((e) => { const copy = { ...e }; delete copy[field]; return copy; });
    }
  };

  const validate = () => {
    const e = {};
    if (!profile.firstName.trim()) e.firstName = 'First name is required';
    if (!profile.lastName.trim()) e.lastName = 'Last name is required';
    if (!profile.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = 'Invalid email';
    if (!profile.phone.trim()) e.phone = 'Phone is required for compliance';
    if (!profile.industry) e.industry = 'Industry is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaved(false);

    // Replace with: await fetch('/api/client/profile', { method: 'PUT', body: JSON.stringify(profile) })
    await new Promise((r) => setTimeout(r, 800));

    // Update auth context so sidebar reflects new name immediately
    setUser((u) => ({
      ...u,
      name: `${profile.firstName} ${profile.lastName}`,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
    }));

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField('avatar', reader.result);
    reader.readAsDataURL(file);
  };

  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-white mb-1">Profile</h1>
        <p className="text-[13px] text-white/40">
          Manage your identity, preferences, and compliance settings
        </p>
      </div>

      {/* Completeness */}
      <div className="mb-6">
        <CompletenessBar profile={profile} />
      </div>

      <div className="space-y-6">
        {/* ── Avatar & Identity ── */}
        <Section icon={User} title="Personal Information" description="Required for account verification and compliance">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-[#7F77DD]/20 flex items-center justify-center overflow-hidden border-2 border-white/10">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[20px] font-bold text-[#A8A3E8]">{initials || 'U'}</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#7F77DD] flex items-center justify-center cursor-pointer hover:bg-[#6B64C4] transition-colors shadow-lg">
                <Camera size={12} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Field label="First Name" icon={User} required error={errors.firstName}>
                <TextInput
                  value={profile.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="e.g. Nadir"
                />
              </Field>
              <Field label="Last Name" icon={User} required error={errors.lastName}>
                <TextInput
                  value={profile.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="e.g. Wali Khan"
                />
              </Field>
              <Field label="Email" icon={Mail} required error={errors.email}>
                <TextInput
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="you@company.com"
                />
              </Field>
              <Field label="Phone" icon={Phone} required error={errors.phone}>
                <TextInput
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* ── Professional ── */}
        <Section icon={Briefcase} title="Professional Details" description="Helps us match you with the right interpreters">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Organization" icon={Building2}>
              <TextInput
                value={profile.organization}
                onChange={(e) => updateField('organization', e.target.value)}
                placeholder="Company or firm name"
              />
            </Field>
            <Field label="Job Title" icon={Briefcase}>
              <TextInput
                value={profile.jobTitle}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                placeholder="e.g. Senior Paralegal"
              />
            </Field>
            <Field label="Industry" icon={Globe} required error={errors.industry}>
              <Select
                value={profile.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                options={INDUSTRIES}
                placeholder="Select industry"
              />
            </Field>
            <Field label="Timezone" icon={Globe}>
              <Select
                value={profile.timezone}
                onChange={(e) => updateField('timezone', e.target.value)}
                options={TIMEZONES.map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }))}
              />
            </Field>
          </div>

          <Field label="Bio / Notes for Interpreters" icon={FileText}>
            <textarea
              value={profile.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Brief context interpreters should know (e.g., preferred formality level, technical terminology)..."
              rows={3}
              className="w-full bg-[#13111F] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50 resize-none"
            />
          </Field>
        </Section>

        {/* ── Notifications ── */}
        <Section icon={Bell} title="Notifications" description="Control how and when we contact you">
          <div className="space-y-4">
            <div>
              <h4 className="text-[12px] font-medium text-white/50 uppercase tracking-wider mb-3">Email</h4>
              <div className="space-y-3">
                <Toggle
                  checked={notifications.emailBooking}
                  onChange={(v) => setNotifications((n) => ({ ...n, emailBooking: v }))}
                  label="Booking confirmations & updates"
                />
                <Toggle
                  checked={notifications.emailReminder}
                  onChange={(v) => setNotifications((n) => ({ ...n, emailReminder: v }))}
                  label="Session reminders (24h & 1h before)"
                />
                <Toggle
                  checked={notifications.emailMarketing}
                  onChange={(v) => setNotifications((n) => ({ ...n, emailMarketing: v }))}
                  label="Product updates and offers"
                />
              </div>
            </div>

            <div className="border-t border-white/8 pt-4">
              <h4 className="text-[12px] font-medium text-white/50 uppercase tracking-wider mb-3">Push & SMS</h4>
              <div className="space-y-3">
                <Toggle
                  checked={notifications.pushSession}
                  onChange={(v) => setNotifications((n) => ({ ...n, pushSession: v }))}
                  label="Interpreter is joining / session starting"
                />
                <Toggle
                  checked={notifications.pushMessage}
                  onChange={(v) => setNotifications((n) => ({ ...n, pushMessage: v }))}
                  label="New messages from interpreters"
                />
                <Toggle
                  checked={notifications.smsUrgent}
                  onChange={(v) => setNotifications((n) => ({ ...n, smsUrgent: v }))}
                  label="Urgent session changes via SMS"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Security ── */}
        <Section icon={Shield} title="Security" description="Protect your account and data">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#13111F] border border-white/5">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-white/40" />
                <div>
                  <p className="text-[13px] font-medium text-white">Password</p>
                  <p className="text-[11px] text-white/40">Last changed 3 months ago</p>
                </div>
              </div>
              <button className="text-[12px] font-medium text-[#7F77DD] hover:text-[#A8A3E8] transition-colors">
                Change
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#13111F] border border-white/5">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-white/40" />
                <div>
                  <p className="text-[13px] font-medium text-white">Two-Factor Authentication</p>
                  <p className="text-[11px] text-white/40">Add an extra layer of security</p>
                </div>
              </div>
              <button className="text-[12px] font-medium text-[#7F77DD] hover:text-[#A8A3E8] transition-colors">
                Enable
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#13111F] border border-white/5">
              <div className="flex items-center gap-3">
                <Eye size={16} className="text-white/40" />
                <div>
                  <p className="text-[13px] font-medium text-white">Active Sessions</p>
                  <p className="text-[11px] text-white/40">1 active device · New York, NY</p>
                </div>
              </div>
              <button className="text-[12px] font-medium text-[#7F77DD] hover:text-[#A8A3E8] transition-colors">
                Manage
              </button>
            </div>
          </div>
        </Section>

        {/* ── Data Privacy (GDPR / HIPAA-adjacent) ── */}
        <Section icon={FileText} title="Data & Privacy" description="Control your data and compliance settings">
          <div className="space-y-4">
            <Toggle
              checked={privacy.shareHistory}
              onChange={(v) => setPrivacy((p) => ({ ...p, shareHistory: v }))}
              label="Share session history with my organization"
            />
            <Toggle
              checked={privacy.allowAnalytics}
              onChange={(v) => setPrivacy((p) => ({ ...p, allowAnalytics: v }))}
              label="Allow usage analytics to improve matching"
            />

            <div className="pt-2">
              <label className="text-[12px] font-medium text-white/70 mb-1.5 block">Data Retention</label>
              <Select
                value={privacy.dataRetention}
                onChange={(e) => setPrivacy((p) => ({ ...p, dataRetention: e.target.value }))}
                options={[
                  { value: 'minimal', label: 'Minimal (30 days post-session)' },
                  { value: 'standard', label: 'Standard (1 year, default)' },
                  { value: 'extended', label: 'Extended (7 years, legal requirement)' },
                ]}
              />
              <p className="text-[11px] text-white/30 mt-1.5">
                Extended retention recommended for legal and healthcare compliance in US/UK markets.
              </p>
            </div>

            <div className="border-t border-white/8 pt-4 mt-2">
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 text-[12px] text-[#E24B4A] hover:text-[#F07070] transition-colors"
              >
                <Trash2 size={13} />
                Request account deletion
              </button>
              <p className="text-[11px] text-white/30 mt-1">
                Under GDPR and CCPA, you have the right to request deletion of your personal data.
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Sticky Save Bar ── */}
      <div className="sticky bottom-0 mt-8 -mx-6 -mb-6 px-6 py-4 bg-[#13111F]/90 backdrop-blur border-t border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-[13px] text-[#1D9E75]">
              <Check size={14} /> Profile saved successfully
            </span>
          )}
          {Object.keys(errors).length > 0 && (
            <span className="flex items-center gap-1.5 text-[13px] text-[#E24B4A]">
              <AlertCircle size={14} /> Please fix errors above
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7F77DD] text-white text-[13px] font-medium hover:bg-[#6B64C4] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* ── Delete Account Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1A2E] border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-[16px] font-semibold text-white mb-2">Delete Account?</h3>
            <p className="text-[13px] text-white/60 leading-relaxed mb-5">
              This will permanently delete your account and all associated data. If you are under an active enterprise contract, please contact your admin first.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-[13px] text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteConfirm(false);
                  // await fetch('/api/client/account', { method: 'DELETE' })
                  alert('Account deletion request submitted.');
                }}
                className="px-4 py-2 rounded-lg bg-[#E24B4A] text-white text-[13px] font-medium hover:bg-[#C43D3D] transition-colors"
              >
                Request Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}