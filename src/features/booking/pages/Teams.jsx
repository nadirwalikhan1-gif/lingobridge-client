// Teams.jsx — functional team management for enterprise clients (light theme)

import React, { useState } from 'react';
import {
  Building2, Users, CreditCard, Code, Mail, ArrowLeft, Plus, X,
  Search, Shield, User, Eye, Trash2, Check, Loader2,
  AlertCircle, TrendingUp, DollarSign, Calendar, BarChart3,
  ChevronDown, Copy, CheckCheck, Crown,
} from 'lucide-react';

const MOCK_TEAM = {
  name: 'Wali & Associates Legal', plan: 'Enterprise', seats: 10, usedSeats: 4,
  monthlySpend: 1240.50, billingCycle: 'Monthly', nextInvoice: '2026-07-01',
};

const MOCK_MEMBERS = [
  { id: 1, name: 'Nadir Wali Khan', email: 'nadirwalikhan1@gmail.com', role: 'owner', department: 'Management', status: 'active', lastActive: '2 min ago', sessionsThisMonth: 24, spendThisMonth: 892.50, avatar: 'NK' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@waliassociates.com', role: 'admin', department: 'Legal', status: 'active', lastActive: '1h ago', sessionsThisMonth: 18, spendThisMonth: 645.20, avatar: 'SJ' },
  { id: 3, name: 'Michael Chen', email: 'm.chen@waliassociates.com', role: 'member', department: 'Medical', status: 'active', lastActive: '3h ago', sessionsThisMonth: 12, spendThisMonth: 428.80, avatar: 'MC' },
  { id: 4, name: 'Emily Rodriguez', email: 'emily.r@waliassociates.com', role: 'member', department: 'Legal', status: 'invited', lastActive: 'Never', sessionsThisMonth: 0, spendThisMonth: 0, avatar: 'ER' },
];

const MOCK_DEPARTMENTS = ['Management', 'Legal', 'Medical', 'Business', 'HR'];

const ROLE_CONFIG = {
  owner: { label: 'Owner', color: 'text-amber-600', bg: 'bg-amber-50', icon: Crown },
  admin: { label: 'Admin', color: 'text-violet-600', bg: 'bg-violet-50', icon: Shield },
  member: { label: 'Member', color: 'text-slate-600', bg: 'bg-slate-50', icon: User },
  viewer: { label: 'Viewer', color: 'text-slate-400', bg: 'bg-slate-50', icon: Eye },
};

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.member;
  const Icon = config.icon;
  return (
    <span className={"flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full " + config.bg + " " + config.color}>
      <Icon size={10} /> {config.label}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-slate-400" />
        <span className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-[20px] font-bold text-slate-900">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function InviteModal({ onClose, onInvite }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [department, setDepartment] = useState('Legal');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email.trim() || !email.includes('@')) return;
    setSending(true);
    setTimeout(() => { onInvite({ email, role, department }); setSending(false); setSent(true); setTimeout(() => onClose(), 800); }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-slate-900">Invite Team Member</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Email address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer">
              <option value="admin">Admin — Can manage team and billing</option>
              <option value="member">Member — Can book sessions and view own history</option>
              <option value="viewer">Viewer — Can only view reports and analytics</option>
            </select>
          </div>
          <div>
            <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer">
              {MOCK_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSend} disabled={sending || !email.includes('@')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
            {sending ? <Loader2 size={14} className="animate-spin" /> : sent ? <CheckCheck size={14} /> : <Mail size={14} />}
            {sent ? 'Sent!' : sending ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Teams() {
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const team = MOCK_TEAM;
  const filtered = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()) || m.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesDept = deptFilter === 'all' || m.department === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const totalSpend = members.reduce((s, m) => s + m.spendThisMonth, 0);
  const totalSessions = members.reduce((s, m) => s + m.sessionsThisMonth, 0);
  const activeMembers = members.filter((m) => m.status === 'active').length;

  const handleInvite = ({ email, role, department }) => {
    const newMember = { id: Date.now(), name: email.split('@')[0], email, role, department, status: 'invited', lastActive: 'Never', sessionsThisMonth: 0, spendThisMonth: 0, avatar: email.substring(0, 2).toUpperCase() };
    setMembers((prev) => [...prev, newMember]);
  };
  const handleRemove = (id) => { if (!confirm('Remove this member from the team?')) return; setMembers((prev) => prev.filter((m) => m.id !== id)); };
  const handleRoleChange = (id, newRole) => setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role: newRole } : m));
  const copyInviteLink = () => { navigator.clipboard.writeText('https://lingobridge.com/join/wali-associates'); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 mb-1">For Teams</h1>
          <p className="text-[13px] text-slate-400">{team.name} · {team.plan} Plan · {activeMembers}/{team.seats} seats used</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyInviteLink} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors shadow-sm">
            {copied ? <CheckCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy Invite Link'}
          </button>
          <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-700 transition-colors shadow-sm">
            <Plus size={14} /> Invite Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Monthly Spend" value={"$" + totalSpend.toFixed(2)} sub={"Next invoice: " + team.nextInvoice} icon={DollarSign} />
        <StatCard label="Team Sessions" value={totalSessions.toString()} sub="This month" icon={BarChart3} />
        <StatCard label="Active Members" value={activeMembers + "/" + team.seats} sub={team.seats - activeMembers + " seats remaining"} icon={Users} />
        <StatCard label="Billing Cycle" value={team.billingCycle} sub={"Renews " + team.nextInvoice} icon={Calendar} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search members by name, email, or department..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 shadow-sm" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0 shadow-sm">
          <option value="all">All Roles</option><option value="owner">Owner</option><option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option>
        </select>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0 shadow-sm">
          <option value="all">All Departments</option>
          {MOCK_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">Member</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">Sessions</th>
                <th className="text-right px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">Spend</th>
                <th className="px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                        <span className="text-[12px] font-semibold text-violet-600">{m.avatar}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-slate-900">{m.name}</p>
                        <p className="text-[11px] text-slate-400">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {m.role === 'owner' ? <RoleBadge role="owner" /> : (
                      <select value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)} className="bg-transparent text-[12px] text-slate-600 focus:outline-none cursor-pointer">
                        <option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3"><span className="text-[12px] text-slate-500">{m.department}</span></td>
                  <td className="px-4 py-3">
                    <span className={"text-[11px] font-medium px-2 py-0.5 rounded-full " + (m.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{m.status === 'active' ? 'Active' : 'Invited'}</span>
                  </td>
                  <td className="px-4 py-3 text-right"><span className="text-[13px] text-slate-700">{m.sessionsThisMonth}</span></td>
                  <td className="px-4 py-3 text-right"><span className="text-[13px] text-slate-700">${m.spendThisMonth.toFixed(2)}</span></td>
                  <td className="px-4 py-3">
                    {m.role !== 'owner' && (
                      <button onClick={() => handleRemove(m.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Remove member">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12"><AlertCircle size={24} className="text-slate-200 mx-auto mb-2" /><p className="text-[13px] text-slate-400">No members match your filters</p></div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3"><Users size={20} className="text-violet-600" /></div>
          <h3 className="text-[14px] font-medium text-slate-900 mb-1">Volume Pricing</h3>
          <p className="text-[12px] text-slate-400 leading-relaxed">Custom rates for teams of 10+. Current rate: Video $1.79/min, Audio $1.49/min.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3"><CreditCard size={20} className="text-violet-600" /></div>
          <h3 className="text-[14px] font-medium text-slate-900 mb-1">Unified Billing</h3>
          <p className="text-[12px] text-slate-400 leading-relaxed">One invoice for all team members. Department-level cost tracking included.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3"><Code size={20} className="text-violet-600" /></div>
          <h3 className="text-[14px] font-medium text-slate-900 mb-1">API Access</h3>
          <p className="text-[12px] text-slate-400 leading-relaxed">Embed interpretation directly into your EHR, case management, or CRM platform.</p>
        </div>
      </div>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />}
    </div>
  );
}