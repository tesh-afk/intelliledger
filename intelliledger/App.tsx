import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Receipts from './components/Receipts';
import Reports from './components/Reports';
import Invoices from './components/Invoices';
import Security from './components/Security';
import SystemHealth from './components/SystemHealth';
import Integrations from './components/Integrations';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import HelpDocs from './components/HelpDocs';
import GeneralLedger from './components/GeneralLedger';
import Workflows from './components/Workflows';
import QuickExpense from './components/QuickExpense';
import Pricing from './components/Pricing';
import Growth from './components/Growth';
import { User } from './types';
import { getCurrentUser, logout } from './services/authService';
import { initAnalytics, trackPageView, identifyUser } from './services/analyticsService';
import { LogOut, HelpCircle, ChevronDown, Building } from 'lucide-react';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [activeEntity, setActiveEntity] = useState('IntelliLedger Inc.');
  
  // New State for Public View vs App View
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Initialize Analytics Engine
    initAnalytics();

    // Check for existing session
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      identifyUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Track Tab Changes
  useEffect(() => {
      if (user) {
          trackPageView(currentTab);
      }
  }, [currentTab, user]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    identifyUser(loggedInUser);
    setShowLogin(false); // Clear login modal state if set
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setCurrentTab('dashboard'); // Reset tab
    setShowLogin(false); // Return to Landing Page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // --- PUBLIC STATE (Not Logged In) ---
  if (!user) {
    if (showLogin) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }
    // Show Landing Page by default
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // --- PRIVATE STATE (Logged In) ---
  const renderContent = () => {
    switch(currentTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'receipts': return <Receipts />;
      case 'invoices': return <Invoices />;
      case 'reports': return <Reports />;
      case 'ledger': return <GeneralLedger />;
      case 'workflows': return <Workflows />;
      case 'growth': return <Growth />;
      case 'security': return <Security />;
      case 'system': return <SystemHealth />;
      case 'settings': return <Integrations />;
      case 'quick_expense': return <QuickExpense />;
      case 'pricing': return <Pricing />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-background min-h-screen font-sans relative">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar for User Profile */}
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Organization:</span>
            {user.planId === 'enterprise' ? (
                <div className="relative group">
                    <button className="flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                        <Building size={14} />
                        {activeEntity}
                        <ChevronDown size={14} />
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 hidden group-hover:block z-50">
                        <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-400 font-bold uppercase">Switch Entity</div>
                        <button onClick={() => setActiveEntity('IntelliLedger Inc.')} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm font-medium">IntelliLedger Inc.</button>
                        <button onClick={() => setActiveEntity('Real Estate Holdings LLC')} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm font-medium">Real Estate Holdings LLC</button>
                        <button onClick={() => setActiveEntity('Offshore Investments Ltd')} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm font-medium">Offshore Investments Ltd</button>
                        <div className="border-t border-slate-100 p-2">
                            <button className="w-full text-center text-xs text-indigo-600 font-bold py-1 hover:underline">+ Add Entity</button>
                        </div>
                    </div>
                </div>
            ) : (
                <span className="font-semibold text-slate-700">IntelliLedger Inc.</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHelp(true)}
              className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg"
            >
              <HelpCircle size={18} />
              <span className="hidden md:inline">Help & Legal</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <div className="flex items-center justify-end gap-1">
                    <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200 uppercase">{user.planId || 'Trial'}</span>
                </div>
              </div>
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
              />
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-slate-50"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1">
            {renderContent()}
          </div>
          
          <footer className="max-w-7xl mx-auto w-full mt-8 pt-4 border-t border-slate-200 text-center">
             <p className="text-xs text-slate-400">
                 By using IntelliLedger, you agree to our <button onClick={() => setShowHelp(true)} className="text-indigo-500 hover:underline">Terms & Conditions</button>. 
                 Automated tax estimates must be verified by a professional.
             </p>
          </footer>
        </main>
      </div>

      <HelpDocs isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default App;