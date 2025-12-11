
import React, { useState, useEffect } from 'react';
import { BookOpen, Scale, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import { getChartOfAccounts, getJournalEntries } from '../services/ledgerService';
import { Account, JournalEntry, AccountType } from '../types';

const GeneralLedger: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'coa' | 'journal'>('coa');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  useEffect(() => {
    setAccounts(getChartOfAccounts());
    setJournal(getJournalEntries());
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const totalAssets = accounts.filter(a => a.type === AccountType.ASSET).reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === AccountType.LIABILITY).reduce((s, a) => s + a.balance, 0);
  const totalEquity = accounts.filter(a => a.type === AccountType.EQUITY).reduce((s, a) => s + a.balance, 0);
  
  // Basic Net Income for Equity check (Rev - Exp)
  const revenue = accounts.filter(a => a.type === AccountType.REVENUE).reduce((s, a) => s + a.balance, 0);
  const expense = accounts.filter(a => a.type === AccountType.EXPENSE).reduce((s, a) => s + a.balance, 0);
  const calculatedEquity = totalEquity + (revenue - expense);

  const isBalanced = Math.abs(totalAssets - (totalLiabilities + calculatedEquity)) < 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">General Ledger</h2>
          <p className="text-slate-500">Double-entry bookkeeping engine.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isBalanced ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {isBalanced ? <Scale size={18} /> : <AlertCircle size={18} />}
            <span className="font-bold text-sm">{isBalanced ? 'Books Balanced' : 'Unbalanced'}</span>
        </div>
      </div>

      {/* Accounting Equation Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-32">
              <span className="text-indigo-200 font-bold tracking-wider text-xs">ASSETS</span>
              <span className="text-3xl font-bold">{formatCurrency(totalAssets)}</span>
          </div>
          <div className="flex items-center justify-center font-bold text-slate-400 text-2xl">=</div>
          <div className="grid grid-cols-2 gap-4">
               <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                  <span className="text-slate-400 font-bold tracking-wider text-xs">LIABILITIES</span>
                  <span className="text-xl font-bold text-slate-700">{formatCurrency(totalLiabilities)}</span>
               </div>
               <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                  <span className="text-slate-400 font-bold tracking-wider text-xs">EQUITY</span>
                  <span className="text-xl font-bold text-slate-700">{formatCurrency(calculatedEquity)}</span>
               </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200">
        <button 
            onClick={() => setActiveTab('coa')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'coa' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <BookOpen size={16} /> Chart of Accounts
        </button>
        <button 
            onClick={() => setActiveTab('journal')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'journal' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <FileText size={16} /> Journal Entries
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'coa' && (
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Code</th>
                        <th className="px-6 py-4 font-semibold">Account Name</th>
                        <th className="px-6 py-4 font-semibold">Type</th>
                        <th className="px-6 py-4 font-semibold text-right">Balance</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                    {accounts.sort((a,b) => a.code.localeCompare(b.code)).map(acc => (
                        <tr key={acc.code} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-mono text-slate-600">{acc.code}</td>
                            <td className="px-6 py-3 font-bold text-slate-700">{acc.name}</td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                    acc.type === AccountType.ASSET ? 'bg-green-50 text-green-700 border-green-100' :
                                    acc.type === AccountType.LIABILITY ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    acc.type === AccountType.EQUITY ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                    acc.type === AccountType.REVENUE ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                    {acc.type}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-right font-mono font-medium">
                                {formatCurrency(acc.balance)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}

        {activeTab === 'journal' && (
             <div className="divide-y divide-slate-100">
                {journal.map(je => (
                    <div key={je.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between mb-4">
                            <div>
                                <h4 className="font-bold text-slate-800">{je.description}</h4>
                                <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                    <span>{je.date}</span>
                                    <span>•</span>
                                    <span className="font-mono">ID: {je.id}</span>
                                    {je.reference && <span>• Ref: {je.reference}</span>}
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold h-fit">POSTED</span>
                        </div>
                        
                        <div className="bg-slate-50 rounded border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 text-xs text-slate-500 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Account</th>
                                        <th className="px-4 py-2 text-right w-32">Debit</th>
                                        <th className="px-4 py-2 text-right w-32">Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {je.lines.map((line, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                                            <td className="px-4 py-2 text-slate-700 font-mono">
                                                {line.accountId} - {line.accountName}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-600 font-mono">
                                                {line.debit ? formatCurrency(line.debit) : ''}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-600 font-mono">
                                                {line.credit ? formatCurrency(line.credit) : ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
             </div>
        )}
      </div>
    </div>
  );
};

export default GeneralLedger;
