
import { Transaction, TransactionType, ProfitLossReport, BalanceSheetReport, CashFlowReport, Invoice, SmartReport, KPIAnalysis, Budget } from '../types';
import { generateExecutiveReportAI } from './geminiService';

/**
 * Generates a Profit & Loss statement from transactions.
 */
export const generateProfitLoss = (transactions: Transaction[], projectFilterId?: string): ProfitLossReport => {
  const report: ProfitLossReport = {
    income: {},
    expenses: {},
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0
  };

  transactions.forEach(tx => {
    // Filter logic
    if (tx.status === 'FAILED') return;
    if (projectFilterId && tx.projectId !== projectFilterId) return;

    if (tx.type === TransactionType.INCOME) {
      report.income[tx.category] = (report.income[tx.category] || 0) + tx.amount;
      report.totalIncome += tx.amount;
    } else {
      report.expenses[tx.category] = (report.expenses[tx.category] || 0) + tx.amount;
      report.totalExpenses += tx.amount;
    }
  });

  report.netIncome = report.totalIncome - report.totalExpenses;
  return report;
};

/**
 * Generates a Balance Sheet based on transactions and invoice status.
 */
export const generateBalanceSheet = (transactions: Transaction[], invoices: Invoice[]): BalanceSheetReport => {
    const pl = generateProfitLoss(transactions);
    
    // 1. Assets
    const startingCash = 50000;
    const currentCash = startingCash + pl.netIncome; // Simplified Cash calc
    const accountsReceivable = invoices
        .filter(inv => inv.status === 'SENT')
        .reduce((sum, inv) => sum + inv.amount, 0);
    
    // 2. Liabilities
    const taxPayable = Math.max(0, pl.netIncome * 0.20); // Mock 20% tax rate
    const accountsPayable = 1200; // Mock outstanding bills
    
    // 3. Equity
    const retainedEarnings = pl.netIncome;
    const totalLiabilities = taxPayable + accountsPayable;
    const totalEquity = retainedEarnings + (startingCash); // Initial Capital + Earnings

    return {
        assets: {
            cash: currentCash,
            accountsReceivable,
            totalAssets: currentCash + accountsReceivable
        },
        liabilities: {
            accountsPayable,
            taxPayable,
            totalLiabilities
        },
        equity: {
            retainedEarnings,
            totalEquity: (currentCash + accountsReceivable) - totalLiabilities // Force balance
        }
    };
};

/**
 * Generates a Cash Flow Statement.
 */
export const generateCashFlow = (transactions: Transaction[]): CashFlowReport => {
    const pl = generateProfitLoss(transactions);
    
    // Operating: Net Income + Adjustments
    const operatingActivities = pl.netIncome;

    // Investing: Filter for 'Assets', 'Equipment' categories
    const capitalExpenditures = transactions
        .filter(t => t.type === TransactionType.EXPENSE && (t.category === 'Equipment' || t.category === 'Assets'))
        .reduce((sum, t) => sum + t.amount, 0);

    // Financing: Loans or Capital Injections
    const financing = 0; // Mock

    return {
        operating: {
            netIncome: pl.netIncome,
            adjustments: 0,
            totalOperating: operatingActivities
        },
        investing: {
            capitalExpenditures: -capitalExpenditures, // Outflow
            totalInvesting: -capitalExpenditures
        },
        financing: {
            loans: financing,
            totalFinancing: financing
        },
        netChange: operatingActivities - capitalExpenditures + financing,
        endingBalance: 50000 + (operatingActivities - capitalExpenditures + financing) // Mock starting bal
    };
};

export const generateBudgetReport = (transactions: Transaction[], budgets: Budget[]) => {
    return budgets.map(b => {
        const spent = transactions
            .filter(t => t.type === TransactionType.EXPENSE && t.category === b.category)
            .reduce((sum, t) => sum + t.amount, 0);
        return { ...b, spent };
    });
};

/**
 * Generates comparative data for the Smart Executive Report.
 * Mocks previous period data for demonstration.
 */
