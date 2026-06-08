// Wallet.jsx — fixed: positive balance, clearer labels, low-balance warning, running balance column

import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight, ArrowDownLeft, CreditCard, Zap, Search,
  Download, FileText, Calendar, ChevronLeft, ChevronRight, Check,
  AlertCircle, Receipt, Plus, TrendingDown,
  TrendingUp, Clock, Loader2, AlertTriangle,
} from 'lucide-react';

const RATES = { video: 1.79, audio: 1.49 };

// FIX 1: Corrected mock data so credits exceed debits → positive balance
// Previous data had $247.50 in and $566.65 out → showed confusing $-319.15
// Now: $650.00 in, $566.65 out → $83.35 available (realistic for active user)
const MOCK_TRANSACTIONS = [
  { id: 101, type: 'debit',  description: 'Video session with Maria G.',             minutes: 45, sessionType: 'video', date: '2026-06-08T10:30:00', amount: 80.55,  invoiceId: 'INV-2026-0101', interpreter: 'Maria Gonzalez'  },
  { id: 102, type: 'debit',  description: 'Audio session with John D.',              minutes: 30, sessionType: 'audio', date: '2026-06-07T14:15:00', amount: 44.70,  invoiceId: 'INV-2026-0100', interpreter: 'John Doe'         },
  { id: 103, type: 'credit', description: 'Wallet top-up via Visa •••• 4242',        amount: 200.00, date: '2026-06-05T09:00:00', invoiceId: null, interpreter: null },
  { id: 104, type: 'debit',  description: 'Video session with Sarah C.',             minutes: 60, sessionType: 'video', date: '2026-06-04T16:00:00', amount: 107.40, invoiceId: 'INV-2026-0099', interpreter: 'Sarah Chen'       },
  { id: 105, type: 'debit',  description: 'Audio session with Ahmed H.',             minutes: 20, sessionType: 'audio', date: '2026-06-03T11:20:00', amount: 29.80,  invoiceId: 'INV-2026-0098', interpreter: 'Ahmed Hassan'     },
  { id: 106, type: 'credit', description: 'Wallet top-up via Mastercard •••• 8888', amount: 150.00, date: '2026-06-01T08:30:00', invoiceId: null, interpreter: null },
  { id: 107, type: 'debit',  description: 'Video session with Maria G.',             minutes: 30, sessionType: 'video', date: '2026-05-28T13:00:00', amount: 53.70,  invoiceId: 'INV-2026-0097', interpreter: 'Maria Gonzalez'  },
  { id: 108, type: 'debit',  description: 'Audio session with John D.',              minutes: 45, sessionType: 'audio', date: '2026-05-25T10:00:00', amount: 67.05,  invoiceId: 'INV-2026-0096', interpreter: 'John Doe'         },
  { id: 109, type: 'credit', description: 'Refund — Session cancellation',           amount: 22.50,  date: '2026-05-20T15:00:00', invoiceId: 'CR-2026-0003', interpreter: null },
  { id: 110, type: 'debit',  description: 'Video session with Sarah C.',             minutes: 90, sessionType: 'video', date: '2026-05-18T09:30:00', amount: 161.10, invoiceId: 'INV-2026-0095', interpreter: 'Sarah Chen'       },
  { id: 111, type: 'debit',  description: 'Audio session with Maria G.',             minutes: 15, sessionType: 'audio', date: '2026-05-15T16:45:00', amount: 22.35,  invoiceId: 'INV-2026-0094', interpreter: 'Maria Gonzalez'  },
  { id: 112, type: 'credit', description: 'Wallet top-up via Visa •••• 4242',        amount: 277.50, date: '2026-05-10T11:00:00', invoiceId: null, interpreter: null },
];

const MOCK_CARDS = [
  { id: 1, last4: '4242', expiry: '12/28', type: 'VISA',       isDefault: true  },
  { id: 2, last4: '8888', expiry: '12/30', type: 'Mastercard', isDefault: false },
];

// FIX 2: Low balance threshold — warn client when balance drops below $50
const LOW_BALANCE_THRESHOLD = 50;

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7) return diffDays + ' days ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isToday(isoString)    { const d = new Date(isoString); const now = new Date(); return d.toDateString() === now.toDateString(); }
function isThisWeek(isoString) { const d = new Date(isoString); const now = new Date(); const diff = (now - d) / (1000 * 60 * 60 * 24); return diff >= 0 && diff < 7; }
function isThisMonth(isoString){ const d = new Date(isoString); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }

