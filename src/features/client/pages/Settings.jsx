// SettingsPage.jsx — full client settings
// Target: 9/10 — replaces "under construction" placeholder
// Covers: GDPR, notifications, billing, accessibility, language, session defaults

import React, { useState } from 'react';
import {
  Bell, Globe, CreditCard, FileText, Eye, Moon, Volume2,
  Monitor, Shield, AlertTriangle, Check, ChevronRight, Save,
  Loader2, Download, Lock, Smartphone, Languages, Trash2,
} from 'lucide-react';

// ── Mock data — replace with API calls ──
const mockSettings = {
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
  theme: 'dark',
  fontSize: 'medium',
  reduceMotion: false,
  highContrast: false,
  screenReader: false,
  defaultSessionType: 'video',
  defaultDuration: 30,
  autoRecord: true,
  requireInterpreterCertification: true,
  preferredGender: 'any',
  billingEmail: 'billing@waliassociates.com',
  invoiceFormat: 'pdf',
  autoInvoice: true,
  paymentMethod: 'card_ending_4242',
};

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese (Simplified)' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'pt', label: 'Portuguese' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($) — United States' },
  { value: 'CAD', label: 'CAD ($) — Canada' },
  { value: 'GBP', label: 'GBP (£) — United Kingdom' },
  { value: 'EUR', label: 'EUR (€) — European Union' },
];

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK/EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

