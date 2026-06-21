import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowUpRight, ArrowDownLeft, CreditCard, Zap, Search,
  Download, FileText, Calendar, ChevronLeft, ChevronRight, Check,
  AlertCircle, Receipt, Plus, TrendingDown, TrendingUp, Clock,
  Loader2, AlertTriangle, WalletIcon, ArrowRight, X, Filter
} from 'lucide-react';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

// ─── API Functions ──────────────────────────────────────────────────────────
const fetchWalletData = async () => {
  const { data } = await api.get('/v1/wallet');
  return data;
};

const fetchTransactions = async ({ page, limit, search, typeFilter, dateFilter, sortBy }) => {
  const { data } = await api.get('/v1/wallet/transactions', {
    params: { page, limit, search, type: typeFilter, dateFilter, sort: sortBy }
  });
  return data;
};

const fetchPaymentMethods = async () => {
  const { data } = await api.get('/v1/wallet/payment-methods');
  return data.methods;
};

const topUpWallet = async ({ amount, paymentMethodId }) => {
  const { data } = await api.post('/v1/wallet/top-up', { amount, paymentMethodId });
  return data;
};

const exportTransactions = async ({ format, filters }) => {
  const { data } = await api.post('/v1/wallet/export', { format, filters }, {
    responseType: format === 'csv' ? 'blob' : 'json'
  });
  return data;
};

const downloadInvoice = async (invoiceId) => {
  const { data } = await api.get(`/v1/invoices/${invoiceId}/download`, { responseType: 'blob' });
  return data;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const LOW_BALANCE_THRESHOLD = 50;
const PER_PAGE = 10;

// ─── Utility Functions ──────────────────────────────────────────────────────
function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7) return diffDays + ' days ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isToday(isoString) {
  if (!isoString) return false;
  const d = new Date(isoString);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(isoString) {
  if (!isoString) return false;
  const d = new Date(isoString);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < 7;
}

function isThisMonth(isoString) {
  if (!isoString) return false;
  const d = new Date(isoString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, trend, onClick, loading }) {
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
        <p className="text-[18px] font-bold text-slate-900">{value}</p>
      )}
      {trend && <p className="text-[11px] text-slate-400 mt-1">{trend}</p>}
    </div>
  );
}

