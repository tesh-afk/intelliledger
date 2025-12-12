

import { Transaction, TransactionType, TransactionStatus, IntegrationEvent } from '../types';
import { addTransactions } from './mockDataService';

// Helpers to generate random data
const randomAmount = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];

const MERCHANTS = [
  { name: 'Starbucks', category: 'Meals & Entertainment', type: TransactionType.EXPENSE },
  { name: 'Shell Oil', category: 'Auto & Gas', type: TransactionType.EXPENSE },
  { name: 'Chevron', category: 'Auto & Gas', type: TransactionType.EXPENSE },
  { name: 'Uber Trip', category: 'Travel', type: TransactionType.EXPENSE },
  { name: 'Lyft Ride', category: 'Travel', type: TransactionType.EXPENSE },
  { name: 'Staples', category: 'Office Supplies', type: TransactionType.EXPENSE },
  { name: 'USps', category: 'Postage', type: TransactionType.EXPENSE },
  { name: 'Vercel', category: 'Software', type: TransactionType.EXPENSE },
  { name: 'GitHub', category: 'Software', type: TransactionType.EXPENSE },
  { name: 'WeWork', category: 'Rent', type: TransactionType.EXPENSE },
];

/**
 * Simulates a bank feed sync (e.g. Plaid).
 * Generates 3-7 new transactions.
 */
export const syncBankFeed = async (): Promise<{ added: number; events: IntegrationEvent[] }> => {
  const count = Math.floor(Math.random() * 5) + 3;
  const newTxs: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
    const isUncategorized = Math.random() > 0.7; // 30% chance of being raw/uncategorized

    newTxs.push({
      id: `tx_imported_${Date.now()}_${i}`,
      date: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      description: merchant.name + (Math.random() > 0.5 ? ' #00' + Math.floor(Math.random() * 99) : ''),
      amount: randomAmount(5, 150),
      currency: 'USD',
      type: merchant.type,
      category: isUncategorized ? 'Uncategorized' : merchant.category,
      status: TransactionStatus.PENDING,
      source: 'Bank Feed',
      reconciliation: { status: 'UNRECONCILED' },
      notes: isUncategorized ? 'Needs review' : 'Imported via Plaid'
    });
  }

  addTransactions(newTxs);

  const event: IntegrationEvent = {
    id: `evt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'SYNC',
    source: 'Plaid',
    message: `Imported ${count} new transactions from Chase Bank.`,
    payloadSnippet: `{"ids": [${newTxs.map(t => t.id).join(',')}]}`
  };

  return { added: count, events: [event] };
};

/**
 * Simulates Stripe Sync (Sales + Fees).
 */
export const syncStripe = async (): Promise<{ added: number; events: IntegrationEvent[] }> => {
  const count = 1; 
  const grossAmount = randomAmount(500, 2000);
  const feeAmount = Number((grossAmount * 0.029 + 0.30).toFixed(2));
  const netAmount = grossAmount - feeAmount;

  const saleTx: Transaction = {
    id: `tx_stripe_${Date.now()}_sale`,
    date: new Date().toISOString().split('T')[0],
    description: 'STRIPE TRANSFER',
    amount: netAmount,
    currency: 'USD',
    type: TransactionType.INCOME,
    category: 'Sales',
    status: TransactionStatus.COMPLETED,
    source: 'Bank Feed',
    reconciliation: { status: 'UNRECONCILED' },
    notes: `Net of fees. Gross: $${grossAmount}, Fee: $${feeAmount}`
  };

  addTransactions([saleTx]);

  const event: IntegrationEvent = {
    id: `evt_stripe_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'WEBHOOK',
    source: 'Stripe',
    message: 'payout.created',
    payloadSnippet: `{"amount": ${grossAmount}, "fee": ${feeAmount}}`
  };

  return { added: 1, events: [event] };
};

