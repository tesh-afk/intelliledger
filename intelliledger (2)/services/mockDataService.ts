import { Transaction, TransactionType, TransactionStatus, Integration, Invoice, RecurringInvoice, Frequency, SavedItem, TaxFiling, TaxReviewItem, Receipt, User, UserRole, AuditLogEntry, WorkflowExecution, SystemMetric, CircuitBreaker, CronJob, SystemAlert, IntegrationEvent, Account, AccountType, JournalEntry, Project, Budget, BusinessEntity, MarketingCampaign } from '../types';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- CATEGORIZATION RULES ---
export const MOCK_CATEGORIZATION_RULES = [
  { keyword: 'Uber', category: 'Travel' },
  { keyword: 'Lyft', category: 'Travel' },
  { keyword: 'Starbucks', category: 'Meals & Entertainment' },
  { keyword: 'Shell', category: 'Auto & Gas' },
  { keyword: 'Chevron', category: 'Auto & Gas' },
  { keyword: 'Adobe', category: 'Software & Subscriptions' },
  { keyword: 'Slack', category: 'Software & Subscriptions' },
  { keyword: 'AWS', category: 'Hosting & Infrastructure' },
  { keyword: 'Home Depot', category: 'Office Supplies' },
  { keyword: 'WeWork', category: 'Rent' },
  { keyword: 'Stripe', category: 'Merchant Fees' } // Specific rule often overrides generic AI
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    date: '2023-10-25',
    description: 'UBER *TRIP San Francisco',
    amount: 24.50,
    currency: 'USD',
    type: TransactionType.EXPENSE,
    category: 'Travel',
    status: TransactionStatus.COMPLETED,
    source: 'Bank Feed',
    reconciliation: { status: 'MATCHED', matchedRecordId: 'r_uber_1', matchedRecordType: 'RECEIPT' },
    notes: 'Ride to airport'
  },
  {
    id: 't2',
    date: '2023-10-24',
    description: 'Adobe Creative Cloud',
    amount: 54.99,
    currency: 'USD',
    type: TransactionType.EXPENSE,
    category: 'Software',
    status: TransactionStatus.COMPLETED,
    source: 'QuickBooks',
    reconciliation: { status: 'RECONCILED' }
  },
  {
    id: 't_stripe_1',
    date: '2023-10-05',
    description: 'STRIPE TRANSFER * GLOBEX',
    amount: 4365.00, // $4500 - $135 fees
    currency: 'USD',
    type: TransactionType.INCOME,
    category: 'Sales',
    status: TransactionStatus.COMPLETED,
    source: 'Bank Feed',
    reconciliation: { status: 'UNRECONCILED' }, // Should match Invoice inv1 with fee split
    notes: 'Potential fee split needed'
  },
  {
    id: 't_rec_1',
    date: '2023-10-21',
    description: 'Home Depot #442',
    amount: 45.00,
    currency: 'USD',
    type: TransactionType.EXPENSE,
    category: 'Office Supplies',
    status: TransactionStatus.PENDING,
    source: 'Bank Feed',
    reconciliation: { status: 'UNRECONCILED' } // Should match receipt
  },
  {
    id: 't_fx_1',
    date: '2023-10-18',
    description: 'London Taxi Service',
    amount: 65.50, // USD Equivalent
    currency: 'USD',
    originalAmount: 52.00,
    fxRate: 1.26,
    type: TransactionType.EXPENSE,
    category: 'Travel',
    status: TransactionStatus.COMPLETED,
    source: 'Bank Feed',
    reconciliation: { status: 'UNRECONCILED' }
  },
  {
    id: 't3',
    date: '2023-10-24',
    description: 'Client Payment - Acme Corp',
    amount: 1500.00,
    currency: 'USD',
    type: TransactionType.INCOME,
    category: 'Sales',
    status: TransactionStatus.COMPLETED,
    source: 'Xero',
    reconciliation: { status: 'RECONCILED' }
  }
];

// Fix for the mock object property override above
// @ts-ignore
MOCK_TRANSACTIONS[4].originalCurrency = 'GBP'; 

// --- DYNAMIC TRANSACTION STORE ---
// We use a closure to simulate a database that persists in memory during the session
let dynamicTransactions = [...MOCK_TRANSACTIONS];

export const getTransactions = () => dynamicTransactions;

export const addTransactions = (newTxs: Transaction[]) => {
    dynamicTransactions = [...newTxs, ...dynamicTransactions];
    return dynamicTransactions;
};

export const updateTransaction = (updatedTx: Transaction) => {
    dynamicTransactions = dynamicTransactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    return dynamicTransactions;
};


