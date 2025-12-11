import { Transaction, TransactionType, TransactionStatus } from '../types';

/**
 * Generates and triggers a download for the IntelliLedger Standard Spreadsheet Template.
 * Format is CSV, which opens natively in Excel.
 */
export const downloadSpreadsheetTemplate = () => {
  const headers = ['Date', 'Description', 'Amount', 'Currency', 'Type', 'Category', 'Notes'];
  const sampleRow1 = ['2023-11-01', 'Office Depot', '124.50', 'USD', 'EXPENSE', 'Office Supplies', 'Printer ink and paper'];
  const sampleRow2 = ['2023-11-02', 'Client Payment - Acme', '2500.00', 'USD', 'INCOME', 'Sales', 'Invoice #1001'];
  
  const csvContent = [
    headers.join(','),
    sampleRow1.join(','),
    sampleRow2.join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'intelliledger_bookkeeping_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Parses a raw text string (CSV format) into Transaction objects.
 */
export const parseSpreadsheetData = async (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        reject(new Error("File is empty"));
        return;
      }

      try {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Basic validation
        if (!headers.includes('date') || !headers.includes('amount')) {
          reject(new Error("Invalid format. Missing required columns (Date, Amount). Please use the template."));
          return;
        }

        const transactions: Transaction[] = [];

        // Parse rows (skipping header)
        for (let i = 1; i < lines.length; i++) {
          // Handle simple CSV splitting (does not handle quoted commas for simplicity in this mock)
          const cols = lines[i].split(',').map(c => c.trim());
          
          if (cols.length < headers.length) continue; // Skip malformed lines

          const tx: any = {
             id: `tx_xls_${Date.now()}_${i}`,
             status: TransactionStatus.COMPLETED,
             source: 'Manual',
             reconciliation: { status: 'UNRECONCILED' }
          };

          // Map columns based on index
          headers.forEach((header, index) => {
             const value = cols[index];
             
             switch (header) {
                 case 'date': tx.date = value; break;
                 case 'description': tx.description = value; break;
                 case 'amount': tx.amount = parseFloat(value); break;
                 case 'currency': tx.currency = value; break;
                 case 'type': tx.type = value.toUpperCase() === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE; break;
                 case 'category': tx.category = value; break;
                 case 'notes': tx.notes = value; break;
             }
          });

          // Fallback defaults
          if (!tx.currency) tx.currency = 'USD';
          if (!tx.type) tx.type = TransactionType.EXPENSE;
          if (!tx.category) tx.category = 'Uncategorized';

          transactions.push(tx as Transaction);
        }

        resolve(transactions);
      } catch (err) {
        reject(new Error("Failed to parse file. Ensure it is a valid CSV."));
      }
    };

    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsText(file);
  });
};