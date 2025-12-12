
import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, TrendingUp, Clock, ShoppingBag, Coffee, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { getTransactions, addTransactions } from '../services/mockDataService';
import { postTransactionToLedger } from '../services/ledgerService';

const QuickExpense: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Meals & Entertainment');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recentEntries, setRecentEntries] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  const [success, setSuccess] = useState(false);

  // Load Data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const allTxs = getTransactions();
    
    // Filter for Expenses only
    const expenses = allTxs.filter(t => t.type === TransactionType.EXPENSE);
    
    // Calculate Summaries
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const stats = {
        daily: expenses.filter(t => t.date === todayStr).reduce((sum, t) => sum + t.amount, 0),
        weekly: expenses.filter(t => new Date(t.date) >= startOfWeek).reduce((sum, t) => sum + t.amount, 0),
        monthly: expenses.filter(t => new Date(t.date) >= startOfMonth).reduce((sum, t) => sum + t.amount, 0),
        yearly: expenses.filter(t => new Date(t.date) >= startOfYear).reduce((sum, t) => sum + t.amount, 0),
    };

    setSummary(stats);

    // Get recent manual entries
    const manual = allTxs.filter(t => t.source === 'Manual').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    setRecentEntries(manual);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const newTx: Transaction = {
      id: `tx_manual_${Date.now()}`,
      date: date,
      description: description,
      amount: parseFloat(amount),
      currency: 'USD',
      type: TransactionType.EXPENSE,
      category: category,
      status: TransactionStatus.COMPLETED,
      source: 'Manual',
      reconciliation: { status: 'UNRECONCILED' }, // Needs receipt matching later
      notes: 'Quick entry via Mobile'
    };

    // 1. Add to Transaction Store
    addTransactions([newTx]);
    
    // 2. Post to Ledger immediately (Real-time P&L update)
    postTransactionToLedger(newTx);

    // Reset and Refresh
    setAmount('');
    setDescription('');
    setCategory('Meals & Entertainment');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    refreshData();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Quick Expense</h2>
          <p className="text-slate-500">Record spending on the go.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2">
            <Clock size={14} /> Real-time Ledger Sync
        </div>
      </div>

      {/* SPEND PULSE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Today" amount={summary.daily} icon={Coffee} color="blue" />
          <SummaryCard label="This Week" amount={summary.weekly} icon={Calendar} color="indigo" />
          <SummaryCard label="This Month" amount={summary.monthly} icon={ShoppingBag} color="purple" />
          <SummaryCard label="YTD Total" amount={summary.yearly} icon={TrendingUp} color="slate" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ENTRY FORM */}
          <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <Plus size={20} className="text-indigo-400" /> New Entry
                      </h3>
                      {success && (
                          <span className="text-green-400 text-sm font-bold flex items-center gap-1 animate-in fade-in slide-in-from-right">
                              <CheckCircle2 size={16} /> Saved
                          </span>
                      )}
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                      
                      {/* Amount */}
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Amount Spent</label>
                          <div className="relative">
                              <span className="absolute left-4 top-4 text-slate-400 text-xl font-bold">$</span>
                              <input 
                                type="number" 
                                step="0.01"
                                required
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-slate-800 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                              />
                          </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">Merchant / Description</label>
                              <input 
                                type="text" 
                                required
                                placeholder="e.g. Starbucks, Uber"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                              <input 
                                type="date" 
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                              />
                          </div>
                      </div>

                      {/* Category */}
                      <div>
                          <label className="block text-sm font-medium text-slate-600 mb-2">Category</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {['Meals & Entertainment', 'Travel', 'Office Supplies', 'Auto & Gas', 'Software', 'Other'].map(cat => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                        category === cat 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                    }`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                      >
                          <Plus size={24} /> Record Expense
                      </button>
                  </form>
              </div>
          </div>

          {/* RECENT FEED */}
          <div>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" /> Recent Entries
              </h3>
              <div className="space-y-3">
                  {recentEntries.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
                          No manual entries yet.
                      </div>
                  ) : (
                      recentEntries.map(entry => (
                          <div key={entry.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                              <div>
                                  <p className="font-bold text-slate-800">{entry.description}</p>
                                  <p className="text-xs text-slate-500">{entry.date} • {entry.category}</p>
                              </div>
                              <span className="font-bold text-slate-900">-${entry.amount.toFixed(2)}</span>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, amount, icon: Icon, color }: any) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        slate: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]} flex flex-col justify-between h-28`}>
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase opacity-70">{label}</span>
                <Icon size={18} />
            </div>
            <span className="text-2xl font-bold">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
    );
};

export default QuickExpense;
