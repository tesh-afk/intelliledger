
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface ReconciliationState {
  status: 'UNRECONCILED' | 'MATCHED' | 'RECONCILED';
  matchedRecordId?: string; // ID of Receipt or Invoice
  matchedRecordType?: 'RECEIPT' | 'INVOICE';
  autoMatchConfidence?: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string; // 'USD', 'EUR', 'GBP'
  originalAmount?: number; // If different currency
  fxRate?: number;
  type: TransactionType;
  category: string;
  status: TransactionStatus;
  reconciliation: ReconciliationState;
  source: 'QuickBooks' | 'Xero' | 'Zoho' | 'Manual' | 'Bank Feed';
  notes?: string;
  projectId?: string;
}

export interface Receipt {
  id: string;
  fileUrl: string; // Base64 or Object URL
  uploadDate: string;
  merchantName?: string;
  totalAmount?: number;
  date?: string;
  category?: string;
  status: 'PROCESSING' | 'ANALYZED' | 'ERROR';
}

export interface FinancialMetric {
  name: string;
  value: number;
  change: number; // Percentage change
  history: { name: string; value: number }[];
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID';
  items: InvoiceItem[];
  notes?: string;
  taxRate?: number; // Percentage
  discount?: number; // Fixed amount
  terms?: string;
}

export enum Frequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

export interface RecurringInvoice {
  id: string;
  clientName: string;
  clientEmail?: string;
  frequency: Frequency;
  nextRunDate: string;
  amount: number;
  status: 'ACTIVE' | 'PAUSED';
  items: InvoiceItem[];
  notes?: string;
  taxRate?: number;
  discount?: number;
  terms?: string;
}

export interface SavedItem {
  id: string;
  name: string; // Short name or code for display in dropdown
  description: string;
  unitPrice: number;
}

export enum ReportType {
  PROFIT_LOSS = 'PROFIT_LOSS',
  BALANCE_SHEET = 'BALANCE_SHEET',
  CASH_FLOW = 'CASH_FLOW',
  EXECUTIVE_BRIEF = 'EXECUTIVE_BRIEF',
  BUDGET_ACTUALS = 'BUDGET_ACTUALS',
}

export interface ProfitLossReport {
  income: Record<string, number>;
  expenses: Record<string, number>;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}

export interface BalanceSheetReport {
  assets: {
    cash: number;
    accountsReceivable: number;
    totalAssets: number;
  };
  liabilities: {
    accountsPayable: number;
    taxPayable: number;
    totalLiabilities: number;
  };
  equity: {
    retainedEarnings: number; // Net Income
    totalEquity: number;
  };
}

export interface CashFlowReport {
  operating: {
    netIncome: number;
    adjustments: number; // e.g., depreciation, AR changes
    totalOperating: number;
  };
  investing: {
    capitalExpenditures: number;
    totalInvesting: number;
  };
  financing: {
    loans: number;
    totalFinancing: number;
  };
  netChange: number;
  endingBalance: number;
}

// --- NEW TYPES FOR EXECUTIVE REPORTING ---

export interface KPIAnalysis {
  label: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  status: 'GOOD' | 'WARNING' | 'NEUTRAL';
}

export interface SmartReport {
  generatedAt: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  executiveSummary: string;
  trends: {
    whatWorked: string[];
    whatDidnt: string[];
    watchOuts: string[];
  };
  kpis: {
    revenue: KPIAnalysis;
    netProfitMargin: KPIAnalysis;
    operatingCashFlow: KPIAnalysis;
    expenseRatio: KPIAnalysis;
  };
  narrative: {
    revenueAnalysis: string;
    expenseAnalysis: string;
    profitabilityAnalysis: string;
  };
}

export interface TaxFiling {
  id: string;
  formType: string; // '1040-ES', '1120', 'VAT', 'Sales Tax'
  jurisdiction: string; // 'Federal', 'CA', 'NY'
  period: string; // 'Q3 2023', '2023 Annual'
  dueDate: string;
  status: 'DRAFT' | 'CPA_REVIEW' | 'FILED' | 'OVERDUE';
  amountDue: number;
}

export type TaxJurisdiction = 'US_IRS' | 'UK_HMRC' | 'EU_VAT' | 'NG_FIRS' | 'ZA_SARS' | 'KE_KRA' | 'GH_GRA';

export interface TaxRegionConfig {
    authorityName: string;
    currencyCode: string;
    currencySymbol: string;
    defaultCorpRate: number;
    portalName: string;
}

export interface TaxReviewItem {
  id: string;
  description: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'FLAGGED';
}

// Reconciliation specific types
export interface MatchCandidate {
  id: string;
  type: 'RECEIPT' | 'INVOICE';
  date: string;
  amount: number;
  entityName: string; // Merchant or Client
  score: number; // 0-1 confidence
  reason: string;
  feeAmount?: number; // Calculated fee gap (for Stripe etc)
}

// Security & Audit Types
export enum UserRole {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
  CPA = 'CPA',
}