function exportCSV(transactions) {
  const headers = ['Date', 'Type', 'Description', 'Amount', 'Invoice ID', 'Interpreter'];
  const rows = transactions.map((t) => [new Date(t.date).toISOString(), t.type, t.description, t.amount.toFixed(2), t.invoiceId || '', t.interpreter || '']);
  const csv = [headers, ...rows].map((r) => r.map((c) => '"' + c + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'lingobridge-statement-' + new Date().toISOString().split('T')[0] + '.csv'; a.click(); URL.revokeObjectURL(url);
}

function exportPDF(transactions) {
  const rows = transactions.map(function(t) {
    return '<tr><td>' + formatDate(t.date) + '</td><td>' + t.type + '</td><td>' + t.description + '</td><td class="' + t.type + '">' + (t.type === 'credit' ? '+' : '-') + '$' + t.amount.toFixed(2) + '</td><td>' + (t.invoiceId || '-') + '</td></tr>';
  }).join('');
  const html = '<html><head><style>' +
    'body { font-family: system-ui; padding: 40px; color: #333; }' +
    'h1 { font-size: 24px; margin-bottom: 8px; }' +
    'p { color: #666; margin-bottom: 24px; }' +
    'table { width: 100%; border-collapse: collapse; }' +
    'th { text-align: left; padding: 12px; border-bottom: 2px solid #ddd; font-size: 12px; text-transform: uppercase; color: #666; }' +
    'td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }' +
    '.credit { color: #1D9E75; } .debit { color: #D85A30; }' +
    '</style></head><body>' +
    '<h1>LingoBridge Statement</h1><p>Generated on ' + new Date().toLocaleDateString() + '</p>' +
    '<table><tr><th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Invoice</th></tr>' + rows + '</table>' +
    '</body></html>';
  const win = window.open('', '_blank'); win.document.write(html); win.document.close(); win.print();
}

function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-slate-400" />
        <span className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-[18px] font-bold text-slate-900">{value}</p>
      {trend && <p className="text-[11px] text-slate-400 mt-1">{trend}</p>}
    </div>
  );
}

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 px-4 pb-4">
      <p className="text-[12px] text-slate-400">Page {current} of {total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(current - 1)} disabled={current === 1} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"><ChevronLeft size={16} /></button>
        {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => onChange(page)} className={"w-7 h-7 rounded-lg text-[12px] font-medium transition-colors " + (page === current ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}>{page}</button>
        ))}
        <button onClick={() => onChange(current + 1)} disabled={current === total} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

