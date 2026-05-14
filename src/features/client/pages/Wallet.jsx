import React from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, CreditCard, Zap } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

// Stats object at top of file for easy future data wiring
const stats = {
  totalSpent: 150.00,
  totalAdded: 104.40,
};

export default function Wallet() {
  const { balance } = useWallet();
  const currentBalance = balance ?? 0;

  const transactions = [
    { id: 1, type: 'debit', description: 'Video session with Maria G.', amount: 32.50, date: 'Jan 15, 2024' },
    { id: 2, type: 'debit', description: 'Audio session with John D.', amount: 22.00, date: 'Jan 12, 2024' },
    { id: 3, type: 'credit', description: 'Wallet top-up', amount: 50.00, date: 'Jan 10, 2024' },
    { id: 4, type: 'debit', description: 'Video session with Sarah C.', amount: 45.00, date: 'Jan 08, 2024' },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Balance Card - using brand token */}
      <div className="card bg-lb-primary text-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <WalletIcon className="w-5 h-5 text-white/80" />
              <span className="text-sm text-white/80">Available Balance</span>
            </div>
            <p className="text-3xl font-bold">${currentBalance.toFixed(2)}</p>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            Add Funds
          </button>
        </div>
      </div>

      {/* Upsell Banner - moved from Sidebar, contextually relevant here */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
          <Zap className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">Save 20% — Monthly Plan</p>
          <p className="text-xs text-slate-500">Unlimited sessions for $99/month</p>
        </div>
        <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors">
          Upgrade
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-500">Total Added</span>
          </div>
          <p className="text-lg font-bold text-slate-800">${stats.totalAdded.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            {/* FIX: Use ArrowDownRight directly instead of rotate-90 hack */}
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-slate-500">Total Spent</span>
          </div>
          <p className="text-lg font-bold text-slate-800">${stats.totalSpent.toFixed(2)}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                t.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {t.type === 'credit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-800">{t.description}</p>
                <p className="text-xs text-slate-400">{t.date}</p>
              </div>
              <p className={`text-sm font-semibold ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Payment Methods</h3>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
          <CreditCard className="w-5 h-5 text-slate-400" />
          <div className="flex-1">
            <p className="text-sm text-slate-800">•••• 4242</p>
            <p className="text-xs text-slate-400">Expires 12/25</p>
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Default</span>
        </div>
      </div>
    </div>
  );
}
