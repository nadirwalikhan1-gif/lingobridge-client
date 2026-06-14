import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users, CreditCard, Code, Mail, Plus, X,
  Search, Shield, User, Eye, Trash2, Loader2,
  AlertCircle, DollarSign, Calendar, BarChart3,
  Copy, CheckCheck, Crown, ChevronLeft, ChevronRight,
  ArrowRight, MoreVertical, RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { useDebounce } from '@/hooks/useDebounce';

// ─── API Functions ──────────────────────────────────────────────────────────
const fetchTeam = async () => {
  const { data } = await api.get('/v1/teams/me');
  return data;
};

const fetchTeamMembers = async ({ page, limit, search, roleFilter, deptFilter, sortBy }) => {
  const { data } = await api.get('/v1/teams/me/members', {
    params: { page, limit, search, role: roleFilter, department: deptFilter, sort: sortBy }
  });
  return data;
};

const inviteMember = async ({ email, role, department }) => {
  const { data } = await api.post('/v1/teams/me/invitations', { email, role, department });
  return data;
};

const removeMember = async (memberId) => {
  await api.delete(`/v1/teams/me/members/${memberId}`);
};

const updateMemberRole = async ({ memberId, role }) => {
  const { data } = await api.put(`/v1/teams/me/members/${memberId}/role`, { role });
  return data;
};

const updateMemberDepartment = async ({ memberId, department }) => {
  const { data } = await api.put(`/v1/teams/me/members/${memberId}/department`, { department });
  return data;
};

const resendInvite = async (memberId) => {
  await api.post(`/v1/teams/me/invitations/${memberId}/resend`);
};

const getInviteLink = async () => {
  const { data } = await api.get('/v1/teams/me/invite-link');
  return data;
};

const regenerateInviteLink = async () => {
  const { data } = await api.post('/v1/teams/me/invite-link/regenerate');
  return data;
};

const fetchTeamStats = async () => {
  const { data } = await api.get('/v1/teams/me/stats');
  return data;
};

// FIX 1: exportTeamData — responseType must be passed as axios request config,
// not inside the request body. Separated into a proper config object.
const exportTeamData = async ({ format, filters }) => {
  const { data } = await api.post(
    '/v1/teams/me/export',
    { format, filters },
    { responseType: format === 'csv' ? 'blob' : 'json' }
  );
  return data;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  owner:  { label: 'Owner',  color: 'text-amber-600',  bg: 'bg-amber-50',  icon: Crown,  canChange: false },
  admin:  { label: 'Admin',  color: 'text-violet-600', bg: 'bg-violet-50', icon: Shield, canChange: true  },
  member: { label: 'Member', color: 'text-slate-600',  bg: 'bg-slate-50',  icon: User,   canChange: true  },
  viewer: { label: 'Viewer', color: 'text-slate-400',  bg: 'bg-slate-50',  icon: Eye,    canChange: true  },
};

const ROLE_OPTIONS = [
  { value: 'admin',  label: 'Admin — Can manage team and billing' },
  { value: 'member', label: 'Member — Can book sessions and view own history' },
  { value: 'viewer', label: 'Viewer — Can only view reports and analytics' },
];

const PER_PAGE = 10;