export const syncQBO = async (): Promise<{ added: number; events: IntegrationEvent[] }> => {
  // Simulates syncing Chart of Accounts or pulling existing invoices
  const event: IntegrationEvent = {
    id: `evt_qbo_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'SYNC',
    source: 'QuickBooks Online',
    message: 'Chart of Accounts & Customers synced successfully.',
    payloadSnippet: '{"customers": 12, "accounts": 45}'
  };

  return { added: 0, events: [event] };
};

/**
 * Simulates Xero Sync.
 */
export const syncXero = async (): Promise<{ added: number; events: IntegrationEvent[] }> => {
    // Generate some mock Bill Payments pulled from Xero
    const newTxs: Transaction[] = [{
        id: `tx_xero_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: 'Xero Bill Payment: #INV-2094',
        amount: randomAmount(200, 1000),
        currency: 'USD',
        type: TransactionType.EXPENSE,
        category: 'Professional Services',
        status: TransactionStatus.COMPLETED,
        source: 'Xero',
        reconciliation: { status: 'RECONCILED' },
        notes: 'Synced from Xero General Ledger'
    }];
    
    addTransactions(newTxs);

    const event: IntegrationEvent = {
        id: `evt_xero_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'SYNC',
        source: 'Xero',
        message: 'Pulled 1 new bill payment from Xero.',
        payloadSnippet: `{"id": "${newTxs[0].id}"}`
    };
    return { added: 1, events: [event] };
};

/**
 * Simulates Zoho Books Sync.
 */
export const syncZoho = async (): Promise<{ added: number; events: IntegrationEvent[] }> => {
    const newTxs: Transaction[] = [{
        id: `tx_zoho_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: 'Zoho Expense Reimbursement',
        amount: randomAmount(50, 300),
        currency: 'USD',
        type: TransactionType.EXPENSE,
        category: 'Travel',
        status: TransactionStatus.PENDING,
        source: 'Zoho',
        reconciliation: { status: 'UNRECONCILED' },
        notes: 'Imported from Zoho Books'
    }];
    
    addTransactions(newTxs);

    const event: IntegrationEvent = {
        id: `evt_zoho_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'SYNC',
        source: 'Zoho Books',
        message: 'Imported expense receipt.',
        payloadSnippet: `{"id": "${newTxs[0].id}"}`
    };
    return { added: 1, events: [event] };
};

/**
 * Simulates PayPal Sync.
 */
export const syncPayPal = async (): Promise<{ added: number; events: IntegrationEvent[] }> => {
    const gross = randomAmount(100, 500);
    const fee = Number((gross * 0.034 + 0.49).toFixed(2));
    
    const newTxs: Transaction[] = [{
        id: `tx_pp_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: 'PAYPAL *EBAY PURCHASE',
        amount: gross - fee,
        currency: 'USD',
        type: TransactionType.INCOME,
        category: 'Sales',
        status: TransactionStatus.COMPLETED,
        source: 'Bank Feed',
        reconciliation: { status: 'UNRECONCILED' },
        notes: `PayPal Tx ID: 998877. Fee: $${fee}`
    }];
    
    addTransactions(newTxs);

    const event: IntegrationEvent = {
        id: `evt_pp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'WEBHOOK',
        source: 'PayPal',
        message: 'PAYMENT.SALE.COMPLETED',
        payloadSnippet: `{"amount": "${gross}", "fee": "${fee}"}`
    };
    return { added: 1, events: [event] };
};

/**
 * Main dispatcher for sync actions.
 */
export const triggerSync = async (integrationId: string): Promise<{ added: number; events: IntegrationEvent[] }> => {
    switch (integrationId) {
        case 'int_qbo': return syncQBO();
        case 'int_xero': return syncXero();
        case 'int_zoho': return syncZoho();
        case 'int_plaid': return syncBankFeed();
        case 'int_stripe': return syncStripe();
        case 'int_paypal': return syncPayPal();
        default: 
            // Default generic fallback
            return syncBankFeed();
    }
};