export const MOCK_INTEGRATIONS: Integration[] = [
  // Accounting
  { id: 'int_qbo', name: 'QuickBooks Online', icon: 'QB', connected: true, lastSync: '2 mins ago' },
  { id: 'int_xero', name: 'Xero', icon: 'X', connected: true, lastSync: '4 hours ago' },
  { id: 'int_zoho', name: 'Zoho Books', icon: 'Z', connected: false },
  
  // Banks
  { id: 'int_plaid', name: 'Chase Bank (Plaid)', icon: 'Chase', connected: true, lastSync: '1 hour ago' },
  
  // Payments
  { id: 'int_stripe', name: 'Stripe Payments', icon: 'S', connected: true, lastSync: '5 mins ago' },
  { id: 'int_paypal', name: 'PayPal', icon: 'P', connected: false },

  // Risk & Identity (Separate Services)
  { id: 'int_stripe_id', name: 'Stripe Identity', icon: 'S', connected: true, lastSync: 'Active' },
  { id: 'int_persona', name: 'Persona KYC', icon: 'P', connected: false }
];

export const MOCK_INVOICES: Invoice[] = [
  { 
    id: 'inv1', 
    clientName: 'Globex Corp', 
    clientEmail: 'accounts@globex.com',
    amount: 4500, 
    issueDate: '2023-10-01',
    dueDate: '2023-11-01', 
    status: 'SENT',
    items: [
      { id: 'i1', description: 'Q3 Consultation Services', quantity: 30, unitPrice: 150, amount: 4500 }
    ],
    taxRate: 0,
    discount: 0,
    terms: 'Net 30. Payment due within 30 days.'
  },
  { 
    id: 'inv2', 
    clientName: 'Soylent Corp', 
    clientEmail: 'billing@soylent.com',
    amount: 2507, 
    issueDate: '2023-10-15',
    dueDate: '2023-11-15', 
    status: 'DRAFT',
    items: [
      { id: 'i2', description: 'Website Redesign', quantity: 1, unitPrice: 2000, amount: 2000 },
      { id: 'i3', description: 'Hosting (1 Year)', quantity: 1, unitPrice: 300, amount: 300 }
    ],
    taxRate: 9,
    discount: 0,
    terms: 'Net 30. Please make checks payable to IntelliLedger Inc.'
  },
  { 
    id: 'inv3', 
    clientName: 'Umbrella Inc', 
    clientEmail: 'admin@umbrella.com',
    amount: 8400, 
    issueDate: '2023-09-20',
    dueDate: '2023-10-20', 
    status: 'PAID',
    items: [
      { id: 'i4', description: 'Security Audit', quantity: 1, unitPrice: 5000, amount: 5000 },
      { id: 'i5', description: 'Hardware Implementation', quantity: 13, unitPrice: 300, amount: 3900 }
    ],
    taxRate: 0,
    discount: 500,
    terms: 'Immediate payment required upon receipt.'
  },
];

export const MOCK_RECURRING_INVOICES: RecurringInvoice[] = [
  {
    id: 'rec1',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acme.com',
    frequency: Frequency.MONTHLY,
    nextRunDate: '2023-11-01',
    amount: 2500,
    status: 'ACTIVE',
    items: [
      { id: 'ri1', description: 'Monthly Retainer - SEO', quantity: 1, unitPrice: 2500, amount: 2500 }
    ],
    taxRate: 0,
    discount: 0,
    terms: 'Net 15.'
  },
  {
    id: 'rec2',
    clientName: 'StartUp Inc',
    clientEmail: 'founders@startup.com',
    frequency: Frequency.QUARTERLY,
    nextRunDate: '2024-01-01',
    amount: 1200,
    status: 'ACTIVE',
    items: [
      { id: 'ri2', description: 'Quarterly Maintenance', quantity: 1, unitPrice: 1200, amount: 1200 }
    ],
    taxRate: 0,
    discount: 0,
    terms: 'Due on receipt.'
  }
];

export const MOCK_SAVED_ITEMS: SavedItem[] = [
  { id: 's1', name: 'Web Dev', description: 'Web Development Services - Hourly', unitPrice: 150 },
  { id: 's2', name: 'SEO Audit', description: 'Comprehensive SEO Audit & Report', unitPrice: 500 },
  { id: 's3', name: 'Hosting', description: 'Annual Server Hosting (Standard)', unitPrice: 300 },
  { id: 's4', name: 'Consulting', description: 'Business Strategy Consulting', unitPrice: 200 },
  { id: 's5', name: 'Retainer', description: 'Monthly Marketing Retainer', unitPrice: 2000 },
];

