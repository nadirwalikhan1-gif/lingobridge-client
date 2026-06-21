import React, { useState, useEffect, useCallback, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import {
  User, Mail, Phone, Building2, Briefcase, Globe,
  Bell, Shield, Lock, Eye, Camera, Check, AlertCircle,
  Save, Loader2, FileText, Trash2, KeyRound, Smartphone,
  Fingerprint, Download, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/lib/api';

// ─── API Functions ──────────────────────────────────────────────────────────
const fetchProfile = async () => {
  const { data } = await api.get('/v1/users/me/profile');
  return data;
};

const updateProfile = async (profile) => {
  const { data } = await api.put('/v1/users/me/profile', profile);
  return data;
};

const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.post('/v1/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

const changePassword = async ({ currentPassword, newPassword }) => {
  await api.put('/v1/users/me/password', { currentPassword, newPassword });
};

const enableMFA = async () => {
  const { data } = await api.post('/v1/users/me/mfa/enable');
  return data;
};

const verifyMFA = async (code) => {
  await api.post('/v1/users/me/mfa/verify', { code });
};

const disableMFA = async () => {
  await api.delete('/v1/users/me/mfa');
};

const requestAccountDeletion = async () => {
  await api.post('/v1/users/me/delete-request');
};

const exportUserData = async () => {
  const { data } = await api.post('/v1/users/me/export');
  return data;
};

const fetchActiveSessions = async () => {
  const { data } = await api.get('/v1/users/me/sessions');
  return data.sessions;
};

const revokeSession = async (sessionId) => {
  await api.delete(`/v1/users/me/sessions/${sessionId}`);
};

// ─── Constants ────────────────────────────────────────────────────────────────
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
  'Australia/Sydney', 'Asia/Karachi', 'Asia/Kolkata'
];

// ─── Reusable Components ──────────────────────────────────────────────────────
function Section({ icon: Icon, title, children, description, danger }) {
  return (
    <div className={`rounded-2xl overflow-hidden border shadow-sm ${danger ? "bg-white border-red-100" : "bg-white border-slate-200"}`}>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${danger ? "bg-red-50" : "bg-violet-50"}`}>
          <Icon size={16} className={danger ? "text-red-500" : "text-violet-600"} />
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

function Field({ label, icon: Icon, children, required, error, hint }) {
  const fieldId = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
        {Icon && <Icon size={12} className="text-slate-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {React.isValidElement(children) ? React.cloneElement(children, { id: fieldId }) : children}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', disabled, maxLength, id }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all disabled:opacity-40"
    />
  );
}

function Select({ value, onChange, options, placeholder, disabled, id }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-violet-400 appearance-none cursor-pointer disabled:opacity-40"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between cursor-pointer group gap-4">
      <div className="min-w-0">
        <span className="text-[13px] text-slate-600 group-hover:text-slate-800 transition-colors block">{label}</span>
        {description && <span className="text-[11px] text-slate-400 mt-0.5 block">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${checked ? "bg-violet-600" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </label>
  );
}

function CompletenessBar({ profile }) {
  const fields = [
    profile.firstName, profile.lastName, profile.email, profile.phone,
    profile.organization, profile.jobTitle, profile.industry, profile.bio
  ];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-slate-900">Profile completeness</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Complete your profile to unlock all features and ensure compliance.</p>
        </div>
        <span className={`text-[20px] font-bold ${pct >= 80 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-500"}`}>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: pct + "%" }} />
      </div>
      <div className="flex items-center gap-4 mt-3">
        {[
          { label: 'Basic info', threshold: 80 },
          { label: 'Professional', threshold: 60 },
          { label: 'Preferences', threshold: 80 }
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${pct >= item.threshold ? "bg-emerald-500" : "bg-slate-200"}`} />
            <span className="text-[11px] text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Password Change Modal ────────────────────────────────────────────────────
function PasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  });

  const validate = () => {
    const e = {};
    if (!currentPassword) e.currentPassword = 'Current password is required';
    if (!newPassword) e.newPassword = 'New password is required';
    else if (newPassword.length < 8) e.newPassword = 'Must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      e.newPassword = 'Must include uppercase, lowercase, and number';
    }
    if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({ currentPassword, newPassword });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-slate-900">Change Password</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-slate-50 text-slate-400"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <Field label="Current Password" required error={errors.currentPassword}>
            <TextInput type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </Field>
          <Field label="New Password" required error={errors.newPassword}>
            <TextInput type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </Field>
          <Field label="Confirm New Password" required error={errors.confirmPassword}>
            <TextInput type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </Field>
          <button 
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-[14px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MFA Modal ──────────────────────────────────────────────────────────────────
function MFAModal({ isOpen, onClose, mfaEnabled }) {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(mfaEnabled ? 'disable' : 'setup');
  const queryClient = useQueryClient();

  const enableMutation = useMutation({
    mutationFn: enableMFA,
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('verify');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to enable MFA')
  });

  const verifyMutation = useMutation({
    mutationFn: verifyMFA,
    onSuccess: () => {
      toast.success('Two-factor authentication enabled');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid code')
  });

  const disableMutation = useMutation({
    mutationFn: disableMFA,
    onSuccess: () => {
      toast.success('Two-factor authentication disabled');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to disable MFA')
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-slate-900">
            {step === 'disable' ? 'Disable 2FA' : 'Two-Factor Authentication'}
          </h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-slate-50 text-slate-400"><X size={18} /></button>
        </div>

        {step === 'setup' && (
          <div className="text-center">
            <Shield size={48} className="text-violet-600 mx-auto mb-4" />
            <p className="text-[13px] text-slate-600 mb-4">Add an extra layer of security to your account.</p>
            <button 
              onClick={() => enableMutation.mutate()}
              disabled={enableMutation.isPending}
              className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-[14px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {enableMutation.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Set Up 2FA'}
            </button>
          </div>
        )}

        {step === 'verify' && qrCode && (
          <div className="text-center">
            <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-4 w-48 h-48" />
            <p className="text-[12px] text-slate-500 mb-2">Scan with your authenticator app or enter:</p>
            <code className="text-[12px] bg-slate-100 px-2 py-1 rounded mb-4 block">{secret}</code>
            <input 
              type="text" 
              aria-label="6-digit verification code"
              value={code} 
              onChange={e => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-center tracking-widest mb-4 focus:outline-none focus:border-violet-400"
            />
            <button 
              onClick={() => verifyMutation.mutate(code)}
              disabled={verifyMutation.isPending || code.length !== 6}
              className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-[14px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {verifyMutation.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Verify & Enable'}
            </button>
          </div>
        )}

        {step === 'disable' && (
          <div className="text-center">
            <AlertCircle size={48} className="text-amber-500 mx-auto mb-4" />
            <p className="text-[13px] text-slate-600 mb-4">Are you sure? Your account will be less secure.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[14px] font-medium hover:bg-slate-50">Cancel</button>
              <button 
                onClick={() => disableMutation.mutate()}
                disabled={disableMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[14px] font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {disableMutation.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Disable 2FA'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Delete Account Modal ─────────────────────────────────────────────────────
function DeleteModal({ isOpen, onClose }) {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: () => {
      toast.success('Account deletion request submitted. You will receive confirmation via email.');
      navigate('/logout');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit request')
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-red-100 rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-slate-900">Delete Account?</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-slate-50 text-slate-400"><X size={18} /></button>
        </div>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
          This will permanently delete your account and all associated data. If you are under an active enterprise contract, please contact your admin first.
        </p>
        <div className="space-y-3 mb-4">
          <select 
            aria-label="Reason for deleting account (optional)"
            value={reason} 
            onChange={e => setReason(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-violet-400"
          >
            <option value="">Select a reason (optional)</option>
            <option value="not_needed">No longer need the service</option>
            <option value="too_expensive">Too expensive</option>
            <option value="poor_quality">Quality issues</option>
            <option value="other">Other</option>
          </select>
          <input 
            type="text" 
            aria-label="Type DELETE to confirm"
            value={confirmText} 
            onChange={e => setConfirmText(e.target.value)}
            placeholder="Type 'DELETE' to confirm"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-red-400"
          />
        </div>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
          <button 
            onClick={() => mutation.mutate()}
            disabled={confirmText !== 'DELETE' || mutation.isPending}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors disabled:opacity-30"
          >
            {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Request Deletion'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Profile Component ───────────────────────────────────────────────────
export default function Profile() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  // Fetch profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 30000,
  });

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
    if (profileData) {
      setProfile({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        avatar: profileData.avatar || null,
        organization: profileData.organization || '',
        jobTitle: profileData.jobTitle || '',
        industry: profileData.industry || '',
        timezone: profileData.timezone || 'America/New_York',
        languages: profileData.languages || [],
        bio: profileData.bio || '',
      });
      setNotifications(profileData.notifications || notifications);
      setPrivacy(profileData.privacy || privacy);
    }
  }, [profileData]);

  const updateField = (field, value) => {
    setProfile(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(e => { const c = { ...e }; delete c[field]; return c; });
  };

  const validate = () => {
    const e = {};
    if (!profile.firstName.trim()) e.firstName = 'First name is required';
    if (!profile.lastName.trim()) e.lastName = 'Last name is required';
    if (!profile.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = 'Invalid email format';
    if (!profile.phone.trim()) e.phone = 'Phone is required for compliance';
    else if (!/^\+?[\d\s-()]+$/.test(profile.phone)) e.phone = 'Invalid phone format';
    if (!profile.industry) e.industry = 'Industry is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setUser(u => ({ 
        ...u, 
        name: `${profile.firstName} ${profile.lastName}`,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        avatar: profile.avatar
      }));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile saved successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    }
  });

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      updateField('avatar', data.url);
      toast.success('Avatar updated');
    },
    onError: () => toast.error('Failed to upload avatar')
  });

  const exportMutation = useMutation({
    mutationFn: exportUserData,
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Andiraw-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data export downloaded');
    },
    onError: () => toast.error('Failed to export data')
  });

  const handleSave = () => {
    if (!validate()) return;
    saveMutation.mutate({
      ...profile,
      notifications,
      privacy,
      bio: DOMPurify.sanitize(profile.bio)
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    avatarMutation.mutate(file);
  };

  const initials = (profile.firstName[0] || '') + (profile.lastName[0] || '');

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-32 animate-pulse" />
        <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

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
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[20px] font-bold text-violet-600">{initials || 'U'}</span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors shadow-lg">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/*" aria-label="Upload profile photo" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Field label="First Name" icon={User} required error={errors.firstName}>
                <TextInput value={profile.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="e.g. Nadir" />
              </Field>
              <Field label="Last Name" icon={User} required error={errors.lastName}>
                <TextInput value={profile.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="e.g. Wali Khan" />
              </Field>
              <Field label="Email" icon={Mail} required error={errors.email} hint="Changing email requires verification">
                <TextInput type="email" value={profile.email} onChange={e => updateField('email', e.target.value)} placeholder="you@company.com" />
              </Field>
              <Field label="Phone" icon={Phone} required error={errors.phone}>
                <TextInput type="tel" value={profile.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
              </Field>
            </div>
          </div>
        </Section>

        <Section icon={Briefcase} title="Professional Details" description="Helps us match you with the right interpreters">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Organization" icon={Building2}>
              <TextInput value={profile.organization} onChange={e => updateField('organization', e.target.value)} placeholder="Company or firm name" />
            </Field>
            <Field label="Job Title" icon={Briefcase}>
              <TextInput value={profile.jobTitle} onChange={e => updateField('jobTitle', e.target.value)} placeholder="e.g. Senior Paralegal" />
            </Field>
            <Field label="Industry" icon={Globe} required error={errors.industry}>
              <Select value={profile.industry} onChange={e => updateField('industry', e.target.value)} options={INDUSTRIES} placeholder="Select industry" />
            </Field>
            <Field label="Timezone" icon={Globe}>
              <Select value={profile.timezone} onChange={e => updateField('timezone', e.target.value)} options={TIMEZONES.map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }))} />
            </Field>
          </div>
          <Field label="Bio / Notes for Interpreters" icon={FileText} hint="Max 500 characters">
            <textarea
              value={profile.bio}
              onChange={e => updateField('bio', e.target.value.slice(0, 500))}
              placeholder="Brief context interpreters should know..."
              rows={3}
              maxLength={500}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1 text-right">{profile.bio.length}/500</p>
          </Field>
        </Section>

        <Section icon={Bell} title="Notifications" description="Control how and when we contact you">
          <div className="space-y-4">
            <div>
              <h4 className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mb-3">Email</h4>
              <div className="space-y-3">
                <Toggle checked={notifications.emailBooking} onChange={v => setNotifications(n => ({ ...n, emailBooking: v }))} label="Booking confirmations & updates" />
                <Toggle checked={notifications.emailReminder} onChange={v => setNotifications(n => ({ ...n, emailReminder: v }))} label="Session reminders (24h & 1h before)" />
                <Toggle checked={notifications.emailMarketing} onChange={v => setNotifications(n => ({ ...n, emailMarketing: v }))} label="Product updates and offers" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mb-3">Push & SMS</h4>
              <div className="space-y-3">
                <Toggle checked={notifications.pushSession} onChange={v => setNotifications(n => ({ ...n, pushSession: v }))} label="Interpreter is joining / session starting" />
                <Toggle checked={notifications.pushMessage} onChange={v => setNotifications(n => ({ ...n, pushMessage: v }))} label="New messages from interpreters" />
                <Toggle checked={notifications.smsUrgent} onChange={v => setNotifications(n => ({ ...n, smsUrgent: v }))} label="Urgent session changes via SMS" />
              </div>
            </div>
          </div>
        </Section>

        <Section icon={Shield} title="Security" description="Protect your account and data">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-slate-400" />
                <div>
                  <p className="text-[13px] font-medium text-slate-900">Password</p>
                  <p className="text-[11px] text-slate-400">Last changed {profileData?.passwordChangedAt ? new Date(profileData.passwordChangedAt).toLocaleDateString() : '3 months ago'}</p>
                </div>
              </div>
              <button onClick={() => setShowPasswordModal(true)} className="text-[12px] font-medium text-violet-600 hover:text-violet-700 transition-colors">Change</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-slate-400" />
                <div>
                  <p className="text-[13px] font-medium text-slate-900">Two-Factor Authentication</p>
                  <p className="text-[11px] text-slate-400">{profileData?.mfaEnabled ? 'Enabled' : 'Add an extra layer of security'}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMFAModal(true)} 
                className="text-[12px] font-medium text-violet-600 hover:text-violet-700 transition-colors"
              >
                {profileData?.mfaEnabled ? 'Manage' : 'Enable'}
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Eye size={16} className="text-slate-400" />
                <div>
                  <p className="text-[13px] font-medium text-slate-900">Active Sessions</p>
                  <p className="text-[11px] text-slate-400">{profileData?.activeSessions ?? 1} active device(s)</p>
                </div>
              </div>
              <button onClick={() => setShowSessionsModal(true)} className="text-[12px] font-medium text-violet-600 hover:text-violet-700 transition-colors">Manage</button>
            </div>
          </div>
        </Section>

        <Section icon={FileText} title="Data & Privacy" description="Your rights under GDPR, CCPA, and HIPAA">
          <div className="space-y-4">
            <Toggle checked={privacy.shareHistory} onChange={v => setPrivacy(p => ({ ...p, shareHistory: v }))} label="Share session history with my organization" />
            <Toggle checked={privacy.allowAnalytics} onChange={v => setPrivacy(p => ({ ...p, allowAnalytics: v }))} label="Allow usage analytics to improve matching" />
            <div className="pt-2">
              <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Data Retention</label>
              <Select
                value={privacy.dataRetention}
                onChange={e => setPrivacy(p => ({ ...p, dataRetention: e.target.value }))}
                options={[
                  { value: 'minimal', label: 'Minimal (30 days post-session)' },
                  { value: 'standard', label: 'Standard (1 year, default)' },
                  { value: 'extended', label: 'Extended (7 years, legal requirement)' },
                ]}
              />
              <p className="text-[11px] text-slate-400 mt-1.5">Extended retention recommended for legal and healthcare compliance.</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button 
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                className="flex items-center gap-2 text-[12px] text-violet-600 hover:text-violet-700 transition-colors mb-3"
              >
                <Download size={13} /> {exportMutation.isPending ? 'Generating...' : 'Export my data (GDPR)'}
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)} 
                className="flex items-center gap-2 text-[12px] text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={13} /> Request account deletion
              </button>
              <p className="text-[11px] text-slate-400 mt-1">Under GDPR and CCPA, you have the right to request deletion of your personal data.</p>
            </div>
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 mt-8 -mx-6 -mb-6 px-6 py-4 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveMutation.isSuccess && (
            <span className="flex items-center gap-1.5 text-[13px] text-emerald-500">
              <Check size={14} /> Profile saved successfully
            </span>
          )}
          {Object.keys(errors).length > 0 && (
            <span className="flex items-center gap-1.5 text-[13px] text-red-500">
              <AlertCircle size={14} /> Please fix errors above
            </span>
          )}
        </div>
        <button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <PasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      <MFAModal isOpen={showMFAModal} onClose={() => setShowMFAModal(false)} mfaEnabled={profileData?.mfaEnabled} />
      <DeleteModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
    </div>
  );
}
