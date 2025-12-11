
import React, { useState } from 'react';
import { X, Book, Zap, Shield, FileText, ArrowRight, Scale, Gavel, AlertTriangle } from 'lucide-react';

interface HelpDocsProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpDocs: React.FC<HelpDocsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'terms'>('guide');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-3">
             <Book size={20} className="text-indigo-400" />
             <h2 className="font-bold text-lg">Help & Legal Center</h2>
          </div>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded transition-colors">
             <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2 hidden md:block">
                <button 
                    onClick={() => setActiveTab('guide')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'guide' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <Book size={18} />
                    <span>User Guide</span>
                </button>
                <button 
                    onClick={() => setActiveTab('terms')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'terms' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    <Scale size={18} />
                    <span>Terms & Conditions</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
                
                {/* === USER GUIDE === */}
                {activeTab === 'guide' && (
                    <div className="max-w-3xl mx-auto space-y-12">
                        <div className="pb-4 border-b border-slate-100">
                            <h2 className="text-3xl font-bold text-slate-800">User Manual</h2>
                            <p className="text-slate-500 mt-2">How to use LedgerAI effectively.</p>
                        </div>

                        {/* Section 1 */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Zap className="text-amber-500" size={20} /> Getting Started
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                                <p className="text-slate-600 leading-relaxed">
                                    Welcome to <strong>LedgerAI</strong>. This system automates your bookkeeping by integrating with your existing bank feeds and accounting software.
                                </p>
                                <ul className="space-y-2 text-slate-600 list-disc pl-5 text-sm">
                                    <li><strong>Integrations:</strong> Navigate to Settings to connect Quickbooks, Xero, or Stripe.</li>
                                    <li><strong>Dashboard:</strong> View real-time financial health including P&L and Cash Flow.</li>
                                    <li><strong>Security:</strong> All actions are logged in the Audit Trail (Security Tab).</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="text-indigo-500" size={20} /> Managing Transactions
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                                <p className="text-slate-600 leading-relaxed">
                                    The Transactions tab is your main workspace.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white border border-slate-100 rounded-lg shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-1">Auto-Categorization</h4>
                                        <p className="text-xs text-slate-500">
                                            Click the magic wand button to have AI classify transactions based on description and amount. It learns from rules first.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-lg shadow-sm">
                                        <h4 className="font-bold text-slate-800 mb-1">Reconciliation</h4>
                                        <p className="text-xs text-slate-500">
                                            The system automatically matches bank lines to Receipts and Invoices. Use the "Reconciliation Queue" mode to focus on exceptions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Shield className="text-green-600" size={20} /> Admin Tools
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                                <ul className="space-y-3 text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <ArrowRight size={16} className="mt-1 text-slate-400"/>
                                        <span className="text-sm"><strong>Error Logs:</strong> View raw system logs in System Ops to diagnose sync failures.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ArrowRight size={16} className="mt-1 text-slate-400"/>
                                        <span className="text-sm"><strong>Audit Log:</strong> An immutable ledger of every user action is available in the Security tab.</span>
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </div>
                )}

                {/* === TERMS & CONDITIONS === */}
                {activeTab === 'terms' && (
                    <div className="max-w-3xl mx-auto space-y-10">
                        <div className="pb-4 border-b border-slate-100">
                            <h2 className="text-3xl font-bold text-slate-800">Terms & Conditions</h2>
                            <p className="text-slate-500 mt-2">Last Updated: October 2023</p>
                        </div>

                        {/* Critical Warning Box */}
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                            <h4 className="flex items-center gap-2 font-bold text-amber-800 text-lg mb-2">
                                <AlertTriangle size={20} /> Important Tax Disclaimer
                            </h4>
                            <p className="text-sm text-amber-900 leading-relaxed font-medium">
                                While LedgerAI uses advanced algorithms and local jurisdiction templates to generate tax reports, estimates, and filings, 
                                <strong> LedgerAI is not a registered public accounting firm, tax advisor, or legal counsel.</strong>
                            </p>
                            <p className="text-sm text-amber-800 leading-relaxed mt-2">
                                You explicitly acknowledge that automated outputs may contain errors due to data input quality or changing regulations. 
                                <strong> You agree to verify all financial reports and tax returns with a qualified local tax professional (CPA, Chartered Accountant, or Tax Attorney) before submitting them to any government authority.</strong>
                            </p>
                        </div>

                        <div className="prose prose-slate text-sm">
                            <h3 className="text-lg font-bold text-slate-800">1. Acceptance of Terms</h3>
                            <p>
                                By accessing or using the LedgerAI platform ("Service"), you agree to be bound by these Terms. If you do not agree to all the terms and conditions of this agreement, then you may not access the Service.
                            </p>

                            <h3 className="text-lg font-bold text-slate-800 mt-6">2. Use of Service</h3>
                            <p>
                                LedgerAI grants you a limited, non-exclusive, non-transferable, and revocable license to use the Service for your internal business purposes. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                            </p>

                            <h3 className="text-lg font-bold text-slate-800 mt-6">3. Accuracy of Data</h3>
                            <p>
                                The Service relies on data provided by you and third-party integrations (e.g., Plaid, QuickBooks). LedgerAI is not responsible for the accuracy, completeness, or timeliness of data imported from these sources. Reconciliation suggestions and AI categorizations are provided "as-is" and require user verification.
                            </p>

                            <h3 className="text-lg font-bold text-slate-800 mt-6">4. Limitation of Liability</h3>
                            <p>
                                To the maximum extent permitted by law, LedgerAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                            </p>

                            <h3 className="text-lg font-bold text-slate-800 mt-6">5. Data Privacy & Security</h3>
                            <p>
                                We implement industry-standard security measures (SOC2 Type II compliance) to protect your data. However, no method of transmission over the Internet is 100% secure. By using the Service, you acknowledge that you provide your personal and financial information at your own risk.
                            </p>

                            <h3 className="text-lg font-bold text-slate-800 mt-6">6. Compliance with Local Laws</h3>
                            <p>
                                You agree to use the Service in compliance with all applicable local, state, national, and international laws, rules, and regulations. You are solely responsible for all tax filings and payments required by your local jurisdiction.
                            </p>

                            <h3 className="text-lg font-bold text-slate-800 mt-6">7. Termination</h3>
                            <p>
                                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                            <Gavel size={14} className="mr-1" /> LedgerAI Legal Dept.
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
                Close
            </button>
        </div>

      </div>
    </div>
  );
};

export default HelpDocs;