export type KYCStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'MANUAL_REVIEW';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin: string;
  mfaEnabled: boolean;
  avatarUrl?: string;
  jurisdiction?: TaxJurisdiction;
  isEmailVerified?: boolean;
  kycStatus?: KYCStatus;
  planId?: string; // 'starter', 'growth', 'enterprise'
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  action: string; // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  resource: string; // 'INVOICE: inv1', 'SETTINGS'
  ipAddress: string;
  hash: string; // Cryptographic hash of the entry
}

export interface IntegrationEvent {
    id: string;
    timestamp: string;
    type: 'SYNC' | 'WEBHOOK' | 'ERROR';
    source: string;
    message: string;
    payloadSnippet?: string;
}

// --- ORCHESTRATION & OBSERVABILITY TYPES ---

export type WorkflowStatus = 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRYING';

export interface WorkflowStep {
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  timestamp?: string;
}

export interface WorkflowExecution {
  id: string;
  name: string; // e.g., 'Ingest Bank Feed', 'Month End Close'
  startTime: string;
  status: WorkflowStatus;
  currentStep: string;
  steps: WorkflowStep[];
  retryCount: number;
  error?: string;
}

export interface SystemMetric {
  timestamp: string;
  latency: number; // ms
  successRate: number; // percentage
  queueDepth: number;
}

export interface CircuitBreaker {
  serviceName: string; // e.g. 'QuickBooks API', 'Plaid'
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; // CLOSED = Healthy, OPEN = Broken
  failureCount: number;
  lastFailure?: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string; // Cron expression
  lastRun: string;
  nextRun: string;
  status: 'IDLE' | 'RUNNING';
}

export interface SystemAlert {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  status: 'ACTIVE' | 'RESOLVED';
}

// --- GENERAL LEDGER & DOUBLE ENTRY ---

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export interface Account {
  code: string;
  name: string;
  type: AccountType;
  balance: number; // Positive is Debit for Asset/Expense, Credit for others usually
  currency: string;
}

export interface JournalLine {
  accountId: string; // references Account code
  accountName: string;
  debit?: number;
  credit?: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string; // e.g. Transaction ID
  lines: JournalLine[];
  status: 'POSTED' | 'DRAFT';
}

// --- BUSINESS WORKFLOWS ---

export enum BusinessType {
  SAAS = 'SAAS',
  RETAIL = 'RETAIL',
  SERVICES = 'SERVICES',
  MANUFACTURING = 'MANUFACTURING',
  CONSTRUCTION = 'CONSTRUCTION',
  REAL_ESTATE = 'REAL_ESTATE',
  HOSPITALITY = 'HOSPITALITY',
  FREELANCE = 'FREELANCE'
}

export interface IndustryProfile {
    name: string;
    description: string;
    keyMetrics: string[];
    workflowExplanation: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  triggerType: 'TRANSACTION' | 'INVOICE';
  condition: string;
  actionDescription: string;
  enabled: boolean;
}

export interface SimulationResult {
  journalEntries: JournalEntry[];
  explanation: string;
}

export interface Project {
    id: string;
    name: string;
    client: string;
    status: 'ACTIVE' | 'COMPLETED';
}

export interface Budget {
    category: string;
    limit: number;
    spent: number;
    period: string;
}

// --- BUSINESS ENTITY / ONBOARDING ---

export interface BusinessEntity {
  legalName: string;
  type: 'LLC' | 'C_CORP' | 'SOLE_PROP';
  jurisdiction: string; // e.g. 'Wyoming, USA'
  ein?: string;
  formationService?: 'Doola' | 'Stripe Atlas' | 'Other';
  naicsCode?: string;
  status: 'PENDING_EIN' | 'ACTIVE' | 'DISSOLVED';
}

export interface OnboardingStep {
  id: string;
  label: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'LOCKED';
  description?: string;
}

export interface KYCRecord {
    id: string;
    userId: string;
    status: KYCStatus;
    documentType?: 'PASSPORT' | 'DRIVERS_LICENSE' | 'ID_CARD';
    submittedAt: string;
    amlCheckPassed: boolean;
    reason?: string;
}

// --- SUBSCRIPTION TYPES ---
export interface SubscriptionPlan {
    id: string;
    name: string;
    priceMonthly: number;
    priceAnnual: number;
    features: string[];
    missingFeatures?: string[];
    recommended?: boolean;
}

// --- MARKETING & GROWTH TYPES ---

export interface MarketingChannel {
    name: string;
    allocationPercent: number;
    recommendedTactics: string[];
}

export interface MarketingPlan {
    businessName: string;
    targetAudience: string;
    totalBudget: number;
    strategySummary: string;
    channels: MarketingChannel[];
    contentCalendar: string[]; // Simple list of ideas
    estimatedROI: string;
}

export interface MarketingCampaign {
    id: string;
    name: string;
    channel: string; // e.g. 'Facebook Ads'
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
    budget: number;
    spent: number;
    revenueAttributed: number;
    startDate: string;
    endDate?: string;
}