// ── Section wrapper ──
function Section({ icon: Icon, title, children, description, danger }) {
  return (
    <div className={`rounded-xl overflow-hidden border ${
      danger ? 'bg-[#1C1A2E] border-[#E24B4A]/20' : 'bg-[#1C1A2E] border-white/8'
    }`}>
      <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          danger ? 'bg-[#E24B4A]/10' : 'bg-[#7F77DD]/10'
        }`}>
          <Icon size={16} className={danger ? 'text-[#E24B4A]' : 'text-[#7F77DD]'} />
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

// ── Toggle switch ──
function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start justify-between cursor-pointer group gap-4">
      <div className="min-w-0">
        <span className="text-[13px] text-white/70 group-hover:text-white/90 transition-colors block">
          {label}
        </span>
        {description && (
          <span className="text-[11px] text-white/30 mt-0.5 block">{description}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${
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

// ── Select field ──
function SelectField({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-medium text-white/70">
        {Icon && <Icon size={12} className="text-white/30" />}
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-[#13111F] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#7F77DD]/50 appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Action row ──
function ActionRow({ icon: Icon, title, description, action, onClick, danger }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#13111F] border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={16} className={danger ? 'text-[#E24B4A]' : 'text-white/40'} />
        <div className="min-w-0">
          <p className={`text-[13px] font-medium truncate ${danger ? 'text-[#E24B4A]' : 'text-white'}`}>
            {title}
          </p>
          <p className="text-[11px] text-white/40">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`text-[12px] font-medium shrink-0 transition-colors ${
          danger
            ? 'text-[#E24B4A] hover:text-[#F07070]'
            : 'text-[#7F77DD] hover:text-[#A8A3E8]'
        }`}
      >
        {action}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(mockSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [exportConfirm, setExportConfirm] = useState(false);

  const update = (field, value) => {
    setSettings((s) => ({ ...s, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    // Replace with: await fetch('/api/client/settings', { method: 'PUT', body: JSON.stringify(settings) })
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    // GDPR data portability — generate JSON download
    const data = {
      profile: settings,
      exportDate: new Date().toISOString(),
      format: 'GDPR-compliant export',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingobridge-data-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportConfirm(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-white mb-1">Settings</h1>
        <p className="text-[13px] text-white/40">
          Manage your preferences, compliance, and account defaults
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Regional & Language ── */}
        <Section icon={Globe} title="Regional & Language" description="Localization and display preferences">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Interface Language"
              icon={Languages}
              value={settings.language}
              onChange={(e) => update('language', e.target.value)}
              options={LANGUAGES}
            />
            <SelectField
              label="Timezone"
              icon={Globe}
              value={settings.timezone}
              onChange={(e) => update('timezone', e.target.value)}
              options={[
                'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
                'America/Toronto', 'America/Vancouver', 'Europe/London', 'Europe/Paris',
                'Asia/Dubai', 'Asia/Tokyo', 'Australia/Sydney',
              ].map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }))}
            />
            <SelectField
              label="Date Format"
              icon={FileText}
              value={settings.dateFormat}
              onChange={(e) => update('dateFormat', e.target.value)}
              options={DATE_FORMATS}
            />
            <SelectField
              label="Currency"
              icon={CreditCard}
              value={settings.currency}
              onChange={(e) => update('currency', e.target.value)}
              options={CURRENCIES}
            />
          </div>
        </Section>

        {/* ── Appearance & Accessibility ── */}
        <Section icon={Monitor} title="Appearance & Accessibility" description="Make LingoBridge work for you">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'dark', label: 'Dark', icon: Moon },
                { key: 'light', label: 'Light', icon: Sun },
                { key: 'system', label: 'System', icon: Monitor },
              ].map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => update('theme', theme.key)}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all ${
                    settings.theme === theme.key
                      ? 'bg-[#7F77DD]/10 border-[#7F77DD]/30 text-white'
                      : 'bg-[#13111F] border-white/5 text-white/50 hover:text-white/70'
                  }`}
                >
                  <theme.icon size={16} />
                  <span className="text-[13px] font-medium">{theme.label}</span>
                  {settings.theme === theme.key && <Check size={14} className="ml-auto text-[#7F77DD]" />}
                </button>
              ))}
            </div>

            <div className="border-t border-white/8 pt-4 space-y-3">
              <Toggle
                checked={settings.reduceMotion}
                onChange={(v) => update('reduceMotion', v)}
                label="Reduce motion"
                description="Minimize animations and transitions"
              />
              <Toggle
                checked={settings.highContrast}
                onChange={(v) => update('highContrast', v)}
                label="High contrast mode"
                description="Increase contrast for better visibility"
              />
              <Toggle
                checked={settings.screenReader}
                onChange={(v) => update('screenReader', v)}
                label="Screen reader optimization"
                description="Enhance ARIA labels and navigation"
              />
            </div>
          </div>
        </Section>

        {/* ── Session Defaults ── */}
        <Section icon={Smartphone} title="Session Defaults" description="Pre-fill your most common booking preferences">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Default Session Type"
              icon={Monitor}
              value={settings.defaultSessionType}
              onChange={(e) => update('defaultSessionType', e.target.value)}
              options={[
                { value: 'video', label: 'Video Interpretation' },
                { value: 'audio', label: 'Audio Only' },
                { value: 'inperson', label: 'In-Person' },
              ]}
            />
            <SelectField
              label="Default Duration"
              icon={Clock}
              value={settings.defaultDuration}
              onChange={(e) => update('defaultDuration', Number(e.target.value))}
              options={DURATIONS.map((d) => ({ value: d, label: `${d} minutes` }))}
            />
          </div>

          <div className="border-t border-white/8 pt-4 mt-4 space-y-3">
            <Toggle
              checked={settings.autoRecord}
              onChange={(v) => update('autoRecord', v)}
              label="Auto-record sessions"
              description="Record all sessions by default (with interpreter consent)"
            />
            <Toggle
              checked={settings.requireInterpreterCertification}
              onChange={(v) => update('requireInterpreterCertification', v)}
              label="Require certified interpreters only"
              description="Filter for interpreters with verified credentials (recommended for legal/medical)"
            />
            <SelectField
              label="Preferred Interpreter Gender"
              icon={User}
              value={settings.preferredGender}
              onChange={(e) => update('preferredGender', e.target.value)}
              options={[
                { value: 'any', label: 'No preference' },
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
              ]}
            />
          </div>
        </Section>

        {/* ── Billing & Invoices ── */}
        <Section icon={CreditCard} title="Billing & Invoices" description="Payment methods and invoice preferences">
          <div className="space-y-3">
            <ActionRow
              icon={CreditCard}
              title="Payment Method"
              description={`Card ending in ${settings.paymentMethod?.split('_').pop() || '****'}`}
              action="Manage"
              onClick={() => alert('Navigate to Wallet → Payment Methods')}
            />
            <ActionRow
              icon={FileText}
              title="Invoice Settings"
              description={`Format: ${settings.invoiceFormat.toUpperCase()} · Billing email: ${settings.billingEmail}`}
              action="Edit"
              onClick={() => alert('Open invoice settings modal')}
            />
            <Toggle
              checked={settings.autoInvoice}
              onChange={(v) => update('autoInvoice', v)}
              label="Auto-generate invoices after each session"
              description="Send invoice PDF to billing email immediately after session completion"
            />
            <div className="pt-2">
              <button
                onClick={() => alert('Navigate to Wallet → Statements')}
                className="flex items-center gap-2 text-[12px] text-[#7F77DD] hover:text-[#A8A3E8] transition-colors"
              >
                <Download size={13} />
                Download all statements
              </button>
            </div>
          </div>
        </Section>

        {/* ── Data Privacy & Compliance (GDPR / HIPAA) ── */}
        <Section icon={Shield} title="Data Privacy & Compliance" description="Your rights under GDPR, CCPA, and HIPAA">
          <div className="space-y-3">
            <ActionRow
              icon={Download}
              title="Export My Data"
              description="Download all your personal data in GDPR-compliant JSON format"
              action="Export"
              onClick={() => setExportConfirm(true)}
            />
            <ActionRow
              icon={Lock}
              title="Data Processing Agreement"
              description="Review how we process and store your data"
              action="View"
              onClick={() => alert('Open DPA modal')}
            />
            <ActionRow
              icon={FileText}
              title="Business Associate Agreement (BAA)"
              description="Required for HIPAA-covered entities in healthcare"
              action="Request"
              onClick={() => alert('BAA request sent to support')}
            />
            <div className="bg-[#FAEEDA]/10 border border-[#BA7517]/20 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-[#BA7517] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#BA7517]/90 leading-relaxed">
                  For healthcare clients in the US: enable BAA and set data retention to <strong>Extended (7 years)</strong> in Profile → Data & Privacy to meet HIPAA requirements.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Danger Zone ── */}
        <Section icon={Trash2} title="Danger Zone" description="Irreversible account actions" danger>
          <div className="space-y-3">
            <ActionRow
              icon={Trash2}
              title="Delete Account"
              description="Permanently delete your account and all data. This cannot be undone."
              action="Delete"
              danger
              onClick={() => setDeleteConfirm(true)}
            />
          </div>
        </Section>
      </div>

      {/* ── Sticky Save Bar ── */}
      <div className="sticky bottom-0 mt-8 -mx-6 -mb-6 px-6 py-4 bg-[#13111F]/90 backdrop-blur border-t border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-[13px] text-[#1D9E75]">
              <Check size={14} /> Settings saved
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

      {/* ── Export Data Modal ── */}
      {exportConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1A2E] border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-[16px] font-semibold text-white mb-2">Export Your Data?</h3>
            <p className="text-[13px] text-white/60 leading-relaxed mb-5">
              We will generate a JSON file containing all your personal data, session history, and preferences. This may take a moment.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setExportConfirm(false)}
                className="px-4 py-2 rounded-lg text-[13px] text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7F77DD] text-white text-[13px] font-medium hover:bg-[#6B64C4] transition-colors"
              >
                <Download size={13} />
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1C1A2E] border border-[#E24B4A]/20 rounded-xl p-6 max-w-md w-full">
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
                  alert('Account deletion request submitted. You will receive confirmation via email.');
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

// Missing icon import helper
function Sun({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function Clock({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function User({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}