export const MOCK_TAX_FILINGS: TaxFiling[] = [
  { id: 'tf1', formType: '1040-ES', jurisdiction: 'Federal', period: 'Q3 2023', dueDate: '2023-09-15', status: 'FILED', amountDue: 5052 },
  { id: 'tf2', formType: '1040-ES', jurisdiction: 'Federal', period: 'Q4 2023', dueDate: '2024-01-15', status: 'DRAFT', amountDue: 5200 },
  { id: 'tf3', formType: 'Sales Tax', jurisdiction: 'California', period: 'Q3 2023', dueDate: '2023-10-31', status: 'CPA_REVIEW', amountDue: 1240 },
  { id: 'tf4', formType: 'Form 1120', jurisdiction: 'Federal', period: '2022 Annual', dueDate: '2023-04-15', status: 'FILED', amountDue: 0 },
];

export const MOCK_REVIEW_ITEMS: TaxReviewItem[] = [
  { id: 'tr1', description: 'Expedia *Flight - Paris', amount: 4500, reason: 'High Value International Travel', status: 'PENDING' },
  { id: 'tr2', description: 'BestBuy - Electronics', amount: 1299.99, reason: 'Capital Asset Potential', status: 'PENDING' },
  { id: 'tr3', description: 'Unknown Venmo Payment', amount: 500.00, reason: 'Uncategorized / No Receipt', status: 'PENDING' },
];