export const generateSmartReport = async (transactions: Transaction[], period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'): Promise<SmartReport> => {
    // 1. Get Current Data
    const currentPL = generateProfitLoss(transactions);
    const currentCF = generateCashFlow(transactions);

    // 2. Generate Mock "Previous Period" Data (simulating history)
    const prevIncome = currentPL.totalIncome * 0.92; // 8% growth
    const prevExpense = currentPL.totalExpenses * 0.95; // 5% growth
    const prevNetIncome = prevIncome - prevExpense;
    const prevOperatingCF = currentCF.operating.totalOperating * 0.88;

    const currentData = {
        totalRevenue: currentPL.totalIncome,
        totalExpenses: currentPL.totalExpenses,
        netIncome: currentPL.netIncome,
        cashFlow: currentCF.operating.totalOperating
    };

    const previousData = {
        totalRevenue: prevIncome,
        totalExpenses: prevExpense,
        netIncome: prevNetIncome,
        cashFlow: prevOperatingCF
    };

    // 3. Call AI for Narrative
    const report = await generateExecutiveReportAI(currentData, previousData, period);

    // 4. Calculate KPIs Deterministically
    const calcKPI = (label: string, curr: number, prev: number, inverse = false): KPIAnalysis => {
        const change = ((curr - prev) / prev) * 100;
        let status: 'GOOD' | 'WARNING' | 'NEUTRAL' = 'NEUTRAL';
        
        if (inverse) {
             // For expenses, lower is usually better
             if (change < 0) status = 'GOOD';
             else if (change > 5) status = 'WARNING';
        } else {
             // For income, higher is better
             if (change > 0) status = 'GOOD';
             else if (change < -5) status = 'WARNING';
        }

        return { label, currentValue: curr, previousValue: prev, changePercentage: change, status };
    };

    report.kpis = {
        revenue: calcKPI('Total Revenue', currentPL.totalIncome, prevIncome),
        netProfitMargin: calcKPI('Net Profit Margin %', (currentPL.netIncome / currentPL.totalIncome) * 100, (prevNetIncome / prevIncome) * 100),
        operatingCashFlow: calcKPI('Operating Cash Flow', currentCF.operating.totalOperating, prevOperatingCF),
        expenseRatio: calcKPI('Expense Ratio %', (currentPL.totalExpenses / currentPL.totalIncome) * 100, (prevExpense / prevIncome) * 100, true)
    };

    return report;
};

/**
 * Converts report data to CSV and triggers a browser download.
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => 
      typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    ).join(',')
  ).join('\n');

  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportReportToCSV = (report: ProfitLossReport) => {
    // Flatten for CSV
    const rows = [];
    
    // Income Section
    rows.push({ Category: 'REVENUE', Amount: '' });
    Object.entries(report.income).forEach(([cat, amt]) => {
        rows.push({ Category: cat, Amount: amt.toFixed(2) });
    });
    rows.push({ Category: 'TOTAL REVENUE', Amount: report.totalIncome.toFixed(2) });
    
    // Spacer
    rows.push({ Category: '', Amount: '' });
    
    // Expense Section
    rows.push({ Category: 'EXPENSES', Amount: '' });
    Object.entries(report.expenses).forEach(([cat, amt]) => {
        rows.push({ Category: cat, Amount: amt.toFixed(2) });
    });
    rows.push({ Category: 'TOTAL EXPENSES', Amount: report.totalExpenses.toFixed(2) });
    
    // Net
    rows.push({ Category: '', Amount: '' });
    rows.push({ Category: 'NET INCOME', Amount: report.netIncome.toFixed(2) });

    exportToCSV(rows, `ProfitLoss_Report_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Opens a new window with a printer-friendly version of the report.
 */
export const printReport = (title: string, contentId: string) => {
    const printContent = document.getElementById(contentId);
    if (!printContent) return;

    const windowUrl = 'about:blank';
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=500,top=500,width=800,height=800');

    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
                        h1 { font-size: 24px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        h2 { font-size: 18px; margin-top: 20px; color: #555; }
                        .subtitle { font-size: 14px; color: #666; margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { text-align: left; border-bottom: 1px solid #ccc; padding: 8px 0; font-size: 12px; text-transform: uppercase; color: #666; }
                        td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
                        .total-row td { font-weight: bold; border-top: 2px solid #333; border-bottom: none; font-size: 16px; padding-top: 15px; }
                        .section-header td { font-weight: bold; background-color: #f9f9f9; padding-left: 5px; }
                        .text-right { text-align: right; }
                        .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
                    </style>
                </head>
                <body>
                    <h1>LedgerAI Inc.</h1>
                    <div class="subtitle">${title} - Generated on ${new Date().toLocaleDateString()}</div>
                    ${printContent.innerHTML}
                    <div class="footer">Generated by LedgerAI Autonomous Bookkeeping</div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
};