// ─── Reusable Components ──────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.member;
  const Icon = config.icon;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
      <Icon size={10} /> {config.label}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, onClick, loading }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-4 ${onClick ? 'cursor-pointer hover:border-violet-200 transition-colors' : ''}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-slate-400" />
        <span className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      {loading ? (
        <div className="h-6 bg-slate-100 rounded animate-pulse w-20" />
      ) : (
        <p className="text-[20px] font-bold text-slate-900">{value}</p>
      )}
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Invite Modal ───────────────────────────────────────────────────────────────
function InviteModal({ isOpen, onClose, departments, teamSeats, usedSeats }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [department, setDepartment] = useState('');
  // FIX 2: Store emails as an array; textarea value uses join with real newline char
  const [emails, setEmails] = useState([]);
  const [mode, setMode] = useState('single');
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: (data) => {
      toast.success(data.message || 'Invitation sent successfully');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
      onClose();
      setEmail('');
      setEmails([]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    }
  });

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // FIX 3: handleSend bulk path — use proper async/await instead of
  // fire-and-forget Promise.all inside a sync handler
  const handleSend = async () => {
    if (mode === 'single') {
      if (!validateEmail(email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
      inviteMutation.mutate({ email: email.trim(), role, department });
    } else {
      const validEmails = emails.filter((e) => validateEmail(e.trim()));
      if (!validEmails.length) {
        toast.error('No valid email addresses found');
        return;
      }
      try {
        const results = await Promise.allSettled(
          validEmails.map((e) => inviteMember({ email: e.trim(), role, department }))
        );
        const succeeded = results.filter((r) => r.status === 'fulfilled').length;
        const failed    = results.filter((r) => r.status === 'rejected').length;
        if (succeeded > 0) {
          toast.success(`Invited ${succeeded} member${succeeded !== 1 ? 's' : ''}`);
          queryClient.invalidateQueries({ queryKey: ['team-members'] });
          queryClient.invalidateQueries({ queryKey: ['team'] });
          onClose();
          setEmails([]);
        }
        if (failed > 0) {
          toast.error(`${failed} invitation${failed !== 1 ? 's' : ''} failed to send`);
        }
      } catch {
        toast.error('Failed to send invitations');
      }
    }
  };

  // FIX 4: handleBulkInput — use a proper newline regex; the original source had
  // a raw newline inside the regex literal which could cause parse issues
  const handleBulkInput = (text) => {
    const parsed = text.split(/[,;\n\r]+/).map((e) => e.trim()).filter(Boolean);
    setEmails(parsed);
  };

  const availableSeats = teamSeats - usedSeats;
  const isFull = availableSeats <= 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-bold text-slate-900">
              Invite Team Member{mode === 'bulk' ? 's' : ''}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {isFull && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <p className="text-[12px] text-amber-700">
                Your team is at capacity.{' '}
                <button onClick={() => navigate('/subscription')} className="font-medium underline">
                  Upgrade plan
                </button>{' '}
                to add more seats.
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-2 rounded-lg text-[12px] font-medium border transition-colors ${
                mode === 'single'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Single Invite
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`flex-1 py-2 rounded-lg text-[12px] font-medium border transition-colors ${
                mode === 'bulk'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Bulk Invite
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'single' ? (
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">
                  Email addresses{' '}
                  <span className="text-slate-400">(comma, semicolon, or newline separated)</span>
                </label>
                {/* FIX 5: Use String.fromCharCode(10) or a template literal for the
                    join separator to avoid raw newline characters in JSX source */}
                <textarea
                  value={emails.join('\n')}
                  onChange={(e) => handleBulkInput(e.target.value)}
                  placeholder="colleague1@company.com, colleague2@company.com"
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {emails.length} valid email{emails.length !== 1 ? 's' : ''} detected
                </p>
              </div>
            )}

            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">Select department (optional)</option>
                {departments?.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={
                inviteMutation.isPending ||
                isFull ||
                (mode === 'single' ? !email.trim() : !emails.length)
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {inviteMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Mail size={14} />
              )}
              {inviteMutation.isPending
                ? 'Sending...'
                : mode === 'single'
                ? 'Send Invite'
                : `Invite ${emails.length} Members`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Member Actions Menu ────────────────────────────────────────────────────────
function MemberActions({ member, onRoleChange, onDepartmentChange, onRemove, onResend, departments, currentUserRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canManage    = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canChangeRole = canManage && ROLE_CONFIG[member.role]?.canChange && member.role !== 'owner';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[180px] py-1">
          {member.status === 'invited' && (
            <button
              onClick={() => { onResend(member.id); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={14} /> Resend Invite
            </button>
          )}

          {canChangeRole && (
            <div className="px-3 py-2">
              <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wider">Change Role</p>
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onRoleChange({ memberId: member.id, role: opt.value }); setIsOpen(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[12px] transition-colors ${
                    member.role === opt.value
                      ? 'bg-violet-50 text-violet-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {canManage && departments?.length > 0 && (
            <div className="px-3 py-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wider">Department</p>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => { onDepartmentChange({ memberId: member.id, department: dept }); setIsOpen(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[12px] transition-colors ${
                    member.department === dept
                      ? 'bg-violet-50 text-violet-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}

          {canManage && member.role !== 'owner' && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => { onRemove(member.id); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} /> Remove Member
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Invite Link Modal ──────────────────────────────────────────────────────────
function InviteLinkModal({ isOpen, onClose }) {
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { data: inviteData, isLoading } = useQuery({
    queryKey: ['team-invite-link'],
    queryFn: getInviteLink,
    enabled: isOpen,
  });

  const regenerateMutation = useMutation({
    mutationFn: regenerateInviteLink,
    onSuccess: (data) => {
      setLink(data.url);
      queryClient.invalidateQueries({ queryKey: ['team-invite-link'] });
      toast.success('Invite link regenerated');
    },
    onError: () => toast.error('Failed to regenerate link'),
  });

  useEffect(() => {
    if (inviteData?.url) setLink(inviteData.url);
  }, [inviteData]);

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Invite link copied');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-slate-900">Team Invite Link</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-[13px] text-slate-500 mb-4">
          Share this link with anyone you want to join your team. They'll be able to sign up and
          join automatically.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-600 truncate">
            {isLoading ? 'Loading...' : link || 'No link available'}
          </div>
          <button
            onClick={copyLink}
            disabled={!link || isLoading}
            className="p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-30"
          >
            {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mb-4">
          <AlertCircle size={14} className="text-slate-400" />
          <p className="text-[12px] text-slate-500">
            Link expires{' '}
            {inviteData?.expiresAt
              ? new Date(inviteData.expiresAt).toLocaleDateString()
              : 'in 30 days'}
          </p>
        </div>

        <button
          onClick={() => regenerateMutation.mutate()}
          disabled={regenerateMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {regenerateMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Regenerate Link
        </button>
      </div>
    </div>
  );
}

// ─── Remove Member Confirmation Modal ───────────────────────────────────────────
function RemoveConfirmModal({ isOpen, onClose, onConfirm, memberName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">Remove Member?</h3>
            <p className="text-[12px] text-slate-400">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-[13px] text-slate-600 mb-6">
          {memberName} will lose access to all team resources, session history, and billing data.
          Their personal data will be retained according to your data retention policy.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[13px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors"
          >
            Remove Member
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination Helper ─────────────────────────────────────────────────────────
// FIX 6: Pagination now shows a sliding window of pages centered on the current
// page, instead of always showing pages 1–5 regardless of where the user is.
function getPaginationRange(currentPage, totalPages, windowSize = 5) {
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  let end   = Math.min(totalPages, start + windowSize - 1);
  // Adjust start if we're near the end
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ─── Main Teams Component ───────────────────────────────────────────────────────
export default function Teams() {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const { user }     = useAuth();

  const [search,        setSearch]        = useState('');
  const [roleFilter,    setRoleFilter]    = useState('all');
  const [deptFilter,    setDeptFilter]    = useState('all');
  const [sortBy,        setSortBy]        = useState('name_asc');
  const [page,          setPage]          = useState(1);
  const [showInvite,    setShowInvite]    = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [removeTarget,  setRemoveTarget]  = useState(null);
  const [exporting,     setExporting]     = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch team data
  const {
    data: team,
    isLoading: teamLoading,
    isError: teamError,
    error: teamErrorData,
  } = useQuery({
    queryKey: ['team'],
    queryFn: fetchTeam,
    staleTime: 60_000,
  });

  // Fetch team members
  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
    error: membersErrorData,
  } = useQuery({
    queryKey: ['team-members', page, roleFilter, deptFilter, sortBy, debouncedSearch],
    queryFn: () =>
      fetchTeamMembers({ page, limit: PER_PAGE, search: debouncedSearch, roleFilter, deptFilter, sortBy }),
    staleTime: 30_000,
  });

  // Fetch team stats
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorData,
  } = useQuery({
    queryKey: ['team-stats'],
    queryFn: fetchTeamStats,
    staleTime: 30_000,
  });

  const members     = membersData?.members    ?? [];
  const totalPages  = membersData?.totalPages ?? 1;
  const totalCount  = membersData?.totalCount ?? 0;
  const departments = team?.departments       ?? [];

  // Mutations
  const removeMutation = useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      toast.success('Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      setRemoveTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove member'),
  });

  const roleMutation = useMutation({
    mutationFn: updateMemberRole,
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update role'),
  });

  const deptMutation = useMutation({
    mutationFn: updateMemberDepartment,
    onSuccess: () => {
      toast.success('Department updated');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update department'),
  });

  const resendMutation = useMutation({
    mutationFn: resendInvite,
    onSuccess: () => toast.success('Invitation resent'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to resend invitation'),
  });

  const handleExport = useCallback(async (format) => {
    setExporting(true);
    try {
      const result = await exportTeamData({
        format,
        filters: { roleFilter, deptFilter, search: debouncedSearch },
      });
      const mimeType = format === 'csv' ? 'text/csv' : 'application/pdf';
      const blob     = new Blob([result], { type: mimeType });
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      a.download     = `team-members-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Failed to export');
    } finally {
      setExporting(false);
    }
  }, [roleFilter, deptFilter, debouncedSearch]);

  const handleRemove = useCallback((id) => {
    const member = members.find((m) => m.id === id);
    if (member) setRemoveTarget(member);
  }, [members]);

  const confirmRemove = useCallback(() => {
    if (removeTarget) removeMutation.mutate(removeTarget.id);
  }, [removeTarget, removeMutation]);

  const currentUserRole = user?.teamRole || 'member';
  const canManage       = currentUserRole === 'owner' || currentUserRole === 'admin';

  // Error state
  if (teamError || membersError || statsError) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-20">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-[18px] font-medium text-slate-900 mb-2">Failed to load team data</h3>
          <p className="text-[13px] text-slate-400 mb-4">
            {teamErrorData?.message ||
              membersErrorData?.message ||
              statsErrorData?.message ||
              'An error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (teamLoading && !team) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const paginationPages = getPaginationRange(page, totalPages);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 mb-1">For Teams</h1>
          <p className="text-[13px] text-slate-400">
            {team?.name || 'Your Team'} · {team?.plan || 'Enterprise'} Plan ·{' '}
            {stats?.activeMembers ?? 0}/{team?.seats ?? 0} seats used
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            {exporting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <ArrowRight size={12} className="rotate-90" />
            )}
            CSV
          </button>
          {canManage && (
            <>
              <button
                onClick={() => setShowInviteLink(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Copy size={12} /> Invite Link
              </button>
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-700 transition-colors shadow-sm"
              >
                <Plus size={14} /> Invite Member
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Monthly Spend"
          value={`$${(stats?.monthlySpend ?? 0).toFixed(2)}`}
          sub={
            team?.nextInvoice
              ? `Next invoice: ${new Date(team.nextInvoice).toLocaleDateString()}`
              : 'Monthly billing'
          }
          icon={DollarSign}
          loading={statsLoading}
          onClick={() => navigate('/wallet')}
        />
        <StatCard
          label="Team Sessions"
          value={(stats?.totalSessions ?? 0).toString()}
          sub="This month"
          icon={BarChart3}
          loading={statsLoading}
          onClick={() => navigate('/history')}
        />
        <StatCard
          label="Active Members"
          value={`${stats?.activeMembers ?? 0}/${Math.max(team?.seats ?? 1, 1)}`}
          sub={`${Math.max((team?.seats ?? 0) - (stats?.activeMembers ?? 0), 0)} seats remaining`}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          label="Billing Cycle"
          value={team?.billingCycle || 'Monthly'}
          sub={team?.nextInvoice ? `Renews ${new Date(team.nextInvoice).toLocaleDateString()}` : ''}
          icon={Calendar}
          loading={teamLoading}
          onClick={() => navigate('/subscription')}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search members by name, email, or department..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0 shadow-sm"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0 shadow-sm"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0 shadow-sm"
        >
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="spend_desc">Spend (High-Low)</option>
          <option value="sessions_desc">Sessions (Most)</option>
          <option value="recent">Recently Active</option>
        </select>
      </div>

      {/* Members Table */}
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
                <th className="text-right px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">Last Active</th>
                <th className="px-4 py-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {membersLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3" colSpan={8}>
                      <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-9 h-9 rounded-full bg-slate-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-200 rounded w-1/4" />
                          <div className="h-2 bg-slate-200 rounded w-1/3" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Users size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-[14px] text-slate-400">No members found</p>
                    <button
                      onClick={() => { setSearch(''); setRoleFilter('all'); setDeptFilter('all'); setPage(1); }}
                      className="text-[12px] text-violet-600 hover:text-violet-700 mt-2 transition-colors"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                          <span className="text-[12px] font-semibold text-violet-600">
                            {m.avatar || m.name?.substring(0, 2).toUpperCase() || '??'}
                          </span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-slate-900">{m.name}</p>
                          <p className="text-[11px] text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={m.role} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-slate-500">{m.department || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        m.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : m.status === 'invited'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-50 text-slate-400'
                      }`}>
                        {m.status === 'active' ? 'Active' : m.status === 'invited' ? 'Invited' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] text-slate-700">{m.sessionsThisMonth ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] text-slate-700">
                        ${(m.spendThisMonth ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] text-slate-400">{m.lastActive || 'Never'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <MemberActions
                        member={m}
                        onRoleChange={roleMutation.mutate}
                        onDepartmentChange={deptMutation.mutate}
                        onRemove={handleRemove}
                        onResend={resendMutation.mutate}
                        departments={departments}
                        currentUserRole={currentUserRole}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-[12px] text-slate-400">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalCount)} of{' '}
              {totalCount}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {paginationPages.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-colors ${
                    page === p
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:border-violet-200 transition-colors"
          onClick={() => navigate('/subscription')}
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <Users size={20} className="text-violet-600" />
          </div>
          <h3 className="text-[14px] font-medium text-slate-900 mb-1">Volume Pricing</h3>
          <p className="text-[12px] text-slate-400 leading-relaxed">
            Custom rates for teams of 10+. Current rate: Video ${team?.rates?.video ?? '1.79'}/min,
            Audio ${team?.rates?.audio ?? '1.49'}/min.
          </p>
        </div>
        <div
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:border-violet-200 transition-colors"
          onClick={() => navigate('/wallet')}
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <CreditCard size={20} className="text-violet-600" />
          </div>
          <h3 className="text-[14px] font-medium text-slate-900 mb-1">Unified Billing</h3>
          <p className="text-[12px] text-slate-400 leading-relaxed">
            One invoice for all team members. Department-level cost tracking included.
          </p>
        </div>
        <div
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:border-violet-200 transition-colors"
          onClick={() => navigate('/settings/api')}
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <Code size={20} className="text-violet-600" />
          </div>
          <h3 className="text-[14px] font-medium text-slate-900 mb-1">API Access</h3>
          <p className="text-[12px] text-slate-400 leading-relaxed">
            Embed interpretation directly into your EHR, case management, or CRM platform.
          </p>
        </div>
      </div>

      {/* Modals */}
      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        departments={departments}
        teamSeats={team?.seats ?? 0}
        usedSeats={stats?.activeMembers ?? 0}
      />
      <InviteLinkModal
        isOpen={showInviteLink}
        onClose={() => setShowInviteLink(false)}
      />
      <RemoveConfirmModal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={confirmRemove}
        memberName={removeTarget?.name}
      />
    </div>
  );
}