export const MOCK_RECEIPTS: Receipt[] = [
  {
    id: 'r_rec_1',
    fileUrl: 'https://placehold.co/100x150?text=Receipt', // Placeholder
    uploadDate: '2023-10-21',
    merchantName: 'Home Depot',
    totalAmount: 45.00,
    date: '2023-10-21',
    category: 'Office Supplies',
    status: 'ANALYZED'
  }
];

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Tesh', 
    email: 'tesh@getintelliledger.com', 
    role: UserRole.OWNER, 
    lastLogin: '2 mins ago', 
    mfaEnabled: true, 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tesh', 
    kycStatus: 'VERIFIED',
    planId: 'enterprise' // Has full access (Scale)
  },
  { 
    id: 'u2', 
    name: 'Mike Ross', 
    email: 'mike@getintelliledger.com', 
    role: UserRole.STAFF, 
    lastLogin: '4 hours ago', 
    mfaEnabled: false, 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 
    kycStatus: 'NOT_STARTED',
    planId: 'starter' // Restricted access (Solopreneur)
  },
  { 
    id: 'u3', 
    name: 'Jessica Pearson', 
    email: 'jessica@cpa-firm.com', 
    role: UserRole.CPA, 
    lastLogin: '2 days ago', 
    mfaEnabled: true, 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica', 
    kycStatus: 'VERIFIED',
    planId: 'growth' // Standard access
  }
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'al1', timestamp: '2023-10-25T14:32:00Z', actorName: 'Tesh', action: 'UPDATE', resource: 'INVOICE: inv1', ipAddress: '192.168.1.45', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
  { id: 'al2', timestamp: '2023-10-25T12:10:00Z', actorName: 'Mike Ross', action: 'CREATE', resource: 'TRANSACTION: t3', ipAddress: '10.0.0.12', hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' },
  { id: 'al3', timestamp: '2023-10-25T09:00:00Z', actorName: 'System', action: 'SYNC', resource: 'INTEGRATION: QuickBooks', ipAddress: 'Internal', hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb' },
  { id: 'al4', timestamp: '2023-10-24T16:45:00Z', actorName: 'Jessica Pearson', action: 'APPROVE', resource: 'TAX_FILING: tf1', ipAddress: '203.0.113.88', hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' },
  { id: 'al5', timestamp: '2023-10-24T08:30:00Z', actorName: 'Tesh', action: 'LOGIN', resource: 'SESSION', ipAddress: '192.168.1.45', hash: '1f2e1a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c' },
];

export const MOCK_INTEGRATION_LOGS: IntegrationEvent[] = [
    { id: 'ie1', timestamp: '2023-10-25T14:35:01Z', type: 'WEBHOOK', source: 'Stripe', message: 'charge.succeeded', payloadSnippet: '{ "id": "ch_1N...", "amount": 436500 }' },
    { id: 'ie2', timestamp: '2023-10-25T14:30:22Z', type: 'SYNC', source: 'QuickBooks Online', message: 'Chart of Accounts Updated', payloadSnippet: '{ "synced": 45, "updated": 2 }' },
    { id: 'ie3', timestamp: '2023-10-25T14:15:00Z', type: 'SYNC', source: 'Plaid', message: 'Cursor Update: Transactions', payloadSnippet: '{ "new_cursor": "c_a1b2...", "count": 5 }' },
    { id: 'ie4', timestamp: '2023-10-25T12:00:00Z', type: 'ERROR', source: 'Xero', message: 'Token Expired', payloadSnippet: '{ "error": "invalid_grant" }' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Website Redesign', client: 'Globex Corp', status: 'ACTIVE' },
  { id: 'p2', name: 'SEO Campaign', client: 'Acme Corp', status: 'ACTIVE' },
  { id: 'p3', name: 'Legacy Migration', client: 'Umbrella Inc', status: 'COMPLETED' }
];

export const MOCK_BUDGETS: Budget[] = [
  { category: 'Travel', limit: 2000, spent: 0, period: 'Monthly' },
  { category: 'Software', limit: 1000, spent: 0, period: 'Monthly' },
  { category: 'Office Supplies', limit: 500, spent: 0, period: 'Monthly' },
  { category: 'Meals & Entertainment', limit: 600, spent: 0, period: 'Monthly' }
];

export const MOCK_BUSINESS_ENTITY: BusinessEntity = {
  legalName: 'IntelliLedger Inc.',
  type: 'LLC',
  jurisdiction: 'Wyoming, USA',
  formationService: 'Doola',
  naicsCode: '513210',
  status: 'PENDING_EIN'
};

export const MOCK_CAMPAIGNS: MarketingCampaign[] = [
    {
        id: 'cmp_1',
        name: 'Fall Lead Gen',
        channel: 'LinkedIn Ads',
        status: 'ACTIVE',
        budget: 1500,
        spent: 850,
        revenueAttributed: 3200,
        startDate: '2023-10-01',
    },
    {
        id: 'cmp_2',
        name: 'Competitor Conquesting',
        channel: 'Google Search',
        status: 'PAUSED',
        budget: 500,
        spent: 420,
        revenueAttributed: 150, // Negative ROI example
        startDate: '2023-09-15',
        endDate: '2023-10-15'
    }
];

// --- ORCHESTRATION & OBSERVABILITY MOCK DATA ---

export const MOCK_WORKFLOWS: WorkflowExecution[] = [
  {
    id: 'wf_1',
    name: 'Month End Close - Oct 2023',
    startTime: '2023-11-01T08:00:00Z',
    status: 'RETRYING',
    currentStep: 'SYNC_ERP',
    retryCount: 2,
    error: 'QuickBooks API Gateway Timeout (504)',
    steps: [
      { name: 'INIT', status: 'COMPLETED', timestamp: '08:00:01Z' },
      { name: 'FETCH_BALANCES', status: 'COMPLETED', timestamp: '08:00:15Z' },
      { name: 'RECONCILE_ACCOUNTS', status: 'COMPLETED', timestamp: '08:02:30Z' },
      { name: 'GENERATE_REPORTS', status: 'COMPLETED', timestamp: '08:03:00Z' },
      { name: 'SYNC_ERP', status: 'FAILED', timestamp: '08:03:15Z' },
    ]
  },
  {
    id: 'wf_2',
    name: 'Ingest Bank Feed - Chase',
    startTime: '2023-11-01T09:15:00Z',
    status: 'COMPLETED',
    currentStep: 'COMPLETED',
    retryCount: 0,
    steps: [
      { name: 'INIT', status: 'COMPLETED', timestamp: '09:15:01Z' },
      { name: 'PLAID_FETCH', status: 'COMPLETED', timestamp: '09:15:05Z' },
      { name: 'AI_CATEGORIZE', status: 'COMPLETED', timestamp: '09:15:10Z' },
      { name: 'PERSIST', status: 'COMPLETED', timestamp: '09:15:12Z' },
    ]
  },
  {
    id: 'wf_3',
    name: 'Invoice Generation - Recurring',
    startTime: '2023-11-01T00:00:00Z',
    status: 'COMPLETED',
    currentStep: 'COMPLETED',
    retryCount: 0,
    steps: [
      { name: 'INIT', status: 'COMPLETED' },
      { name: 'FETCH_TEMPLATES', status: 'COMPLETED' },
      { name: 'GENERATE_PDFS', status: 'COMPLETED' },
      { name: 'EMAIL_CLIENTS', status: 'COMPLETED' }
    ]
  }
];

export const MOCK_METRICS: SystemMetric[] = [
  { timestamp: '10:00', latency: 120, successRate: 99.9, queueDepth: 2 },
  { timestamp: '10:05', latency: 135, successRate: 99.8, queueDepth: 12 },
  { timestamp: '10:10', latency: 450, successRate: 95.5, queueDepth: 85 }, // Spike
  { timestamp: '10:15', latency: 150, successRate: 98.2, queueDepth: 45 }, // Recovery
  { timestamp: '10:20', latency: 110, successRate: 99.9, queueDepth: 5 },
  { timestamp: '10:25', latency: 115, successRate: 100.0, queueDepth: 2 },
  { timestamp: '10:30', latency: 105, successRate: 100.0, queueDepth: 0 },
];

export const MOCK_CIRCUIT_BREAKERS: CircuitBreaker[] = [
  { serviceName: 'QuickBooks Online API', state: 'HALF_OPEN', failureCount: 4, lastFailure: 'Timeout 504' },
  { serviceName: 'Plaid Sync', state: 'CLOSED', failureCount: 0 },
  { serviceName: 'Stripe Webhooks', state: 'CLOSED', failureCount: 0 },
  { serviceName: 'Gemini AI', state: 'CLOSED', failureCount: 0 },
];

export const MOCK_SCHEDULES: CronJob[] = [
  { id: 'cron1', name: 'Daily Bank Feed Sync', schedule: '0 6 * * *', lastRun: 'Today 06:00 AM', nextRun: 'Tomorrow 06:00 AM', status: 'IDLE' },
  { id: 'cron2', name: 'Weekly Report Generation', schedule: '0 0 * * MON', lastRun: 'Last Mon 12:00 AM', nextRun: 'Next Mon 12:00 AM', status: 'IDLE' },
  { id: 'cron3', name: 'Tax Estimate Calculator', schedule: '0 0 1 */3 *', lastRun: 'Oct 1st 12:00 AM', nextRun: 'Jan 1st 12:00 AM', status: 'IDLE' },
];

export const MOCK_ALERTS: SystemAlert[] = [
  { id: 'alt1', severity: 'WARNING', message: 'High Latency detected in Workflow Engine', timestamp: '10:10 AM', status: 'RESOLVED' },
  { id: 'alt2', severity: 'CRITICAL', message: 'QuickBooks API Error Rate > 5%', timestamp: '10:12 AM', status: 'ACTIVE' },
];

// --- LEDGER DATA ---

export const MOCK_CHART_OF_ACCOUNTS: Account[] = [
  { code: '1000', name: 'Cash', type: AccountType.ASSET, balance: 50000, currency: 'USD' },
  { code: '1200', name: 'Accounts Receivable', type: AccountType.ASSET, balance: 4500, currency: 'USD' },
  { code: '1500', name: 'Inventory', type: AccountType.ASSET, balance: 2500, currency: 'USD' },
  { code: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY, balance: 1200, currency: 'USD' },
  { code: '2200', name: 'Sales Tax Payable', type: AccountType.LIABILITY, balance: 450, currency: 'USD' },
  { code: '2500', name: 'Deferred Revenue', type: AccountType.LIABILITY, balance: 12000, currency: 'USD' },
  { code: '3000', name: 'Owners Equity', type: AccountType.EQUITY, balance: 40000, currency: 'USD' },
  { code: '4000', name: 'Sales Revenue', type: AccountType.REVENUE, balance: 85000, currency: 'USD' },
  { code: '5000', name: 'COGS', type: AccountType.EXPENSE, balance: 22000, currency: 'USD' },
  { code: '6000', name: 'Travel Expense', type: AccountType.EXPENSE, balance: 1200, currency: 'USD' },
  { code: '6100', name: 'Software Expense', type: AccountType.EXPENSE, balance: 850, currency: 'USD' },
];

export const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je1',
    date: '2023-10-01',
    description: 'Initial Capital Injection',
    status: 'POSTED',
    lines: [
       { accountId: '1000', accountName: 'Cash', debit: 40000 },
       { accountId: '3000', accountName: 'Owners Equity', credit: 40000 }
    ]
  },
  {
    id: 'je2',
    date: '2023-10-05',
    description: 'Invoice #INV-1001 Generated',
    reference: 'inv1',
    status: 'POSTED',
    lines: [
       { accountId: '1200', accountName: 'Accounts Receivable', debit: 4500 },
       { accountId: '4000', accountName: 'Sales Revenue', credit: 4500 }
    ]
  },
  {
    id: 'je3',
    date: '2023-10-25',
    description: 'Uber Ride',
    reference: 't1',
    status: 'POSTED',
    lines: [
       { accountId: '6000', accountName: 'Travel Expense', debit: 24.50 },
       { accountId: '1000', accountName: 'Cash', credit: 24.50 }
    ]
  }
];