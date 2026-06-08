// Wallet.jsx — enhanced client wallet with export, filters, pagination
// Rates: Video $1.79/min, Audio $1.49/min

import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownLeft, CreditCard, Zap, Search,
  Download, FileText, Calendar, ChevronLeft, ChevronRight, Check,
  AlertCircle, Receipt, Wallet as WalletIcon, TrendingDown,
  TrendingUp, Clock, Loader2,
} from 'lucide-react';

// ── Rates ──
const RATES = { video: 1.79, audio: 1.49 };

// ── Mock data ──
const MOCK_TRANSACTIONS = [
  { id: 101, type: 'debit',  description: 'Video session with Maria G.', minutes: 45, sessionType: 'video', date: '2026-06-08T10:30:00', amount: 80.55, invoiceId: 'INV-2026-0101', interpreter: 'Maria Gonzalez' },
  { id: 102, type: 'debit',  description: 'Audio session with John D.',  minutes: 30, sessionType: 'audio', date: '2026-06-07T14:15:00', amount: 44.70, invoiceId: 'INV-2026-0100', interpreter: 'John Doe' },
  { id: 103, type: 'credit', description: 'Wallet top-up via Visa •••• 4242', amount: 100.00, date: '2026-06-05T09:00:00', invoiceId: null, interpreter: null },
  { id: 104, type: 'debit',  description: 'Video session with Sarah C.', minutes: 60, sessionType: 'video', date: '2026-06-04T16:00:00', amount: 107.40, invoiceId: 'INV-2026-0099', interpreter: 'Sarah Chen' },
  { id: 105, type: 'debit',  description: 'Audio session with Ahmed H.', minutes: 20, sessionType: 'audio', date: '2026-06-03T11:20:00', amount: 29.80, invoiceId: 'INV-2026-0098', interpreter: 'Ahmed Hassan' },
  { id: 106, type: 'credit', description: 'Wallet top-up via Mastercard •••• 8888', amount: 50.00, date: '2026-06-01T08:30:00', invoiceId: null, interpreter: null },
  { id: 107, type: 'debit',  description: 'Video session with Maria G.', minutes: 30, sessionType: 'video', date: '2026-05-28T13:00:00', amount: 53.70, invoiceId: 'INV-2026-0097', interpreter: 'Maria Gonzalez' },
  { id: 108, type: 'debit',  description: 'Audio session with John D.', minutes: 45, sessionType: 'audio', date: '2026-05-25T10:00:00', amount: 67.05, invoiceId: 'INV-2026-0096', interpreter: 'John Doe' },
  { id: 109, type: 'credit', description: 'Refund — Session cancellation', amount: 22.50, date: '2026-05-20T15:00:00', invoiceId: 'CR-2026-0003', interpreter: null },
  { id: 110, type: 'debit',  description: 'Video session with Sarah C.', minutes: 90, sessionType: 'video', date: '2026-05-18T09:30:00', amount: 161.10, invoiceId: 'INV-2026-0095', interpreter: 'Sarah Chen' },
  { id: 111, type: 'debit',  description: 'Audio session with Maria G.', minutes: 15, sessionType: 'audio', date: '2026-05-15T16:45:00', amount: 22.35, invoiceId: 'INV-2026-0094', interpreter: 'Maria Gonzalez' },
  { id: 112, type: 'credit', description: 'Wallet top-up via Visa •••• 4242', amount: 75.00, date: '2026-05-10T11:00:00', invoiceId: null, interpreter: null },
];

const MOCK_CARDS = [
  { id: 1, last4: '4242', expiry: '12/28', type: 'VISA', isDefault: true },
  { id: 2, last4: '8888', expiry: '12/30', type: 'Mastercard', isDefault: false },
];

