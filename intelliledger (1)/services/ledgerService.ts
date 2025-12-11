
import { Transaction, TransactionType, JournalEntry, Account, AccountType } from '../types';
import { MOCK_CHART_OF_ACCOUNTS, MOCK_JOURNAL_ENTRIES } from './mockDataService';

// In-memory store for simulation
let currentCOA = [...MOCK_CHART_OF_ACCOUNTS];
let currentJournal = [...MOCK_JOURNAL_ENTRIES];

export const getChartOfAccounts = () => currentCOA;
export const getJournalEntries = () => currentJournal;

/**
 * Posts a single-entry Transaction to the Double-Entry Ledger.
 * Maps categories to specific G/L codes.
 */
export const postTransactionToLedger = (tx: Transaction): JournalEntry => {
  // Determine accounts based on Category
  // Default mapping logic (simplified)
  let debitAccountCode = '';
  let creditAccountCode = '';
  let debitAccountName = '';
  let creditAccountName = '';

  if (tx.type === TransactionType.EXPENSE) {
    // EXPENSE: Debit Expense, Credit Cash
    creditAccountCode = '1000'; // Cash
    creditAccountName = 'Cash';
    
    // Map Category to Expense Account
    switch (tx.category) {
      case 'Travel': debitAccountCode = '6000'; debitAccountName = 'Travel Expense'; break;
      case 'Software': debitAccountCode = '6100'; debitAccountName = 'Software Expense'; break;
      case 'Office Supplies': debitAccountCode = '6100'; debitAccountName = 'Office Expense'; break; // simplified
      default: debitAccountCode = '5000'; debitAccountName = 'General Expense'; break;
    }
  } else {
    // INCOME: Debit Cash, Credit Revenue
    debitAccountCode = '1000'; // Cash
    debitAccountName = 'Cash';
    
    creditAccountCode = '4000'; // Revenue
    creditAccountName = 'Sales Revenue';
  }

  const je: JournalEntry = {
    id: `je_auto_${tx.id}`,
    date: tx.date,
    description: `Auto-post: ${tx.description}`,
    reference: tx.id,
    status: 'POSTED',
    lines: [
      { accountId: debitAccountCode, accountName: debitAccountName, debit: tx.amount },
      { accountId: creditAccountCode, accountName: creditAccountName, credit: tx.amount }
    ]
  };

  // Add to in-memory store
  currentJournal.unshift(je);
  
  // Update Balances
  updateAccountBalance(debitAccountCode, tx.amount, 'DEBIT');
  updateAccountBalance(creditAccountCode, tx.amount, 'CREDIT');

  return je;
};

const updateAccountBalance = (code: string, amount: number, type: 'DEBIT' | 'CREDIT') => {
  currentCOA = currentCOA.map(acc => {
    if (acc.code !== code) return acc;
    
    // Simple balance logic:
    // Assets/Expenses increase with Debit
    // Liab/Equity/Revenue increase with Credit
    let change = 0;
    const isNormalDebit = [AccountType.ASSET, AccountType.EXPENSE].includes(acc.type);
    
    if (isNormalDebit) {
       change = type === 'DEBIT' ? amount : -amount;
    } else {
       change = type === 'CREDIT' ? amount : -amount;
    }

    return { ...acc, balance: acc.balance + change };
  });
};

export const getTrialBalance = () => {
    const totalDebits = currentJournal.reduce((sum, je) => sum + je.lines.reduce((lSum, line) => lSum + (line.debit || 0), 0), 0);
    const totalCredits = currentJournal.reduce((sum, je) => sum + je.lines.reduce((lSum, line) => lSum + (line.credit || 0), 0), 0);
    return { totalDebits, totalCredits, balanced: Math.abs(totalDebits - totalCredits) < 0.01 };
};
