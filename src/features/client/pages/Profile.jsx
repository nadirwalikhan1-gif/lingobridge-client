// Profile.jsx — full client profile (light theme, matches dashboard)

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, Briefcase, Globe,
  Bell, Shield, Lock, Eye, Camera, Check, AlertCircle,
  Save, Loader2, FileText, Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const mockProfile = {
  firstName: 'Nadir',
  lastName: 'Wali Khan',
  email: 'nadirwalikhan1@gmail.com',
  phone: '+1 (555) 123-4567',
  avatar: null,
  organization: 'Wali & Associates Legal',
  jobTitle: 'Senior Paralegal',
  industry: 'legal',
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

function Section({ icon: Icon, title, children, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-violet-600" />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-slate-900">{title}</h2>
          {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, children, required, error }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
        {Icon && <Icon size={12} className="text-slate-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all disabled:opacity-40"
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-violet-400 appearance-none cursor-pointer"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-[13px] text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={"relative w-10 h-5 rounded-full transition-colors shrink-0 " + (checked ? "bg-violet-600" : "bg-slate-200")}
      >
        <span className={"absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform " + (checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </label>
  );
}

function CompletenessBar({ profile }) {
  const fields = [profile.firstName, profile.lastName, profile.email, profile.phone, profile.organization, profile.jobTitle, profile.industry, profile.bio];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-slate-900">Profile completeness</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Complete your profile to unlock all features and ensure compliance.</p>
        </div>
        <span className={"text-[20px] font-bold " + (pct >= 80 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-500")}>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={"h-full rounded-full transition-all duration-500 " + (pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: pct + "%" }} />
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className={"w-1.5 h-1.5 rounded-full " + (pct >= 80 ? "bg-emerald-500" : "bg-slate-200")} />
          <span className="text-[11px] text-slate-400">Basic info</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={"w-1.5 h-1.5 rounded-full " + (pct >= 60 ? "bg-emerald-500" : "bg-slate-200")} />
          <span className="text-[11px] text-slate-400">Professional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={"w-1.5 h-1.5 rounded-full " + (pct >= 80 ? "bg-emerald-500" : "bg-slate-200")} />
          <span className="text-[11px] text-slate-400">Preferences</span>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '', lastName: '', email: '', phone: '', avatar: null,
    organization: '', jobTitle: '', industry: '', timezone: 'America/New_York',
    languages: [], bio: '',
  });

  const [notifications, setNotifications] = useState({
    emailBooking: true, emailReminder: true, emailMarketing: false,
    pushSession: true, pushMessage: true, smsUrgent: false,
  });

  const [privacy, setPrivacy] = useState({
    shareHistory: false, allowAnalytics: true, dataRetention: 'standard',
  });

  useEffect(() => {
    const data = mockProfile;
    setProfile({
      firstName: data.firstName || '', lastName: data.lastName || '', email: data.email || '',
      phone: data.phone || '', avatar: data.avatar || null, organization: data.organization || '',
      jobTitle: data.jobTitle || '', industry: data.industry || '', timezone: data.timezone || 'America/New_York',
      languages: data.languages || [], bio: data.bio || '',
    });
  }, []);

  const updateField = (field, value) => {
    setProfile((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => { const c = { ...e }; delete c[field]; return c; });
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
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    setUser((u) => ({ ...u, name: profile.firstName + " " + profile.lastName, firstName: profile.firstName, lastName: profile.lastName, email: profile.email }));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateField('avatar', reader.result);
    reader.readAsDataURL(file);
  };

  const initials = (profile.firstName[0] || '') + (profile.lastName[0] || '');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-slate-900 mb-1">Profile</h1>
        <p className="text-[13px] text-slate-500">Manage your identity, preferences, and compliance settings</p>
      </div>

      <div className="mb-6">
        <CompletenessBar profile={profile} />
      </div>

      <div className="space-y-6">
        <Section icon={User} title="Personal Information" description="Required for account verification and compliance">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center overflow-hidden border-2 border-slate-100">
                {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-[20px] font-bold text-violet-600">{initials || 'U'}</span>}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors shadow-lg">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Field label="First Name" icon={User} required error={errors.firstName}>
                <TextInput value={profile.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="e.g. Nadir" />
              </Field>
              <Field label="Last Name" icon={User} required error={errors.lastName}>
                <TextInput value={profile.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="e.g. Wali Khan" />
              </Field>
              <Field label="Email" icon={Mail} required error={errors.email}>
                <TextInput type="email" value={profile.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@company.com" />
              </Field>
              <Field label="Phone" icon={Phone} required error={errors.phone}>
                <TextInput type="tel" value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
              </Field>
            </div>
          </div>
        </Section>

        <Section icon={Briefcase} title="Professional Details" description="Helps us match you with the right interpreters">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Organization" icon={Building2}>
              <TextInput value={profile.organization} onChange={(e) => updateField('organization', e.target.value)} placeholder="Company or firm name" />
            </Field>
            <Field label="Job Title" icon={Briefcase}>
              <TextInput value={profile.jobTitle} onChange={(e) => updateField('jobTitle', e.target.value)} placeholder="e.g. Senior Paralegal" />
            </Field>
            <Field label="Industry" icon={Globe} required error={errors.industry}>
              <Select value={profile.industry} onChange={(e) => updateField('industry', e.target.value)} options={INDUSTRIES} placeholder="Select industry" />
            </Field>
            <Field label="Timezone" icon={Globe}>
              <Select value={profile.timezone} onChange={(e) => updateField('timezone', e.target.value)} options={TIMEZONES.map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }))} />
            </Field>
          </div>
          <Field label="Bio / Notes for Interpreters" icon={FileText}>
            <textarea
              value={profile.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Brief context interpreters should know..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
            />
          </Field>
        </Section>

        <Section icon={Bell} title="Notifications" description="Control how and when we contact you">
          <div className="space-y-4">
            <div>
              <h4 className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mb-3">Email</h4>
              <div className="space-y-3">
                <Toggle checked={notifications.emailBooking} onChange={(v) => setNotifications((n) => ({ ...n, emailBooking: v }))} label="Booking confirmations & updates" />
                <Toggle checked={notifications.emailReminder} onChange={(v) => setNotifications((n) => ({ ...n, emailReminder: v }))} label="Session reminders (24h & 1h before)" />
                <Toggle checked={notifications.emailMarketing} onChange={(v) => setNotifications((n) => ({ ...n, emailMarketing: v }))} label="Product updates and offers" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mb-3">Push & SMS</h4>
              <div className="space-y-3">
                <Toggle checked={notifications.pushSession} onChange={(v) => setNotifications((n) => ({ ...n, pushSession: v }))} label="Interpreter is joining / session starting" />
                <Toggle checked={notifications.pushMessage} onChange={(v) => setNotifications((n) => ({ ...n, pushMessage: v }))} label="New messages from interpreters" />
                <Toggle checked={notifications.smsUrgent} onChange={(v) => setNotifications((n) => ({ ...n, smsUrgent: v }))} label="Urgent session changes via SMS" />
              </div>
            </div>
          </div>
        </Section>

        <Section icon={Shield} title="Security" description="Protect your account and data">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-slate-400" />
                <div><p className="text-[13px] font-medium text-slate-900">Password</p><p className="text-[11px] text-slate-400">Last changed 3 months ago</p></div>
              </div>
              <button className="text-[12px] font-medium text-violet-600 hover:text-violet-700 transition-colors">Change</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-slate-400" />
                <div><p className="text-[13px] font-medium text-slate-900">Two-Factor Authentication</p><p className="text-[11px] text-slate-400">Add an extra layer of security</p></div>
              </div>
              <button className="text-[12px] font-medium text-violet-600 hover:text-violet-700 transition-colors">Enable</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Eye size={16} className="text-slate-400" />
                <div><p className="text-[13px] font-medium text-slate-900">Active Sessions</p><p className="text-[11px] text-slate-400">1 active device · New York, NY</p></div>
              </div>
              <button className="text-[12px] font-medium text-violet-600 hover:text-violet-700 transition-colors">Manage</button>
            </div>
          </div>
        </Section>

        <Section icon={FileText} title="Data & Privacy" description="Your rights under GDPR, CCPA, and HIPAA">
          <div className="space-y-4">
            <Toggle checked={privacy.shareHistory} onChange={(v) => setPrivacy((p) => ({ ...p, shareHistory: v }))} label="Share session history with my organization" />
            <Toggle checked={privacy.allowAnalytics} onChange={(v) => setPrivacy((p) => ({ ...p, allowAnalytics: v }))} label="Allow usage analytics to improve matching" />
            <div className="pt-2">
              <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Data Retention</label>
              <Select
                value={privacy.dataRetention}
                onChange={(e) => setPrivacy((p) => ({ ...p, dataRetention: e.target.value }))}
                options={[
                  { value: 'minimal', label: 'Minimal (30 days post-session)' },
                  { value: 'standard', label: 'Standard (1 year, default)' },
                  { value: 'extended', label: 'Extended (7 years, legal requirement)' },
                ]}
              />
              <p className="text-[11px] text-slate-400 mt-1.5">Extended retention recommended for legal and healthcare compliance in US/UK markets.</p>
            </div>
            <div className="border-t border-slate-100 pt-4 mt-2">
              <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 text-[12px] text-red-500 hover:text-red-600 transition-colors">
                <Trash2 size={13} /> Request account deletion
              </button>
              <p className="text-[11px] text-slate-400 mt-1">Under GDPR and CCPA, you have the right to request deletion of your personal data.</p>
            </div>
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 mt-8 -mx-6 -mb-6 px-6 py-4 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1.5 text-[13px] text-emerald-500"><Check size={14} /> Profile saved successfully</span>}
          {Object.keys(errors).length > 0 && <span className="flex items-center gap-1.5 text-[13px] text-red-500"><AlertCircle size={14} /> Please fix errors above</span>}
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-[16px] font-bold text-slate-900 mb-2">Delete Account?</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-5">This will permanently delete your account and all associated data. If you are under an active enterprise contract, please contact your admin first.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-xl text-[13px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => { setDeleteConfirm(false); alert('Account deletion request submitted.'); }} className="px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors">Request Deletion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}