// ─── Top Up Modal ─────────────────────────────────────────────────────────────
function TopUpModal({ isOpen, onClose, paymentMethods, onTopUp }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [step, setStep] = useState('amount'); // 'amount', 'confirm', 'processing', 'success'

  const presetAmounts = [25, 50, 100, 200, 500];
  const parsedAmount = parseFloat(amount);
  const isValid = parsedAmount >= 10 && parsedAmount <= 10000;

  const mutation = useMutation({
    mutationFn: topUpWallet,
    onSuccess: () => {
      setStep('success');
      setTimeout(() => { onClose(); setStep('amount'); setAmount(''); }, 2000);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Payment failed');
      setStep('amount');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl">
        {step === 'amount' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-slate-900">Add Funds</h3>
              <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-slate-50 text-slate-400"><X size={18} /></button>
            </div>

            <div className="mb-6">
              <label htmlFor="add-funds-amount" className="text-[12px] font-medium text-slate-600 mb-2 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-slate-400">$</span>
                <input
                  id="add-funds-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="10"
                  max="10000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-[24px] font-bold text-slate-900 focus:outline-none focus:border-violet-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Min $10 · Max $10,000</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {presetAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={`py-2.5 rounded-xl text-[14px] font-medium border transition-colors ${
                    amount === amt.toString() 
                      ? 'bg-violet-600 text-white border-violet-600' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-violet-200'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="text-[12px] font-medium text-slate-600 mb-2 block">Payment Method</label>
              {!paymentMethods?.length ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-[13px] text-slate-500 mb-2">No payment methods saved</p>
                  <button 
                    onClick={() => { onClose(); navigate('/wallet/payment-methods'); }}
                    className="text-[13px] text-violet-600 font-medium hover:text-violet-700"
                  >
                    Add payment method
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                        selectedMethod === method.id 
                          ? 'bg-violet-50 border-violet-200' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard size={20} className="text-slate-400" />
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-slate-900">{method.type} •••• {method.last4}</p>
                        <p className="text-[11px] text-slate-400">Expires {method.expiry}</p>
                      </div>
                      {selectedMethod === method.id && <Check size={16} className="text-violet-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setStep('confirm')}
              disabled={!isValid || !selectedMethod}
              className="w-full py-3 rounded-xl bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-6">
            <h3 className="text-[18px] font-bold text-slate-900 mb-4">Confirm Top-Up</h3>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Amount</span>
                <span className="font-semibold text-slate-900">${parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-500">Fee</span>
                <span className="font-semibold text-slate-900">$0.00</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between text-[14px]">
                <span className="font-medium text-slate-900">Total</span>
                <span className="font-bold text-slate-900">${parsedAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setStep('amount')} 
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-[14px] font-medium hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => { setStep('processing'); mutation.mutate({ amount: parsedAmount, paymentMethodId: selectedMethod }); }}
                disabled={mutation.isPending}
                className="flex-1 py-3 rounded-xl bg-violet-600 text-white text-[14px] font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {mutation.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirm Payment'}
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 text-center">
            <Loader2 size={40} className="text-violet-600 animate-spin mx-auto mb-4" />
            <p className="text-[16px] font-medium text-slate-900">Processing payment...</p>
            <p className="text-[13px] text-slate-400 mt-1">Please do not close this window</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-emerald-500" />
            </div>
            <p className="text-[18px] font-bold text-slate-900 mb-1">Payment Successful!</p>
            <p className="text-[14px] text-slate-500">${parsedAmount.toFixed(2)} has been added to your wallet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pagination Helper ─────────────────────────────────────────────────────────
function getPaginationRange(currentPage, totalPages, windowSize = 5) {
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  let end   = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ─── Main Wallet Component ────────────────────────────────────────────────────
export default function Wallet() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: fetchWalletData,
    staleTime: 30000,
  });

  const { data: transactionsData, isLoading: txLoading } = useQuery({
    queryKey: ['wallet-transactions', page, typeFilter, dateFilter, sortBy, debouncedSearch],
    queryFn: () => fetchTransactions({ page, limit: PER_PAGE, search: debouncedSearch, typeFilter, dateFilter, sortBy }),
    staleTime: 30000,
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
    staleTime: 60000,
  });

  const balance = walletData?.balance ?? 0;
  const isNegative = balance < 0;
  const isLowBalance = !isNegative && balance < LOW_BALANCE_THRESHOLD;

  const transactions = transactionsData?.transactions ?? [];
  const totalPages = transactionsData?.totalPages ?? 1;
  const totalCount = transactionsData?.totalCount ?? 0;

  const stats = walletData?.stats ?? {};

  const handleExport = useCallback(async (format) => {
    setExporting(true);
    try {
      const result = await exportTransactions({
        format,
        filters: { typeFilter, dateFilter, search: debouncedSearch }
      });

      const blob = new Blob([result], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallet-statement-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Failed to export');
    } finally {
      setExporting(false);
    }
  }, [typeFilter, dateFilter, debouncedSearch]);

  const handleDownloadInvoice = useCallback(async (invoiceId) => {
    try {
      const blob = await downloadInvoice(invoiceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  }, []);

  if (walletLoading && !walletData) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-slate-200 rounded w-32 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="lg:col-span-2 h-40 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 mb-1">Wallet</h1>
          <p className="text-[13px] text-slate-400">Manage funds, transactions, and billing</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleExport('csv')} 
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} CSV
          </button>
          <button 
            onClick={() => handleExport('pdf')} 
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            {exporting ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />} PDF
          </button>
          <button 
            onClick={() => setShowTopUp(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-700 transition-colors shadow-sm"
          >
            <Plus size={12} /> Add Funds
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Balance Card */}
        <div className={`lg:col-span-1 rounded-2xl shadow-sm border p-6 ${isNegative ? "bg-red-700 border-red-600" : "bg-[#1C1A2E] border-slate-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-white/40 uppercase tracking-wider">Available Balance</p>
            <WalletIcon size={16} className="text-white/20" />
          </div>
          <p className={`text-[36px] font-bold tracking-tight ${isNegative ? "text-white" : "text-white"}`}>
            {isNegative ? `-$${Math.abs(balance).toFixed(2)}` : `$${balance.toFixed(2)}`}
          </p>

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

          <p className="text-[11px] text-white/30 mt-3">
            Total topped up: ${stats.totalCredits?.toFixed(2) ?? '0.00'} · Total spent: ${stats.totalDebits?.toFixed(2) ?? '0.00'}
          </p>
          <p className="text-[11px] text-white/20 mt-1">
            Rates: Video ${stats.videoRate ?? '1.79'}/min · Audio ${stats.audioRate ?? '1.49'}/min
          </p>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard 
            label="Added today" 
            value={`$${stats.todayCredits?.toFixed(2) ?? '0.00'}`} 
            icon={TrendingUp} 
            trend={stats.todayCredits > 0 ? 'Top-up received' : 'No deposits today'}
            loading={walletLoading}
          />
          <StatCard 
            label="Spent today" 
            value={`$${stats.todayDebits?.toFixed(2) ?? '0.00'}`} 
            icon={TrendingDown} 
            trend={`${stats.todaySessions ?? 0} sessions`}
            loading={walletLoading}
          />
          <StatCard 
            label="Spent this week" 
            value={`$${stats.weekDebits?.toFixed(2) ?? '0.00'}`} 
            icon={Clock} 
            trend={`${stats.weekSessions ?? 0} sessions`}
            loading={walletLoading}
          />
          <StatCard 
            label="Spent this month" 
            value={`$${stats.monthDebits?.toFixed(2) ?? '0.00'}`} 
            icon={Calendar} 
            trend={`${stats.monthSessions ?? 0} sessions`}
            loading={walletLoading}
          />
        </div>
      </div>

      {/* Low Balance Warning */}
      {(isNegative || isLowBalance) && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-6 border ${isNegative ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
          <AlertTriangle size={16} className={isNegative ? "text-red-500 shrink-0" : "text-amber-500 shrink-0"} />
          <p className={`text-[13px] font-medium ${isNegative ? "text-red-700" : "text-amber-700"}`}>
            {isNegative
              ? `Your balance is overdrawn by $${Math.abs(balance).toFixed(2)}. New sessions cannot be booked until funds are added.`
              : `Your balance is running low ($${balance.toFixed(2)} remaining). Add funds to avoid interruptions.`}
          </p>
          <button 
            onClick={() => setShowTopUp(true)}
            className={`ml-auto shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold ${isNegative ? "bg-red-600 text-white hover:bg-red-700" : "bg-amber-500 text-white hover:bg-amber-600"} transition-colors`}
          >
            Add Funds
          </button>
        </div>
      )}

      {/* Upgrade Nudge */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-slate-900">Save 20% — Monthly Plan</p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Unlimited sessions for $99/month. Currently paying ~${stats?.monthDebits > 0 ? `$${stats.monthDebits.toFixed(0)}` : '$0'}/mo at pay-per-session rates.
            </p>
          </div>
          <button 
            onClick={() => navigate('/subscription')}
            className="px-4 py-2 bg-violet-600 text-white text-[12px] font-medium rounded-xl hover:bg-violet-700 transition-colors shrink-0"
          >
            Upgrade
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h2 className="text-[14px] font-bold text-slate-900">Transactions</h2>
            <span className="text-[12px] text-slate-400">{totalCount} total</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" 
                aria-label="Search by description, interpreter, or invoice number"
                placeholder="Search by description, interpreter, or invoice #..."
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-400"
              />
            </div>
            <select 
              aria-label="Filter by type"
              value={typeFilter} 
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0"
            >
              <option value="all">All Types</option>
              <option value="debit">Debits Only</option>
              <option value="credit">Credits Only</option>
              <option value="refund">Refunds Only</option>
            </select>
            <select 
              aria-label="Filter by date"
              value={dateFilter} 
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select 
              aria-label="Sort transactions"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-900 focus:outline-none appearance-none cursor-pointer shrink-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Amount (High → Low)</option>
              <option value="amount_low">Amount (Low → High)</option>
            </select>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-0 px-4 py-2 border-b border-slate-100 bg-slate-50">
          <div className="w-9" />
          <span className="text-[11px] text-slate-400 uppercase tracking-wider ml-3">Description</span>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider text-right pr-8 min-w-[100px]">Amount</span>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider text-right min-w-[110px]">Balance After</span>
        </div>

        <div className="divide-y divide-slate-100">
          {txLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-2 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle size={32} className="text-slate-200 mb-3" />
              <p className="text-[14px] text-slate-400">No transactions match your filters</p>
              <button 
                onClick={() => { setSearch(""); setTypeFilter("all"); setDateFilter("all"); setPage(1); }}
                className="text-[12px] text-violet-600 hover:text-violet-700 mt-2 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="grid grid-cols-[auto_1fr_auto_auto] sm:gap-0 gap-3 items-center p-4 hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${t.type === 'credit' || t.type === 'refund' ? "bg-emerald-50" : "bg-slate-50"}`}>
                  {t.type === 'credit' || t.type === 'refund' ? (
                    <ArrowDownLeft size={16} className="text-emerald-500" />
                  ) : (
                    <ArrowUpRight size={16} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 ml-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-medium text-slate-900 truncate">{t.description}</p>
                    {t.invoiceId && (
                      <button 
                        onClick={() => handleDownloadInvoice(t.invoiceId)}
                        className="flex items-center gap-1 text-[10px] text-violet-600 hover:text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded transition-colors shrink-0"
                      >
                        <Receipt size={10} /> {t.invoiceId}
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(t.date)}</p>
                </div>

                <span className={`text-[13px] font-bold shrink-0 text-right pr-8 min-w-[100px] ${t.type === 'credit' || t.type === 'refund' ? "text-emerald-500" : "text-slate-900"}`}>
                  {t.type === 'credit' || t.type === 'refund' ? '+' : '-'}${t.amount.toFixed(2)}
                </span>

                <span className={`text-[12px] shrink-0 text-right min-w-[110px] tabular-nums ${t.runningBalance < 0 ? "text-red-500 font-semibold" : t.runningBalance < LOW_BALANCE_THRESHOLD ? "text-amber-500" : "text-slate-400"}`}>
                  {t.runningBalance < 0 ? `-$${Math.abs(t.runningBalance).toFixed(2)}` : `$${t.runningBalance.toFixed(2)}`}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 px-4 pb-4">
            <p className="text-[12px] text-slate-400">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {getPaginationRange(page, totalPages).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-colors ${page === p ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-bold text-slate-900">Payment Methods</h2>
          <button 
            onClick={() => navigate('/wallet/payment-methods')}
            className="text-[12px] text-violet-600 hover:text-violet-700 font-medium transition-colors"
          >
            + Add Card
          </button>
        </div>
        <div className="space-y-2">
          {paymentMethods?.map((card) => (
            <div key={card.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${card.isDefault ? "bg-violet-50 border-violet-100" : "bg-slate-50 border-slate-100 hover:border-slate-200"}`}>
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                <CreditCard size={16} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-900">{card.type} •••• {card.last4}</p>
                <p className="text-[11px] text-slate-400">Expires {card.expiry}</p>
              </div>
              {card.isDefault ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 shrink-0">Default</span>
              ) : (
                <button className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors shrink-0">Set Default</button>
              )}
            </div>
          )) ?? (
            <div className="text-center py-6">
              <CreditCard size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-[13px] text-slate-400">No payment methods saved</p>
              <button 
                onClick={() => navigate('/wallet/payment-methods')}
                className="text-[12px] text-violet-600 hover:text-violet-700 mt-2 transition-colors"
              >
                Add your first payment method
              </button>
            </div>
          )}
        </div>
      </div>

      <TopUpModal 
        isOpen={showTopUp} 
        onClose={() => setShowTopUp(false)} 
        paymentMethods={paymentMethods}
        onTopUp={() => queryClient.invalidateQueries({ queryKey: ['wallet'] })}
      />
    </div>
  );
}


