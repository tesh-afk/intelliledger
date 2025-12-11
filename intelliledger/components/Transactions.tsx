
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionStatus, TransactionType, MatchCandidate } from '../types';
import { getTransactions, MOCK_RECEIPTS, MOCK_INVOICES, delay, updateTransaction } from '../services/mockDataService';
import { runCategorizationPipeline } from '../services/categorizationService';
import { findReconciliationMatches, autoReconcileAll } from '../services/reconciliationService';
import { Wand2, CheckCircle2, AlertCircle, RefreshCw, Link2, FileText, Receipt, Split, Globe, Sparkles, Zap, CheckCheck, Filter, ListFilter } from 'lucide-react';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [queueMode, setQueueMode] = useState(false); // Admin Queue Mode
  
  // Reconciliation Modal State
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [processingMatch, setProcessingMatch] = useState(false);

  // Load transactions from dynamic store
  useEffect(() => {
    // In a real app, subscribe to store changes
    const load = () => {
        const allTx = getTransactions();
        if (queueMode) {
            // Filter for items needing attention
            setTransactions(allTx.filter(t => 
                t.status !== TransactionStatus.COMPLETED || 
                t.reconciliation.status === 'UNRECONCILED' ||
                t.category === 'Uncategorized'
            ));
        } else {
            setTransactions(allTx);
        }
    };
    load();
    const interval = setInterval(load, 2000); // Polling for updates from other services
    return () => clearInterval(interval);
  }, [queueMode]);

  // --- ACTIONS ---

  const handleAutoCategorize = async () => {
    setLoading(true);
    // Fetch fresh to ensure we don't overwrite
    const currentTxList = getTransactions(); 
    const updatedTransactions = [...currentTxList];
    let processedCount = 0;

    for (let i = 0; i < updatedTransactions.length; i++) {
        const tx = updatedTransactions[i];
        if (tx.category === 'Uncategorized' || !tx.category) {
            await delay(150); // Fast mock delay
            
            // Call the Rules -> AI Pipeline
            const result = await runCategorizationPipeline(tx.description, tx.amount);
            
            const newTx = {
                ...tx,
                category: result.category,
                notes: result.source === 'RULE' ? 'Categorized by Rule' : 'Categorized by AI', 
                reconciliation: { ...tx.reconciliation, autoMatchConfidence: result.confidence },
                status: TransactionStatus.COMPLETED
            };
            
            updatedTransactions[i] = newTx;
            updateTransaction(newTx); // Persist
            processedCount++;
            
            // Update local state for visual feedback if we are looking at this list
            if (queueMode) {
               // In queue mode, we might remove it if it is now complete? 
               // For now, keep it to show progress, user can toggle.
            }
        }
    }
    setTransactions(queueMode ? updatedTransactions.filter(t => t.reconciliation.status === 'UNRECONCILED') : updatedTransactions);
    setLoading(false);
  };

  const handleAutoReconcile = async () => {
      setReconciling(true);
      await delay(1000); // Simulate crunching data
      const currentTxList = getTransactions();
      
      const { updatedTransactions, matchCount } = autoReconcileAll(currentTxList, MOCK_RECEIPTS, MOCK_INVOICES);
      
      // Persist updates
      updatedTransactions.forEach(tx => updateTransaction(tx));
      
      if (queueMode) {
          setTransactions(updatedTransactions.filter(t => t.reconciliation.status === 'UNRECONCILED'));
      } else {
          setTransactions(updatedTransactions);
      }
      
      setReconciling(false);
      if (matchCount > 0) alert(`Auto-matched ${matchCount} transactions with high confidence.`);
      else alert("No new high-confidence matches found.");
  };

  const openReconcileModal = (tx: Transaction) => {
    setSelectedTransaction(tx);
    // @ts-ignore - mock data passing for strict type check in real app
    const matches = findReconciliationMatches(tx, MOCK_RECEIPTS, MOCK_INVOICES);
    setCandidates(matches);
    setReconcileModalOpen(true);
  };

  const handleConfirmMatch = async (candidate: MatchCandidate) => {
    setProcessingMatch(true);
    await delay(600); // Simulate processing
    
    const updatedTx = {
          ...selectedTransaction!,
          reconciliation: {
            status: 'RECONCILED',
            matchedRecordId: candidate.id,
            matchedRecordType: candidate.type
          },
          notes: candidate.feeAmount ? `Split: $${candidate.feeAmount} to Bank Fees` : selectedTransaction!.notes
    } as Transaction;
    
    updateTransaction(updatedTx); // Persist to store

    setProcessingMatch(false);
    setReconcileModalOpen(false);
    setSelectedTransaction(null);
    
    // Refresh list
    const fresh = getTransactions();
    if (queueMode) {
        setTransactions(fresh.filter(t => t.reconciliation.status === 'UNRECONCILED'));
    } else {
        setTransactions(fresh);
    }
  };

  const renderSourceIcon = (notes?: string) => {
      if (notes?.includes('Rule')) return <span title="Rule-based Match"><Zap size={14} className="text-amber-500 fill-amber-100" /></span>;
      if (notes?.includes('AI')) return <span title="AI Prediction"><Sparkles size={14} className="text-indigo-500 fill-indigo-100" /></span>;
      return null;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800">Transactions</h2>
           <p className="text-slate-500">Review, categorize, and reconcile.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setQueueMode(!queueMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-sm border ${
                    queueMode 
                    ? 'bg-amber-50 border-amber-200 text-amber-700' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
            >
                <ListFilter size={18} />
                <span>{queueMode ? 'Exit Queue Mode' : 'Reconciliation Queue'}</span>
            </button>
            <div className="w-px h-8 bg-slate-300 mx-1 hidden md:block"></div>
            <button 
              onClick={handleAutoReconcile}
              disabled={reconciling}
              className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-70 shadow-sm"
            >
              {reconciling ? <RefreshCw className="animate-spin" size={18} /> : <CheckCheck size={18} />}
              <span>{reconciling ? 'Matching...' : 'Auto-Match'}</span>
            </button>
            <button 
              onClick={handleAutoCategorize}
              disabled={loading}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-70 shadow-md"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
              <span>{loading ? 'AI Processing...' : 'Auto-Categorize'}</span>
            </button>
        </div>
      </div>
      
      {queueMode && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-3 text-sm text-amber-800">
              <AlertCircle size={18} className="mt-0.5" />
              <div>
                  <strong>Admin Reconciliation Queue Active</strong>
                  <p>Displaying only transactions that require categorization or reconciliation logic. Completed items are hidden.</p>
              </div>
          </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Date</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Description</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Amount</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Category</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Reconciliation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
                <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                        {queueMode ? 'All transactions reconciled! Good job.' : 'No transactions found.'}
                    </td>
                </tr>
            ) : (
                transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-sm">{tx.date}</td>
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{tx.description}</div>
                        {/* Multi-currency Display */}
                        {tx.originalAmount && (
                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                <Globe size={10} className="mr-1" />
                                {/* @ts-ignore mock prop */}
                                {tx.originalCurrency || 'GBP'} {tx.originalAmount.toFixed(2)} @ {tx.fxRate}
                            </div>
                        )}
                        {tx.notes && <div className="text-xs text-slate-400 mt-0.5">{tx.notes}</div>}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-slate-800'}`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            tx.category === 'Uncategorized' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'
                        }`}>
                            {tx.category}
                        </span>
                        {renderSourceIcon(tx.notes)}
                    </div>
                    </td>
                    <td className="px-6 py-4">
                    {tx.status === TransactionStatus.COMPLETED ? (
                        <CheckCircle2 className="text-green-500" size={20} />
                    ) : (
                        <div className="flex items-center gap-1 text-orange-500">
                           <AlertCircle size={18} />
                           <span className="text-xs font-medium">Pending</span>
                        </div>
                    )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        {tx.reconciliation.status === 'RECONCILED' || tx.reconciliation.status === 'MATCHED' ? (
                            <div className="flex items-center justify-end space-x-1 text-green-600" title={tx.reconciliation.status}>
                                <Link2 size={16} />
                                <span className="text-sm font-medium">{tx.reconciliation.status === 'MATCHED' ? 'Auto-Matched' : 'Reconciled'}</span>
                            </div>
                        ) : (
                            <button 
                                onClick={() => openReconcileModal(tx)}
                                className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
                            >
                                <Split size={14} />
                                <span>Reconcile</span>
                            </button>
                        )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* RECONCILIATION MODAL */}
      {reconcileModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800">Reconcile Transaction</h3>
                  <button onClick={() => setReconcileModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <span className="sr-only">Close</span>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
              
              <div className="p-6">
                 {/* Transaction Summary */}
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Bank Transaction</p>
                        <h4 className="font-bold text-slate-800 text-lg">{selectedTransaction.description}</h4>
                        <p className="text-slate-600">{selectedTransaction.date}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-800">${selectedTransaction.amount.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">USD</p>
                    </div>
                 </div>

                 {/* Matches */}
                 <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                    <Wand2 size={16} className="mr-2 text-indigo-500" />
                    Suggested Matches
                 </h4>
                 
                 <div className="space-y-3">
                    {candidates.length > 0 ? (
                        candidates.map(candidate => (
                            <div key={candidate.id} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-500 transition-colors cursor-pointer group bg-white">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-lg ${candidate.type === 'RECEIPT' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {candidate.type === 'RECEIPT' ? <Receipt size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-bold text-slate-800">{candidate.entityName}</h5>
                                                {candidate.score > 0.8 && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">High Match</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500">{candidate.type} • {candidate.date}</p>
                                            <p className="text-xs text-slate-400 mt-1">{candidate.reason}</p>
                                            
                                            {/* Fee Split UI */}
                                            {candidate.feeAmount && (
                                                <div className="mt-2 flex items-center text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                                    <AlertCircle size={12} className="mr-1" />
                                                    Split: ${candidate.feeAmount.toFixed(2)} fees will be categorized separately.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="font-bold text-slate-800">${candidate.amount.toFixed(2)}</span>
                                        <button 
                                            onClick={() => handleConfirmMatch(candidate)}
                                            disabled={processingMatch}
                                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {processingMatch ? 'Linking...' : 'Confirm Match'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-dashed border border-slate-200">
                            No automatic matches found. 
                            <button className="text-indigo-600 font-medium ml-1 hover:underline">Search manually</button>
                        </div>
                    )}
                 </div>
              </div>
              
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-right">
                  <button onClick={() => setReconcileModalOpen(false)} className="text-slate-500 hover:text-slate-700 font-medium text-sm">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
