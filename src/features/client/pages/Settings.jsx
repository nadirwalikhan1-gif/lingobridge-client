import React, { useState, useEffect, useCallback, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bell, Globe, CreditCard, FileText, Eye, Monitor, Volume2,
  Shield, AlertTriangle, Check, ChevronRight, Save,
  Loader2, Download, Lock, Smartphone, Languages, Trash2, Clock, User,
  Sun, Moon, X, CheckCircle, AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

// ─── API Functions ──────────────────────────────────────────────────────────
const fetchSettings = async () => {
  const { data } = await api.get('/v1/users/me/settings');
  return data;
};

const updateSettings = async (settings) => {
  const { data } = await api.put('/v1/users/me/settings', settings);
  return data;
};

const exportUserData = async () => {
  const { data } = await api.post('/v1/users/me/export');
  return data;
};

const requestBAA = async () => {
  await api.post('/v1/users/me/baa-request');
};

const deleteAccount = async () => {
  await api.post('/v1/users/me/delete-request');
};

const fetchPaymentMethods = async () => {
  const { data } = await api.get('/v1/users/me/payment-methods');
  return data.methods;
};

const setDefaultPaymentMethod = async (methodId) => {
  await api.put(`/v1/users/me/payment-methods/${methodId}/default`);
};

const removePaymentMethod = async (methodId) => {
  await api.delete(`/v1/users/me/payment-methods/${methodId}`);
};

// ─── Constants ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' }, { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese (Simplified)' }, { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' }, { value: 'pt', label: 'Portuguese' },
  { value: 'ps', label: 'Pashto' }, { value: 'pa', label: 'Punjabi' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($) — United States' },
  { value: 'CAD', label: 'CAD ($) — Canada' },
  { value: 'GBP', label: 'GBP (£) — United Kingdom' },
  { value: 'EUR', label: 'EUR (€) — European Union' },
  { value: 'AUD', label: 'AUD ($) — Australia' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK/EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Vancouver', 'Europe/London', 'Europe/Paris',
  'Asia/Dubai', 'Asia/Tokyo', 'Australia/Sydney', 'Asia/Karachi', 'Asia/Kolkata'
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

function SelectField({ label, value, onChange, options, icon: Icon }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
        {Icon && <Icon size={12} className="text-slate-400" />}
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-violet-400 appearance-none cursor-pointer"
      >
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function ActionRow({ icon: Icon, title, description, action, onClick, danger, disabled }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={16} className={danger ? "text-red-400" : "text-slate-400"} />
        <div className="min-w-0">
          <p className={`text-[13px] font-medium truncate ${danger ? "text-red-500" : "text-slate-900"}`}>{title}</p>
          <p className="text-[11px] text-slate-400">{description}</p>
        </div>
      </div>
      <button 
        onClick={onClick} 
        disabled={disabled}
        className={`text-[12px] font-medium shrink-0 transition-colors ${danger ? "text-red-500 hover:text-red-600" : "text-violet-600 hover:text-violet-700"} disabled:opacity-50`}
      >
        {action}
      </button>
    </div>
  );
}

// ─── Delete Account Modal ─────────────────────────────────────────────────────
function DeleteModal({ isOpen, onClose }) {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success('Account deletion request submitted. Check your email for confirmation.');
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
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl mb-4">
          <AlertTriangle size={20} className="text-red-500 shrink-0" />
          <p className="text-[13px] text-red-600">This action is irreversible. All data will be permanently deleted.</p>
        </div>
        <div className="space-y-3 mb-4">
          <select 
            aria-label="Reason for leaving (optional)"
            value={reason} 
            onChange={e => setReason(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-red-400"
          >
            <option value="">Why are you leaving? (optional)</option>
            <option value="not_needed">No longer need the service</option>
            <option value="too_expensive">Too expensive</option>
            <option value="poor_quality">Quality issues</option>
            <option value="switching">Switching to another service</option>
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
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors disabled:opacity-30 flex items-center gap-2"
          >
            {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {mutation.isPending ? 'Processing...' : 'Request Deletion'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Export Data Modal ──────────────────────────────────────────────────────────
function ExportModal({ isOpen, onClose }) {
  const [format, setFormat] = useState('json');

  const mutation = useMutation({
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
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to export data')
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-slate-900">Export Your Data</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-slate-50 text-slate-400"><X size={18} /></button>
        </div>
        <p className="text-[13px] text-slate-500 mb-4">Download all your personal data, session history, and preferences in GDPR-compliant format.</p>
        <div className="space-y-3 mb-4">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="radio" name="format" value="json" checked={format === 'json'} onChange={() => setFormat('json')} className="text-violet-600" />
            <div>
              <p className="text-[13px] font-medium text-slate-900">JSON Format</p>
              <p className="text-[11px] text-slate-400">Machine-readable, structured data</p>
            </div>
          </label>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
          <button 
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {mutation.isPending ? 'Generating...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Methods Modal ────────────────────────────────────────────────────
function PaymentMethodsModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: methods, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
    enabled: isOpen,
  });

  const defaultMutation = useMutation({
    mutationFn: setDefaultPaymentMethod,
    onError: () => toast.error("Couldn't set default payment method — please try again"),
    onSuccess: () => {
      toast.success('Default payment method updated');
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: removePaymentMethod,
    onError: () => toast.error("Couldn't remove payment method — please try again"),
    onSuccess: () => {
      toast.success('Payment method removed');
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-slate-900">Payment Methods</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-slate-50 text-slate-400"><X size={18} /></button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="text-violet-600 animate-spin" />
          </div>
        ) : !methods?.length ? (
          <div className="text-center py-8">
            <CreditCard size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-[13px] text-slate-400">No payment methods saved</p>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => (
              <div key={method.id} className={`flex items-center justify-between p-3 rounded-xl border ${method.isDefault ? 'bg-violet-50 border-violet-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-white rounded border border-slate-200 flex items-center justify-center">
                    <CreditCard size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-slate-900">{method.type} •••• {method.last4}</p>
                    <p className="text-[11px] text-slate-400">Expires {method.expiry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button 
                      onClick={() => defaultMutation.mutate(method.id)}
                      className="text-[11px] text-violet-600 hover:text-violet-700 font-medium"
                    >
                      Set Default
                    </button>
                  )}
                  <button 
                    onClick={() => removeMutation.mutate(method.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={() => navigate('/wallet')}
          className="w-full mt-4 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard size={14} /> Add New Payment Method
        </button>
      </div>
    </div>
  );
}

// ─── Main Settings Component ────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    language: 'en', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY',
    currency: 'USD', theme: 'light', fontSize: 'medium',
    reduceMotion: false, highContrast: false, screenReader: false,
    defaultSessionType: 'video', defaultDuration: 30,
    autoRecord: true, requireInterpreterCertification: true,
    preferredGender: 'any', billingEmail: '',
    invoiceFormat: 'pdf', autoInvoice: true, paymentMethod: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 30000,
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...savedSettings }));
    }
  }, [savedSettings]);

  const update = (field, value) => setSettings(s => ({ ...s, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save settings')
  });

  const baaMutation = useMutation({
    mutationFn: requestBAA,
    onSuccess: () => toast.success('BAA request submitted. Check your email.'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit BAA request')
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-32 animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[20px] font-bold text-slate-900 mb-1">Settings</h1>
        <p className="text-[13px] text-slate-500">Manage your preferences, compliance, and account defaults</p>
      </div>

      <div className="space-y-6">
        <Section icon={Globe} title="Regional & Language" description="Localization and display preferences">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Interface Language" icon={Languages} value={settings.language} onChange={(e) => update('language', e.target.value)} options={LANGUAGES} />
            <SelectField label="Timezone" icon={Globe} value={settings.timezone} onChange={(e) => update('timezone', e.target.value)} options={TIMEZONES.map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }))} />
            <SelectField label="Date Format" icon={FileText} value={settings.dateFormat} onChange={(e) => update('dateFormat', e.target.value)} options={DATE_FORMATS} />
            <SelectField label="Currency" icon={CreditCard} value={settings.currency} onChange={(e) => update('currency', e.target.value)} options={CURRENCIES} />
          </div>
        </Section>

        <Section icon={Monitor} title="Appearance & Accessibility" description="Make Andiraw work for you">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'light', label: 'Light', icon: Sun },
                { key: 'dark', label: 'Dark', icon: Moon },
                { key: 'system', label: 'System', icon: Monitor }
              ].map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => update('theme', theme.key)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                    settings.theme === theme.key ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <theme.icon size={16} />
                  <span className="text-[13px] font-medium">{theme.label}</span>
                  {settings.theme === theme.key && <Check size={14} className="ml-auto text-violet-600" />}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <Toggle checked={settings.reduceMotion} onChange={(v) => update('reduceMotion', v)} label="Reduce motion" description="Minimize animations and transitions" />
              <Toggle checked={settings.highContrast} onChange={(v) => update('highContrast', v)} label="High contrast mode" description="Increase contrast for better visibility" />
              <Toggle checked={settings.screenReader} onChange={(v) => update('screenReader', v)} label="Screen reader optimization" description="Enhance ARIA labels and navigation" />
            </div>
          </div>
        </Section>

        <Section icon={Smartphone} title="Session Defaults" description="Pre-fill your most common booking preferences">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Default Session Type" icon={Monitor} value={settings.defaultSessionType} onChange={(e) => update('defaultSessionType', e.target.value)} options={[
              { value: 'video', label: 'Video Interpretation' },
              { value: 'audio', label: 'Audio Only' },
              { value: 'inperson', label: 'In-Person' }
            ]} />
            <SelectField label="Default Duration" icon={Clock} value={settings.defaultDuration} onChange={(e) => update('defaultDuration', Number(e.target.value))} options={DURATIONS.map(d => ({ value: d, label: `${d} minutes` }))} />
          </div>
          <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
            <Toggle checked={settings.autoRecord} onChange={(v) => update('autoRecord', v)} label="Auto-record sessions" description="Record all sessions by default (with interpreter consent)" />
            <Toggle checked={settings.requireInterpreterCertification} onChange={(v) => update('requireInterpreterCertification', v)} label="Require certified interpreters only" description="Filter for interpreters with verified credentials (recommended for legal/medical)" />
            <SelectField label="Preferred Interpreter Gender" icon={User} value={settings.preferredGender} onChange={(e) => update('preferredGender', e.target.value)} options={[
              { value: 'any', label: 'No preference' },
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' }
            ]} />
          </div>
        </Section>

        <Section icon={CreditCard} title="Billing & Invoices" description="Payment methods and invoice preferences">
          <div className="space-y-3">
            <ActionRow 
              icon={CreditCard} 
              title="Payment Method" 
              description={settings.paymentMethod ? `Card ending in ${settings.paymentMethod}` : 'No payment method saved'} 
              action="Manage" 
              onClick={() => setShowPaymentModal(true)} 
            />
            <ActionRow 
              icon={FileText} 
              title="Invoice Settings" 
              description={`Format: ${settings.invoiceFormat?.toUpperCase()} · Billing email: ${settings.billingEmail || user?.email || 'Not set'}`} 
              action="Edit" 
              onClick={() => navigate('/wallet/invoices')} 
            />
            <Toggle checked={settings.autoInvoice} onChange={(v) => update('autoInvoice', v)} label="Auto-generate invoices after each session" description="Send invoice PDF to billing email immediately after session completion" />
            <div className="pt-2">
              <button onClick={() => navigate('/wallet/statements')} className="flex items-center gap-2 text-[12px] text-violet-600 hover:text-violet-700 transition-colors">
                <Download size={13} /> Download all statements
              </button>
            </div>
          </div>
        </Section>

        <Section icon={Shield} title="Data Privacy & Compliance" description="Your rights under GDPR, CCPA, and HIPAA">
          <div className="space-y-3">
            <ActionRow icon={Download} title="Export My Data" description="Download all your personal data in GDPR-compliant JSON format" action="Export" onClick={() => setShowExportModal(true)} />
            <ActionRow icon={Lock} title="Data Processing Agreement" description="Review how we process and store your data" action="View" onClick={() => window.open('/legal/dpa', '_blank')} />
            <ActionRow 
              icon={FileText} 
              title="Business Associate Agreement (BAA)" 
              description="Required for HIPAA-covered entities in healthcare" 
              action="Request" 
              onClick={() => baaMutation.mutate()}
              disabled={baaMutation.isPending}
            />
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-700 leading-relaxed">For healthcare clients in the US: enable BAA and set data retention to <strong>Extended (7 years)</strong> in Profile to meet HIPAA requirements.</p>
              </div>
            </div>
          </div>
        </Section>

        <Section icon={Trash2} title="Danger Zone" description="Irreversible account actions" danger>
          <div className="space-y-3">
            <ActionRow icon={Trash2} title="Delete Account" description="Permanently delete your account and all data. This cannot be undone." action="Delete" danger onClick={() => setShowDeleteModal(true)} />
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 mt-8 -mx-6 -mb-6 px-6 py-4 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveMutation.isSuccess && (
            <span className="flex items-center gap-1.5 text-[13px] text-emerald-500">
              <CheckCircle size={14} /> Settings saved
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

      <DeleteModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
      <PaymentMethodsModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </div>
  );
}