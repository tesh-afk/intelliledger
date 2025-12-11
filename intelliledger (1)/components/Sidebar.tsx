import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  ArrowRightLeft, 
  FileText, 
  Settings, 
  PieChart,
  ShieldCheck,
  Activity,
  BookOpen,
  Workflow,
  PlusSquare,
  CreditCard,
  Rocket
} from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const user = getCurrentUser();
  const role = user?.role || UserRole.STAFF; // Default to lowest privilege if unknown

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.OWNER, UserRole.CPA, UserRole.STAFF] },
    { id: 'quick_expense', label: 'Quick Expense', icon: PlusSquare, roles: [UserRole.OWNER, UserRole.STAFF] },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft, roles: [UserRole.OWNER, UserRole.CPA, UserRole.STAFF] },
    { id: 'receipts', label: 'Receipt Scanning', icon: Receipt, roles: [UserRole.OWNER, UserRole.STAFF] },
    { id: 'invoices', label: 'Invoices', icon: FileText, roles: [UserRole.OWNER, UserRole.STAFF] }, // CPA typically read-only, but can view
    { id: 'reports', label: 'Reports & Tax', icon: PieChart, roles: [UserRole.OWNER, UserRole.CPA] },
    { id: 'ledger', label: 'General Ledger', icon: BookOpen, roles: [UserRole.OWNER, UserRole.CPA] },
    { id: 'workflows', label: 'Business Workflows', icon: Workflow, roles: [UserRole.OWNER, UserRole.CPA] },
    { id: 'growth', label: 'Growth & Marketing', icon: Rocket, roles: [UserRole.OWNER] }, // Owner Only
    { id: 'security', label: 'Security & Audit', icon: ShieldCheck, roles: [UserRole.OWNER] }, // Owner Only
    { id: 'system', label: 'System Ops', icon: Activity, roles: [UserRole.OWNER] }, // Owner Only
    { id: 'pricing', label: 'Subscription', icon: CreditCard, roles: [UserRole.OWNER] },
    { id: 'settings', label: 'Integrations', icon: Settings, roles: [UserRole.OWNER] },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          IntelliLedger
        </h1>
        <p className="text-xs text-slate-400 mt-1">Autonomous Bookkeeping</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.filter(item => item.roles.includes(role)).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
          <p className="font-semibold text-white mb-1">Status</p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Gemini AI Connected</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700">
              <span className="uppercase text-[10px] font-bold text-slate-500">Current Role</span>
              <p className="text-indigo-400 font-medium">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;