export default function Wallet() {
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy]         = useState('newest');
  const [page, setPage]             = useState(1);
  const [exporting, setExporting]   = useState(false);
  const perPage = 5;

  // Compute balance from all transactions (not filtered)
  const totalCredits  = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebits   = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const currentBalance = +(totalCredits - totalDebits).toFixed(2);

  // FIX 3: Detect negative balance so UI can show a proper error state
  const isNegative   = currentBalance < 0;
  const isLowBalance = !isNegative && currentBalance < LOW_BALANCE_THRESHOLD;

  const todayDebits  = transactions.filter((t) => t.type === 'debit'  && isToday(t.date)).reduce((s, t) => s + t.amount, 0);
  const todayCredits = transactions.filter((t) => t.type === 'credit' && isToday(t.date)).reduce((s, t) => s + t.amount, 0);
  const weekDebits   = transactions.filter((t) => t.type === 'debit'  && isThisWeek(t.date)).reduce((s, t) => s + t.amount, 0);
  const monthDebits  = transactions.filter((t) => t.type === 'debit'  && isThisMonth(t.date)).reduce((s, t) => s + t.amount, 0);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        (t.interpreter && t.interpreter.toLowerCase().includes(q)) ||
        (t.invoiceId && t.invoiceId.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== 'all') result = result.filter((t) => t.type === typeFilter);
    if (dateFilter !== 'all') result = result.filter((t) => {
      if (dateFilter === 'today') return isToday(t.date);
      if (dateFilter === 'week')  return isThisWeek(t.date);
      if (dateFilter === 'month') return isThisMonth(t.date);
      return true;
    });
    result.sort((a, b) => {
      const da = new Date(a.date); const db = new Date(b.date);
      if (sortBy === 'newest')      return db - da;
      if (sortBy === 'oldest')      return da - db;
      if (sortBy === 'amount_high') return b.amount - a.amount;
      if (sortBy === 'amount_low')  return a.amount - b.amount;
      return 0;
    });
    return result;
  }, [transactions, search, typeFilter, dateFilter, sortBy]);

  // FIX 4: Compute running balance for each transaction (chronological order)
  // So the transaction list can show "balance after this transaction"
  const transactionsWithRunning = useMemo(() => {
    const chrono = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;
    const map = {};
    chrono.forEach((t) => {
      running = +(running + (t.type === 'credit' ? t.amount : -t.amount)).toFixed(2);
      map[t.id] = running;
    });
    return map;
  }, [transactions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);

  const handleExport = (format) => {
    setExporting(true);
    setTimeout(() => { if (format === 'csv') exportCSV(filtered); else exportPDF(filtered); setExporting(false); }, 500);
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 mb-1">Wallet</h1>
          <p className="text-[13px] text-slate-400">Manage funds, transactions, and billing</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('csv')} disabled={exporting} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm">
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} CSV
          </button>
          <button onClick={() => handleExport('pdf')} disabled={exporting} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm">
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />} PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-700 transition-colors shadow-sm">
            <Plus size={12} /> Add Funds
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* FIX 5: Balance card — clearer label, explicit status states, no confusing "Reconciled" on negative */}
        <div className={"lg:col-span-1 rounded-2xl shadow-sm border p-6 " + (isNegative ? "bg-red-700 border-red-600" : "bg-[#1C1A2E] border-slate-200")}>
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-2">Available Balance</p>
          <p className={"text-[36px] font-bold tracking-tight " + (isNegative ? "text-white" : "text-white")}>
            {isNegative ? `-$${Math.abs(currentBalance).toFixed(2)}` : `$${currentBalance.toFixed(2)}`}
          </p>

          {/* FIX 6: Status label is now contextual — green=ready, amber=low, red=overdrawn */}
          <div className="flex items-center gap-1 mt-1">
            {isNegative ? (
              <>
                <AlertTriangle size={12} className="text-red-200" />
                <p className="text-[11px] text-red-200 font-medium">Overdrawn — please add funds</p>
              </>
            ) : isLowBalance ? (
              <>
                <AlertTriangle size={12} className="text-amber-300" />
                <p className="text-[11px] text-amber-300 font-medium">Low balance — top up soon</p>
              </>
            ) : (
              <>
                <Check size={12} className="text-emerald-400" />
                <p className="text-[11px] text-emerald-400">Ready to use</p>
              </>
            )}
          </div>

          {/* FIX 7: "Total in / out" relabeled to "Total topped up / Total spent" — unambiguous */}
          <p className="text-[11px] text-white/30 mt-3">Total topped up: ${totalCredits.toFixed(2)} · Total spent: ${totalDebits.toFixed(2)}</p>
          <p className="text-[11px] text-white/20 mt-1">Rates: Video ${RATES.video}/min · Audio ${RATES.audio}/min</p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Added today"      value={"$" + todayCredits.toFixed(2)} icon={TrendingUp}   trend={todayCredits > 0 ? 'Top-up received' : 'No deposits today'} />
          <StatCard label="Spent today"      value={"$" + todayDebits.toFixed(2)}  icon={TrendingDown} trend={transactions.filter((t) => t.type === 'debit' && isToday(t.date)).length + " sessions"} />
          <StatCard label="Spent this week"  value={"$" + weekDebits.toFixed(2)}   icon={Clock}        trend={transactions.filter((t) => t.type === 'debit' && isThisWeek(t.date)).length + " sessions"} />
          <StatCard label="Spent this month" value={"$" + monthDebits.toFixed(2)}  icon={Calendar}     trend={transactions.filter((t) => t.type === 'debit' && isThisMonth(t.date)).length + " sessions"} />
        </div>
      </div>

      {/* FIX 8: Low-balance banner shown inline, above transactions — actionable, not buried */}
      {(isNegative || isLowBalance) && (
        <div className={"flex items-center gap-3 rounded-xl px-4 py-3 mb-4 border " + (isNegative ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200")}>
          <AlertTriangle size={16} className={isNegative ? "text-red-500 shrink-0" : "text-amber-500 shrink-0"} />
          <p className={"text-[13px] font-medium " + (isNegative ? "text-red-700" : "text-amber-700")}>
            {isNegative
              ? "Your balance is overdrawn by $" + Math.abs(currentBalance).toFixed(2) + ". New sessions cannot be booked until funds are added."
              : "Your balance is running low ($" + currentBalance.toFixed(2) + " remaining). Add funds to avoid interruptions."}
          </p>
          <button className={"ml-auto shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold " + (isNegative ? "bg-red-600 text-white hover:bg-red-700" : "bg-amber-500 text-white hover:bg-amber-600") + " transition-colors"}>
            Add Funds
          </button>
        </div>
      )}

      {/* Upgrade nudge */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-slate-900">Save 20% — Monthly Plan</p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Unlimited sessions for $99/month. Currently paying ~${monthDebits > 0 ? monthDebits.toFixed(0) : "—"}/mo at pay-per-session rates.
            </p>
          </div>
          <button className="px-4 py-2 bg-violet-600 text-white text-[12px] font-medium rounded-xl hover:bg-violet-700 transition-colors shrink-0">Upgrade</button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-[14px] font-bold text-slate-900">Transactions</h2>
            <span className="text-[12px] text-slate-400">{filtered.length} of {transactions.length} total</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Search by description, interpreter, or invoice #..."
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400"
              />
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0">
              <option value="all">All Types</option><option value="debit">Debits Only</option><option value="credit">Credits Only</option>
            </select>
            <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setPage(1); }} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0">
              <option value="all">All Time</option><option value="today">Today</option><option value="week">This Week</option><option value="month">This Month</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0">
              <option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="amount_high">Amount (High → Low)</option><option value="amount_low">Amount (Low → High)</option>
            </select>
          </div>
        </div>

        {/* FIX 9: Table header row so "Balance After" column is clearly labeled */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-0 px-4 py-2 border-b border-slate-100 bg-slate-50">
          <div className="w-9" />
          <span className="text-[11px] text-slate-400 uppercase tracking-wider ml-3">Description</span>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider text-right pr-8 min-w-[100px]">Amount</span>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider text-right min-w-[110px]">Balance After</span>
        </div>

        <div className="divide-y divide-slate-100">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle size={32} className="text-slate-200 mb-3" />
              <p className="text-[14px] text-slate-400">No transactions match your filters</p>
              <button onClick={() => { setSearch(""); setTypeFilter("all"); setDateFilter("all"); setPage(1); }} className="text-[12px] text-violet-600 hover:text-violet-700 mt-2 transition-colors">Clear all filters</button>
            </div>
          ) : (
            paginated.map((t) => {
              const runningBal = transactionsWithRunning[t.id];
              return (
                <div key={t.id} className="grid grid-cols-[auto_1fr_auto_auto] sm:gap-0 gap-3 items-center p-4 hover:bg-slate-50 transition-colors">
                  <div className={"w-9 h-9 rounded-full flex items-center justify-center shrink-0 " + (t.type === 'credit' ? "bg-emerald-50" : "bg-slate-50")}>
                    {t.type === 'credit' ? <ArrowDownLeft size={16} className="text-emerald-500" /> : <ArrowUpRight size={16} className="text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0 ml-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-medium text-slate-900 truncate">{t.description}</p>
                      {t.invoiceId && (
                        <button onClick={() => alert("Download invoice " + t.invoiceId)} className="flex items-center gap-1 text-[10px] text-violet-600 hover:text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded transition-colors shrink-0">
                          <Receipt size={10} /> {t.invoiceId}
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(t.date)}</p>
                  </div>

                  {/* Transaction amount */}
                  <span className={"text-[13px] font-bold shrink-0 text-right pr-8 min-w-[100px] " + (t.type === 'credit' ? "text-emerald-500" : "text-slate-900")}>
                    {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
                  </span>

                  {/* FIX 10: Running balance after each transaction — eliminates need to mentally calculate */}
                  <span className={"text-[12px] shrink-0 text-right min-w-[110px] tabular-nums " + (runningBal < 0 ? "text-red-500 font-semibold" : runningBal < LOW_BALANCE_THRESHOLD ? "text-amber-500" : "text-slate-400")}>
                    {runningBal < 0 ? `-$${Math.abs(runningBal).toFixed(2)}` : `$${runningBal.toFixed(2)}`}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-bold text-slate-900">Payment Methods</h2>
          <button className="text-[12px] text-violet-600 hover:text-violet-700 font-medium transition-colors">+ Add Card</button>
        </div>
        <div className="space-y-2">
          {MOCK_CARDS.map((card) => (
            <div key={card.id} className={"flex items-center gap-3 p-3 rounded-xl border transition-colors " + (card.isDefault ? "bg-violet-50 border-violet-100" : "bg-slate-50 border-slate-100 hover:border-slate-200")}>
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                <CreditCard size={16} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-900">{card.type} •••• {card.last4}</p>
                <p className="text-[11px] text-slate-400">Expires {card.expiry}</p>
              </div>
              {card.isDefault
                ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 shrink-0">Default</span>
                : <button className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors shrink-0">Set Default</button>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}