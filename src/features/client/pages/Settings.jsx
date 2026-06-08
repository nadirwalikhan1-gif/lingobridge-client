// Settings.jsx — full client settings (light theme)

import React, { useState } from 'react';
import {
  Bell, Globe, CreditCard, FileText, Eye, Monitor, Volume2,
  Shield, AlertTriangle, Check, ChevronRight, Save,
  Loader2, Download, Lock, Smartphone, Languages, Trash2,
} from 'lucide-react';

const mockSettings = {
  language: 'en', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY',
  currency: 'USD', theme: 'light', fontSize: 'medium',
  reduceMotion: false, highContrast: false, screenReader: false,
  defaultSessionType: 'video', defaultDuration: 30,
  autoRecord: true, requireInterpreterCertification: true,
  preferredGender: 'any', billingEmail: 'billing@waliassociates.com',
  invoiceFormat: 'pdf', autoInvoice: true, paymentMethod: 'card_ending_4242',
};

const LANGUAGES = [
  { value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' }, { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese (Simplified)' }, { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' }, { value: 'pt', label: 'Portuguese' },
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

function Section({ icon: Icon, title, children, description, danger }) {
  return (
    <div className={"rounded-2xl overflow-hidden border shadow-sm " + (danger ? "bg-white border-red-100" : "bg-white border-slate-200")}>
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className={"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 " + (danger ? "bg-red-50" : "bg-violet-50")}>
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
        onClick={() => onChange(!checked)}
        className={"relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 " + (checked ? "bg-violet-600" : "bg-slate-200")}
      >
        <span className={"absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform " + (checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </label>
  );
}

function SelectField({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
        {Icon && <Icon size={12} className="text-slate-400" />}
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-violet-400 appearance-none cursor-pointer"
      >
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function ActionRow({ icon: Icon, title, description, action, onClick, danger }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Icon size={16} className={danger ? "text-red-400" : "text-slate-400"} />
        <div className="min-w-0">
          <p className={"text-[13px] font-medium truncate " + (danger ? "text-red-500" : "text-slate-900")}>{title}</p>
          <p className="text-[11px] text-slate-400">{description}</p>
        </div>
      </div>
      <button onClick={onClick} className={"text-[12px] font-medium shrink-0 transition-colors " + (danger ? "text-red-500 hover:text-red-600" : "text-violet-600 hover:text-violet-700")}>
        {action}
      </button>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(mockSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [exportConfirm, setExportConfirm] = useState(false);

  const update = (field, value) => setSettings((s) => ({ ...s, [field]: value }));

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    const data = { profile: settings, exportDate: new Date().toISOString(), format: 'GDPR-compliant export' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lingobridge-data-export-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    setExportConfirm(false);
  };

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
            <SelectField label="Timezone" icon={Globe} value={settings.timezone} onChange={(e) => update('timezone', e.target.value)} options={['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Toronto','America/Vancouver','Europe/London','Europe/Paris','Asia/Dubai','Asia/Tokyo','Australia/Sydney'].map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }))} />
            <SelectField label="Date Format" icon={FileText} value={settings.dateFormat} onChange={(e) => update('dateFormat', e.target.value)} options={DATE_FORMATS} />
            <SelectField label="Currency" icon={CreditCard} value={settings.currency} onChange={(e) => update('currency', e.target.value)} options={CURRENCIES} />
          </div>
        </Section>

        <Section icon={Monitor} title="Appearance & Accessibility" description="Make LingoBridge work for you">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[{ key: 'light', label: 'Light', icon: Sun }, { key: 'dark', label: 'Dark', icon: Moon }, { key: 'system', label: 'System', icon: Monitor }].map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => update('theme', theme.key)}
                  className={"flex items-center gap-2.5 p-3 rounded-xl border transition-all " + (settings.theme === theme.key ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700")}
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
            <SelectField label="Default Session Type" icon={Monitor} value={settings.defaultSessionType} onChange={(e) => update('defaultSessionType', e.target.value)} options={[{ value: 'video', label: 'Video Interpretation' }, { value: 'audio', label: 'Audio Only' }, { value: 'inperson', label: 'In-Person' }]} />
            <SelectField label="Default Duration" icon={Clock} value={settings.defaultDuration} onChange={(e) => update('defaultDuration', Number(e.target.value))} options={DURATIONS.map((d) => ({ value: d, label: d + ' minutes' }))} />
          </div>
          <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
            <Toggle checked={settings.autoRecord} onChange={(v) => update('autoRecord', v)} label="Auto-record sessions" description="Record all sessions by default (with interpreter consent)" />
            <Toggle checked={settings.requireInterpreterCertification} onChange={(v) => update('requireInterpreterCertification', v)} label="Require certified interpreters only" description="Filter for interpreters with verified credentials (recommended for legal/medical)" />
            <SelectField label="Preferred Interpreter Gender" icon={User} value={settings.preferredGender} onChange={(e) => update('preferredGender', e.target.value)} options={[{ value: 'any', label: 'No preference' }, { value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]} />
          </div>
        </Section>

        <Section icon={CreditCard} title="Billing & Invoices" description="Payment methods and invoice preferences">
          <div className="space-y-3">
            <ActionRow icon={CreditCard} title="Payment Method" description={"Card ending in " + (settings.paymentMethod?.split('_').pop() || '****')} action="Manage" onClick={() => alert('Navigate to Wallet')} />
            <ActionRow icon={FileText} title="Invoice Settings" description={"Format: " + settings.invoiceFormat.toUpperCase() + " · Billing email: " + settings.billingEmail} action="Edit" onClick={() => alert('Open invoice settings')} />
            <Toggle checked={settings.autoInvoice} onChange={(v) => update('autoInvoice', v)} label="Auto-generate invoices after each session" description="Send invoice PDF to billing email immediately after session completion" />
            <div className="pt-2">
              <button onClick={() => alert('Navigate to Wallet Statements')} className="flex items-center gap-2 text-[12px] text-violet-600 hover:text-violet-700 transition-colors">
                <Download size={13} /> Download all statements
              </button>
            </div>
          </div>
        </Section>

        <Section icon={Shield} title="Data Privacy & Compliance" description="Your rights under GDPR, CCPA, and HIPAA">
          <div className="space-y-3">
            <ActionRow icon={Download} title="Export My Data" description="Download all your personal data in GDPR-compliant JSON format" action="Export" onClick={() => setExportConfirm(true)} />
            <ActionRow icon={Lock} title="Data Processing Agreement" description="Review how we process and store your data" action="View" onClick={() => alert('Open DPA')} />
            <ActionRow icon={FileText} title="Business Associate Agreement (BAA)" description="Required for HIPAA-covered entities in healthcare" action="Request" onClick={() => alert('BAA request sent')} />
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
            <ActionRow icon={Trash2} title="Delete Account" description="Permanently delete your account and all data. This cannot be undone." action="Delete" danger onClick={() => setDeleteConfirm(true)} />
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 mt-8 -mx-6 -mb-6 px-6 py-4 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saved && <span className="flex items-center gap-1.5 text-[13px] text-emerald-500"><Check size={14} /> Settings saved</span>}
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {exportConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-[16px] font-bold text-slate-900 mb-2">Export Your Data?</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-5">We will generate a JSON file containing all your personal data, session history, and preferences.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setExportConfirm(false)} className="px-4 py-2 rounded-xl text-[13px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors"><Download size={13} /> Download JSON</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-red-100 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-[16px] font-bold text-slate-900 mb-2">Delete Account?</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-5">This will permanently delete your account and all associated data. If you are under an active enterprise contract, please contact your admin first.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-xl text-[13px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => { setDeleteConfirm(false); alert('Account deletion request submitted. You will receive confirmation via email.'); }} className="px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors">Request Deletion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Sun({ size, className }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>;
}
function Moon({ size, className }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>;
}
function Clock({ size, className }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
function User({ size, className }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function Smartphone({ size, className }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>;
}