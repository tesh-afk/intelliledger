
import { BusinessType, SimulationResult, JournalEntry } from '../types';

/**
 * Simulates accounting workflows based on business type.
 */
export const simulateWorkflow = (type: BusinessType, inputAmount: number): SimulationResult => {
  const result: SimulationResult = {
    journalEntries: [],
    explanation: ''
  };

  if (type === BusinessType.SAAS) {
    // SaaS Workflow: Annual Subscription -> Deferred Revenue -> Amortization
    result.explanation = `
      **SaaS Revenue Recognition (ASC 606):**
      1. Invoice issued: Recognizes Accounts Receivable, but Revenue is deferred (Liability).
      2. Monthly Amortization: Moves 1/12th of value from Deferred Revenue to Actual Revenue each month.
    `;

    // Entry 1: Invoice
    result.journalEntries.push({
      id: 'sim_saas_1',
      date: '2023-01-01',
      description: 'Invoice for Annual Plan',
      status: 'POSTED',
      lines: [
        { accountId: '1200', accountName: 'Accounts Receivable', debit: inputAmount },
        { accountId: '2500', accountName: 'Deferred Revenue', credit: inputAmount }
      ]
    });

    // Entry 2: Month 1 Recognition
    const monthlyAmt = inputAmount / 12;
    result.journalEntries.push({
      id: 'sim_saas_2',
      date: '2023-01-31',
      description: 'Month 1 Revenue Recognition',
      status: 'POSTED',
      lines: [
        { accountId: '2500', accountName: 'Deferred Revenue', debit: monthlyAmt },
        { accountId: '4000', accountName: 'Subscription Revenue', credit: monthlyAmt }
      ]
    });

  } else if (type === BusinessType.RETAIL) {
    // Retail Workflow: Sale -> Cash & COGS
    result.explanation = `
      **Retail Inventory Method:**
      1. Sale Recorded: Cash received, Sales Revenue recognized.
      2. Inventory Adjustment: Removes item cost from Asset (Inventory) and books to COGS.
      (Assumed 40% margin for simulation)
    `;

    const cost = inputAmount * 0.60;

    // Entry 1: The Sale
    result.journalEntries.push({
      id: 'sim_retail_1',
      date: 'Today',
      description: 'Point of Sale Transaction',
      status: 'POSTED',
      lines: [
        { accountId: '1000', accountName: 'Cash', debit: inputAmount },
        { accountId: '4000', accountName: 'Sales Revenue', credit: inputAmount }
      ]
    });

    // Entry 2: COGS
    result.journalEntries.push({
      id: 'sim_retail_2',
      date: 'Today',
      description: 'Inventory Adjustment (COGS)',
      status: 'POSTED',
      lines: [
        { accountId: '5000', accountName: 'Cost of Goods Sold', debit: cost },
        { accountId: '1500', accountName: 'Inventory Asset', credit: cost }
      ]
    });

  } else if (type === BusinessType.SERVICES) {
    // Services Workflow: WIP -> Invoice
    result.explanation = `
      **Professional Services (WIP):**
      1. Hours logged are accrued as Work-In-Progress (Asset) vs Accrued Revenue.
      2. Invoicing clears WIP and moves to Accounts Receivable.
    `;

    // Entry 1: Accrue WIP
    result.journalEntries.push({
      id: 'sim_svc_1',
      date: 'Week End',
      description: 'Accrue Billable Hours to WIP',
      status: 'POSTED',
      lines: [
        { accountId: '1300', accountName: 'Work In Progress (Asset)', debit: inputAmount },
        { accountId: '4100', accountName: 'Accrued Revenue', credit: inputAmount }
      ]
    });

    // Entry 2: Invoice
    result.journalEntries.push({
      id: 'sim_svc_2',
      date: 'Month End',
      description: 'Generate Invoice for Client',
      status: 'POSTED',
      lines: [
        { accountId: '1200', accountName: 'Accounts Receivable', debit: inputAmount },
        { accountId: '1300', accountName: 'Work In Progress (Asset)', credit: inputAmount }
      ]
    });
  }

  return result;
};