// ── Helpers ──
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays < 7) {
    return diffDays + ' days ago';
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isToday(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < 7;
}

function isThisMonth(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ── Export functions ──
function exportCSV(transactions) {
  const headers = ['Date', 'Type', 'Description', 'Amount', 'Invoice ID', 'Interpreter'];
  const rows = transactions.map((t) => [
    new Date(t.date).toISOString(),
    t.type,
    t.description,
    t.amount.toFixed(2),
    t.invoiceId || '',
    t.interpreter || '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => '"' + c + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lingobridge-statement-' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(transactions) {
  const rows = transactions.map(function(t) {
    return '<tr>' +
      '<td>' + formatDate(t.date) + '</td>' +
      '<td>' + t.type + '</td>' +
      '<td>' + t.description + '</td>' +
      '<td class="' + t.type + '">' + (t.type === 'credit' ? '+' : '-') + '$' + t.amount.toFixed(2) + '</td>' +
      '<td>' + (t.invoiceId || '-') + '</td>' +
    '</tr>';
  }).join('');

  const html = '<html><head><style>' +
    'body { font-family: system-ui; padding: 40px; color: #333; }' +
    'h1 { font-size: 24px; margin-bottom: 8px; }' +
    'p { color: #666; margin-bottom: 24px; }' +
    'table { width: 100%; border-collapse: collapse; }' +
    'th { text-align: left; padding: 12px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #666; }' +
    'td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }' +
    '.credit { color: #1D9E75; }' +
    '.debit { color: #D85A30; }' +
    '</style></head><body>' +
    '<h1>LingoBridge Statement</h1>' +
    '<p>Generated on ' + new Date().toLocaleDateString() + '</p>' +
    '<table>' +
    '<tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Invoice</th></tr>' +
    rows +
    '</table>' +
    '</body></html>';

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.print();
}

// ── Components ──
function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <div className="bg-[#1C1A2E] border border-white/8 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-white/30" />
        <span className="text-[11px] text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-[18px] font-semibold text-white">{value}</p>
      {trend && <p className="text-[11px] text-white/30 mt-1">{trend}</p>}
    </div>
  );
}

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/8">
      <p className="text-[12px] text-white/40">
        Page {current} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={"w-7 h-7 rounded-lg text-[12px] font-medium transition-colors " + (
              page === current
                ? "bg-[#7F77DD] text-white"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === total}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Wallet() {
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const perPage = 5;

  // Balance calculations — reconciled
  const totalCredits = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const currentBalance = +(totalCredits - totalDebits).toFixed(2);

  const todayDebits = transactions.filter((t) => t.type === 'debit' && isToday(t.date)).reduce((s, t) => s + t.amount, 0);
  const todayCredits = transactions.filter((t) => t.type === 'credit' && isToday(t.date)).reduce((s, t) => s + t.amount, 0);
  const weekDebits = transactions.filter((t) => t.type === 'debit' && isThisWeek(t.date)).reduce((s, t) => s + t.amount, 0);
  const monthDebits = transactions.filter((t) => t.type === 'debit' && isThisMonth(t.date)).reduce((s, t) => s + t.amount, 0);

  // Filter & sort
  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.interpreter && t.interpreter.toLowerCase().includes(q)) ||
          (t.invoiceId && t.invoiceId.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (dateFilter !== 'all') {
      result = result.filter((t) => {
        if (dateFilter === 'today') return isToday(t.date);
        if (dateFilter === 'week') return isThisWeek(t.date);
        if (dateFilter === 'month') return isThisMonth(t.date);
        return true;
      });
    }

    result.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      if (sortBy === 'newest') return db - da;
      if (sortBy === 'oldest') return da - db;
      if (sortBy === 'amount_high') return b.amount - a.amount;
      if (sortBy === 'amount_low') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, search, typeFilter, dateFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleExport = (format) => {
    setExporting(true);
    setTimeout(() => {
      if (format === 'csv') exportCSV(filtered);
      else exportPDF(filtered);
      setExporting(false);
    }, 500);
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-white mb-1">Wallet</h1>
          <p className="text-[13px] text-white/40">Manage funds, transactions, and billing</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1C1A2E] border border-white/8 text-white text-[12px] font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1C1A2E] border border-white/8 text-white text-[12px] font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
            PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7F77DD] text-white text-[12px] font-medium hover:bg-[#6B64C4] transition-colors">
            <WalletIcon size={12} />
            Add Funds
          </button>
        </div>
      </div>

      {/* Balance card + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1 bg-[#1C1A2E] border border-white/8 rounded-xl p-6">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Available Balance</p>
          <p className="text-[36px] font-bold text-white tracking-tight">${currentBalance.toFixed(2)}</p>
          <div className="flex items-center gap-1 mt-1">
            <Check size={12} className="text-[#1D9E75]" />
            <p className="text-[11px] text-[#1D9E75]">Reconciled</p>
          </div>
          <p className="text-[11px] text-white/30 mt-3">
            Total in: ${totalCredits.toFixed(2)} · Total out: ${totalDebits.toFixed(2)}
          </p>
          <p className="text-[11px] text-white/20 mt-1">
            Rates: Video ${RATES.video}/min · Audio ${RATES.audio}/min
          </p>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Added today" value={"$" + todayCredits.toFixed(2)} icon={TrendingUp} trend={todayCredits > 0 ? 'Top-up received' : 'No deposits today'} />
          <StatCard label="Spent today" value={"$" + todayDebits.toFixed(2)} icon={TrendingDown} trend={transactions.filter((t) => t.type === 'debit' && isToday(t.date)).length + " sessions"} />
          <StatCard label="Spent this week" value={"$" + weekDebits.toFixed(2)} icon={Clock} trend={transactions.filter((t) => t.type === 'debit' && isThisWeek(t.date)).length + " sessions"} />
          <StatCard label="Spent this month" value={"$" + monthDebits.toFixed(2)} icon={Calendar} trend={transactions.filter((t) => t.type === 'debit' && isThisMonth(t.date)).length + " sessions"} />
        </div>
      </div>

      {/* Upgrade nudge */}
      <div className="bg-[#1C1A2E] border border-white/8 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#7F77DD]/10 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-[#7F77DD]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-white">Save 20% — Monthly Plan</p>
            <p className="text-[12px] text-white/40 mt-0.5">
              Unlimited sessions for $99/month. Currently paying ~${monthDebits > 0 ? "$" + monthDebits.toFixed(0) + "/mo" : "per session"}.
            </p>
          </div>
          <button className="px-4 py-2 bg-[#7F77DD] text-white text-[12px] font-medium rounded-lg hover:bg-[#6B64C4] transition-colors shrink-0">
            Upgrade
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-[#1C1A2E] border border-white/8 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-[14px] font-semibold text-white">Transactions</h2>
            <span className="text-[12px] text-white/40">
              {filtered.length} of {transactions.length} total
            </span>
          </div>

          {/* Filters bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search by description, interpreter, or invoice #..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-[#13111F] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#7F77DD]/50"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-[#13111F] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none appearance-none cursor-pointer shrink-0"
            >
              <option value="all">All Types</option>
              <option value="debit">Debits Only</option>
              <option value="credit">Credits Only</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="bg-[#13111F] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none appearance-none cursor-pointer shrink-0"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#13111F] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none appearance-none cursor-pointer shrink-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Amount (High → Low)</option>
              <option value="amount_low">Amount (Low → High)</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-white/5">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle size={32} className="text-white/20 mb-3" />
              <p className="text-[14px] text-white/40">No transactions match your filters</p>
              <button
                onClick={() => { setSearch(""); setTypeFilter("all"); setDateFilter("all"); setPage(1); }}
                className="text-[12px] text-[#7F77DD] hover:text-[#A8A3E8] mt-2 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            paginated.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors">
                <div className={"w-9 h-9 rounded-full flex items-center justify-center shrink-0 " + (
                  t.type === 'credit' ? "bg-[#1D9E75]/10" : "bg-white/5"
                )}>
                  {t.type === 'credit'
                    ? <ArrowDownLeft size={16} className="text-[#1D9E75]" />
                    : <ArrowUpRight size={16} className="text-white/40" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-white truncate">{t.description}</p>
                    {t.invoiceId && (
                      <button
                        onClick={() => alert("Download invoice " + t.invoiceId)}
                        className="flex items-center gap-1 text-[10px] text-[#7F77DD] hover:text-[#A8A3E8] bg-[#7F77DD]/10 px-1.5 py-0.5 rounded transition-colors shrink-0"
                      >
                        <Receipt size={10} />
                        {t.invoiceId}
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-white/30 mt-0.5">{formatDate(t.date)}</p>
                </div>
                <span className={"text-[13px] font-semibold shrink-0 " + (
                  t.type === 'credit' ? "text-[#1D9E75]" : "text-white"
                )}>
                  {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>

      {/* Payment Methods */}
      <div className="bg-[#1C1A2E] border border-white/8 rounded-xl p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-white">Payment Methods</h2>
          <button className="text-[12px] text-[#7F77DD] hover:text-[#A8A3E8] font-medium transition-colors">
            + Add Card
          </button>
        </div>
        <div className="space-y-2">
          {MOCK_CARDS.map((card) => (
            <div
              key={card.id}
              className={"flex items-center gap-3 p-3 rounded-lg border transition-colors " + (
                card.isDefault
                  ? "bg-[#7F77DD]/5 border-[#7F77DD]/20"
                  : "bg-[#13111F] border-white/5 hover:border-white/10"
              )}
            >
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <CreditCard size={16} className="text-white/30" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white">{card.type} •••• {card.last4}</p>
                <p className="text-[11px] text-white/30">Expires {card.expiry}</p>
              </div>
              {card.isDefault ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7F77DD]/10 text-[#7F77DD] shrink-0">
                  Default
                </span>
              ) : (
                <button className="text-[11px] text-white/30 hover:text-white/60 transition-colors shrink-0">
                  Set Default
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}