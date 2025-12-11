

import { Transaction, Receipt, Invoice, MatchCandidate, TransactionStatus } from '../types';

/**
 * Calculates a simple Jaccard similarity index between two strings (0 to 1).
 * Good for fuzzy matching vendor names.
 */
const getJaccardSimilarity = (str1: string, str2: string): number => {
  const set1 = new Set(str1.toLowerCase().split(/[\s\W_]+/));
  const set2 = new Set(str2.toLowerCase().split(/[\s\W_]+/));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};

/**
 * Main reconciliation engine to find matches for a bank transaction.
 */
export const findReconciliationMatches = (
  transaction: Transaction,
  receipts: Receipt[],
  invoices: Invoice[]
): MatchCandidate[] => {
  const candidates: MatchCandidate[] = [];
  const txDate = new Date(transaction.date);

  // 1. RECEIPT MATCHING LOGIC
  // Logic: Amount match (strict tolerance), Date window (+/- 5 days), Name fuzzy match
  receipts.forEach(receipt => {
    if (!receipt.totalAmount || !receipt.date || !receipt.merchantName) return;

    const receiptDate = new Date(receipt.date);
    const dayDiff = Math.abs((txDate.getTime() - receiptDate.getTime()) / (1000 * 3600 * 24));
    
    // Check Amount Tolerance ($0.05)
    const amountDiff = Math.abs(transaction.amount - receipt.totalAmount);
    if (amountDiff > 0.10) return;

    // Check Date Window (5 days)
    if (dayDiff > 5) return;

    // Check Name Similarity
    const nameScore = getJaccardSimilarity(transaction.description, receipt.merchantName);
    
    // Calculate final confidence score
    let score = 0;
    if (amountDiff < 0.01) score += 0.5;
    if (dayDiff === 0) score += 0.3;
    else if (dayDiff <= 2) score += 0.15;
    score += (nameScore * 0.2);

    if (score > 0.4) {
      candidates.push({
        id: receipt.id,
        type: 'RECEIPT',
        date: receipt.date,
        amount: receipt.totalAmount,
        entityName: receipt.merchantName,
        score: Math.min(score, 1),
        reason: `Amount matches exactly. Date is ${Math.round(dayDiff)} days apart.`
      });
    }
  });

  // 2. INVOICE MATCHING LOGIC
  // Logic: Amount match (or Fee detection), Invoice ID in description
  invoices.forEach(invoice => {
    // Only look for matches on Income for Invoices
    if (transaction.type !== 'INCOME' && transaction.type !== 'EXPENSE') return; // Invoices are usually Income, but refunds exist

    const invDate = new Date(invoice.issueDate);
    const dayDiff = Math.abs((txDate.getTime() - invDate.getTime()) / (1000 * 3600 * 24));

    // Name Match
    const nameScore = getJaccardSimilarity(transaction.description, invoice.clientName);

    // EXACT Amount Match
    if (Math.abs(transaction.amount - invoice.amount) < 0.10) {
      candidates.push({
        id: invoice.id,
        type: 'INVOICE',
        date: invoice.issueDate,
        amount: invoice.amount,
        entityName: invoice.clientName,
        score: 0.9 + (nameScore * 0.1),
        reason: 'Exact amount match on invoice.'
      });
      return;
    }

    // PAYMENT PROCESSOR FEE DETECTION (e.g. Stripe)
    // If Transaction Amount < Invoice Amount AND Name matches or Source is Payment Processor
    const possibleFee = invoice.amount - transaction.amount;
    const isPaymentProcessor = ['Stripe', 'Square', 'PayPal', 'Merchant'].some(p => transaction.description.includes(p));
    
    // Logic: If bank deposit is 95-99% of invoice, likely a fee
    const ratio = transaction.amount / invoice.amount;
    
    if (possibleFee > 0 && ratio > 0.90 && (isPaymentProcessor || nameScore > 0.3)) {
      candidates.push({
        id: invoice.id,
        type: 'INVOICE',
        date: invoice.issueDate,
        amount: invoice.amount,
        entityName: invoice.clientName,
        score: 0.85,
        feeAmount: possibleFee,
        reason: `Possible payment processor fee detected ($${possibleFee.toFixed(2)}).`
      });
    }
  });

  return candidates.sort((a, b) => b.score - a.score);
};

/**
 * Batch processes all transactions to automatically link high-confidence matches.
 */
export const autoReconcileAll = (
  transactions: Transaction[],
  receipts: Receipt[],
  invoices: Invoice[]
): { updatedTransactions: Transaction[], matchCount: number } => {
  let matchCount = 0;
  
  const updatedTransactions = transactions.map(tx => {
    // Skip if already reconciled
    if (tx.reconciliation.status === 'RECONCILED' || tx.reconciliation.status === 'MATCHED') {
      return tx;
    }

    const matches = findReconciliationMatches(tx, receipts, invoices);
    const bestMatch = matches.length > 0 ? matches[0] : null;

    if (bestMatch && bestMatch.score >= 0.9) {
      matchCount++;
      return {
        ...tx,
        reconciliation: {
          status: 'MATCHED', // Matched but usually requires final confirmation
          matchedRecordId: bestMatch.id,
          matchedRecordType: bestMatch.type,
          autoMatchConfidence: bestMatch.score
        },
        notes: tx.notes ? tx.notes + ` [Auto-Matched with ${bestMatch.type}]` : `[Auto-Matched with ${bestMatch.type}]`
      } as Transaction;
    }

    return tx;
  });

  return { updatedTransactions, matchCount };
};
