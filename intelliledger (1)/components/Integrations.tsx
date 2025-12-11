
import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, 
  RefreshCw, 
  AlertCircle, 
  Settings, 
  Link2, 
  Terminal, 
  CreditCard, 
  Landmark, 
  FileSpreadsheet, 
  Shield,
  Download,
  Upload,
  FileText,
  Building2,
  Plug,
  Save,
  UserCheck,
  Lock,
  Globe,
  Search,
  ShoppingCart,
  Server,
  Mail,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';
import { Integration, IntegrationEvent, BusinessEntity } from '../types';
import { MOCK_INTEGRATIONS, MOCK_INTEGRATION_LOGS, MOCK_BUSINESS_ENTITY, addTransactions } from '../services/mockDataService';
import { triggerSync } from '../services/ingestionService';
import { downloadSpreadsheetTemplate, parseSpreadsheetData } from '../services/excelService';
import { getCurrentUser } from '../services/authService';
import { checkDomainAvailability, DomainResult } from '../services/domainService';

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connections' | 'identity'>('connections');
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [logs, setLogs] = useState<IntegrationEvent[]>(MOCK_INTEGRATION_LOGS);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Entity Form State
  const [entity, setEntity] = useState<BusinessEntity>(MOCK_BUSINESS_ENTITY);
  const [isSavingEntity, setIsSavingEntity] = useState(false);

  // Domain Search State
  const [domainQuery, setDomainQuery] = useState('getintelliledger');
  const [domainResults, setDomainResults] = useState<DomainResult[]>([]);
  const [isSearchingDomains, setIsSearchingDomains] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = getCurrentUser();
  const isStarter = user?.planId === 'starter';

  // Categorize Integrations based on ID or Name logic
  const categories = [
    { id: 'banking', label: 'Bank Feeds', icon: Landmark, items: integrations.filter(i => i.icon === 'Chase' || i.name.includes('Bank')) },
    { id: 'accounting', label: 'Accounting Core', icon: FileSpreadsheet, items: integrations.filter(i => ['QB', 'X', 'Z'].includes(i.icon)) },
    { id: 'payments', label: 'Payment Gateways', icon: CreditCard, items: integrations.filter(i => ['S', 'P'].includes(i.icon) && !i.name.includes('Identity') && !i.name.includes('KYC')) },
    { id: 'risk', label: 'Risk & Identity', icon: UserCheck, items: integrations.filter(i => i.name.includes('Identity') || i.name.includes('KYC')) },
    { id: 'offline', label: 'Offline / Spreadsheet', icon: FileText, items: [] }, // Custom handler for Excel
  ];

  const handleSync = async (id: string) => {
    // Limit Check for Starter Plan
    const bankCount = integrations.filter(i => (i.icon === 'Chase' || i.name.includes('Bank')) && i.connected).length;
    const targetInt = integrations.find(i => i.id === id);
    const isBank = targetInt?.name.includes('Bank') || targetInt?.icon === 'Chase';

    if (isStarter && isBank && bankCount >= 2 && !targetInt?.connected) {
        alert("Starter Plan Limit Reached: You can only connect 2 bank accounts. Please upgrade to Growth.");
        return;
    }

    const int = integrations.find(i => i.id === id);
    if (int) {
        setIsSyncing(true);
        // Optimistic log
        const startLog: IntegrationEvent = {
            id: Math.random().toString(),
            timestamp: new Date().toISOString(),
            type: 'SYNC',
            source: int.name,
            message: 'Manual sync initiated...'
        };
        setLogs(prev => [startLog, ...prev]);

        try {
            // Call the Ingestion Service
            await new Promise(r => setTimeout(r, 800)); // Visual delay
            const result = await triggerSync(id);
            
            // Update Logs
            setLogs(prev => [...result.events, ...prev]);
            
            // Update Integration Status
            setIntegrations(prev => prev.map(item => item.id === id ? { ...item, lastSync: 'Just now', connected: true } : item));
            
        } catch (e) {
            console.error(e);
        } finally {
            setIsSyncing(false);
        }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      
      setIsImporting(true);
      const file = files[0];

      try {
          const transactions = await parseSpreadsheetData(file);
          addTransactions(transactions);

          // Log success
          const log: IntegrationEvent = {
              id: `evt_import_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'SYNC',
              source: 'Excel Import',
              message: `Successfully ingested ${transactions.length} transactions from file.`,
              payloadSnippet: `File: ${file.name}`
          };
          setLogs(prev => [log, ...prev]);
          alert(`Successfully imported ${transactions.length} transactions.`);
      } catch (err: any) {
          const errorLog: IntegrationEvent = {
              id: `evt_err_${Date.now()}`,
              timestamp: new Date().toISOString(),
              type: 'ERROR',
              source: 'Excel Import',
              message: 'Failed to parse file.',
              payloadSnippet: err.message
          };
          setLogs(prev => [errorLog, ...prev]);
          alert(err.message);
      } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const saveEntitySettings = async () => {
      setIsSavingEntity(true);
      await new Promise(r => setTimeout(r, 1000));
      setIsSavingEntity(false);
      alert("Corporate identity settings saved.");
  };

  const handleDomainSearch = async () => {
      if (!domainQuery) return;
      setIsSearchingDomains(true);
      const results = await checkDomainAvailability(domainQuery);
      setDomainResults(results);
      setIsSearchingDomains(false);
  };

  const handleBuyDomain = (domain: string) => {
      alert(`Redirecting to registrar for ${domain}...`);
  };

  const FitBadge = ({ score }: { score: string }) => {
      if (score === 'HIGH') return <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold"><ThumbsUp size={10} /> Great Fit</span>;
      if (score === 'MEDIUM') return <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold"><Minus size={10} /> Good</span>;
      return <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold"><ThumbsDown size={10} /> Low Fit</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Settings & Integrations</h2>
          <p className="text-slate-500">Configure connections and corporate profile.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200">
        <button 
            onClick={() => setActiveTab('connections')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'connections' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Plug size={16} /> Data Connections
        </button>
        <button 
            onClick={() => setActiveTab('identity')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'identity' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Building2 size={16} /> Corporate Identity
        </button>
      </div>

      {/* === CONNECTION TAB === */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Main Grid: Integrations List */}
            <div className="lg:col-span-2 space-y-6">
                
                {isStarter && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <div>
                            <strong>Starter Plan Limit:</strong> You are limited to 2 active bank connections. 
                            <button className="underline ml-1 font-semibold">Upgrade to Growth</button> for unlimited.
                        </div>
                    </div>
                )}

                {categories.map(cat => (
                    <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <cat.icon size={18} className="text-slate-500" />
                            <h3 className="font-bold text-slate-700">{cat.label}</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Regular Integrations */}
                            {cat.id !== 'offline' ? (
                                <>
                                    {cat.items.length > 0 ? cat.items.map(int => (
                                        <div 
                                            key={int.id} 
                                            onClick={() => setSelectedIntegration(int)}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                                selectedIntegration?.id === int.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-lg text-slate-700 shadow-sm">
                                                    {int.icon}
                                                </div>
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    int.connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {int.connected ? 'Active' : 'Inactive'}
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-slate-800">{int.name}</h4>
                                            {int.connected ? (
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <RefreshCw size={10} className={isSyncing && selectedIntegration?.id === int.id ? "animate-spin" : ""} /> 
                                                    Last sync: {int.lastSync}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-slate-400 mt-1">Click to configure</p>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="text-xs text-slate-400 italic p-2 col-span-2">No integrations configured in this category.</div>
                                    )}
                                </>
                            ) : (
                                // Offline / Spreadsheet Card
                                <div className="col-span-2 border border-slate-200 rounded-lg p-6 bg-slate-50/50">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                <FileSpreadsheet className="text-green-600" size={20} /> Excel / CSV Import
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1 max-w-sm">
                                                For businesses without supported accounting software. Download our template, fill it out, and upload to ingest transactions.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button 
                                                onClick={downloadSpreadsheetTemplate}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <Download size={16} /> Get Template
                                            </button>
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isImporting}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                                            >
                                                {isImporting ? <RefreshCw className="animate-spin" size={16}/> : <Upload size={16} />}
                                                Upload Data
                                            </button>
                                            <input 
                                                ref={fileInputRef}
                                                type="file" 
                                                accept=".csv,.txt" 
                                                className="hidden" 
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar: Details & Event Bus */}
            <div className="space-y-6">
                
                {/* Configuration Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Settings size={18} /> Configuration
                    </h3>
                    {selectedIntegration ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-lg text-indigo-900">{selectedIntegration.name}</h4>
                                <button 
                                    onClick={() => handleSync(selectedIntegration.id)}
                                    disabled={isSyncing}
                                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 font-medium disabled:opacity-50"
                                >
                                    {isSyncing ? 'Syncing...' : (selectedIntegration.connected ? 'Force Sync' : 'Connect')}
                                </button>
                            </div>
                            
                            {/* Technical Details Mock */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Auth Type</label>
                                    <div className="text-sm text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">OAuth 2.0 (Token Valid)</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Webhook Endpoint</label>
                                    <div className="text-sm text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 truncate">
                                        https://api.getintelliledger.com/wh/{selectedIntegration.id}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Sync Cursor</label>
                                    <div className="text-sm text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 truncate">
                                        tx_9928381_v2
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex gap-2">
                                <button className="flex-1 py-2 text-sm border border-slate-300 rounded hover:bg-slate-50 text-slate-600 font-medium">Re-Authenticate</button>
                                <button className="flex-1 py-2 text-sm border border-red-200 bg-red-50 rounded hover:bg-red-100 text-red-600 font-medium">Disconnect</button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            Select an integration to view details.
                        </div>
                    )}
                </div>

                {/* Live Event Bus */}
                <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden flex flex-col h-[400px]">
                    <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-200 text-xs font-bold uppercase tracking-wider">
                            <Terminal size={14} /> Event Bus
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className="p-4 font-mono text-xs overflow-y-auto flex-1 space-y-3">
                        {logs.map(log => (
                            <div key={log.id} className="border-l-2 border-slate-700 pl-3 animate-in slide-in-from-left-2 fade-in duration-300">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span className={`font-bold ${
                                        log.type === 'ERROR' ? 'text-red-400' : 
                                        log.type === 'WEBHOOK' ? 'text-purple-400' : 'text-blue-400'
                                    }`}>
                                        {log.type}
                                    </span>
                                    <span className="text-slate-300">[{log.source}]</span>
                                </div>
                                <div className="text-slate-400">{log.message}</div>
                                {log.payloadSnippet && (
                                    <div className="text-slate-600 mt-0.5 truncate">{log.payloadSnippet}</div>
                                )}
                            </div>
                        ))}
                        <div className="text-slate-600 italic border-l-2 border-transparent pl-3">Waiting for events...</div>
                    </div>
                </div>

            </div>
        </div>
      )}

      {/* === IDENTITY TAB === */}
      {activeTab === 'identity' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Entity Configuration */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800">Legal Entity Configuration</h3>
                          <p className="text-slate-500 text-sm">Define your business structure for tax and banking compliance.</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
                          entity.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                          entity.status === 'PENDING_EIN' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                          <AlertCircle size={14} />
                          {entity.status === 'PENDING_EIN' ? 'Waiting for IRS' : 'Active'}
                      </div>
                  </div>
                  
                  <div className="p-8 space-y-8">
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Legal Business Name</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={entity.legalName}
                                onChange={(e) => setEntity({...entity, legalName: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Formation Service</label>
                              <select 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                value={entity.formationService}
                                onChange={(e) => setEntity({...entity, formationService: e.target.value as any})}
                              >
                                  <option value="Doola">Doola</option>
                                  <option value="Stripe Atlas">Stripe Atlas</option>
                                  <option value="Other">Other</option>
                              </select>
                          </div>
                      </div>

                      {/* Jurisdiction & Type */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Jurisdiction</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-slate-50 text-slate-600"
                                value={entity.jurisdiction}
                                readOnly
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Entity Type</label>
                              <select 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                value={entity.type}
                                onChange={(e) => setEntity({...entity, type: e.target.value as any})}
                              >
                                  <option value="LLC">LLC</option>
                                  <option value="C_CORP">C-Corporation</option>
                                  <option value="SOLE_PROP">Sole Proprietorship</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">NAICS Code</label>
                              <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={entity.naicsCode}
                                placeholder="e.g. 513210"
                                onChange={(e) => setEntity({...entity, naicsCode: e.target.value})}
                              />
                              <p className="text-xs text-slate-500 mt-1">Recommended: 513210 (Software Publishers)</p>
                          </div>
                      </div>

                      {/* EIN Input */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                          <h4 className="font-bold text-slate-800 mb-2">Tax ID (EIN) Configuration</h4>
                          <p className="text-sm text-slate-500 mb-4">
                              Enter your Employer Identification Number once received from the IRS. This is required to unlock banking integrations.
                          </p>
                          <div className="flex gap-4">
                              <input 
                                type="text" 
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                placeholder="XX-XXXXXXX"
                                value={entity.ein || ''}
                                onChange={(e) => setEntity({...entity, ein: e.target.value})}
                              />
                              <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 rounded border border-amber-100">
                                {entity.ein ? 'Ready for Banking' : 'Pending Issuance'}
                              </div>
                          </div>
                      </div>

                      <div className="flex justify-end pt-4">
                          <button 
                            onClick={saveEntitySettings}
                            disabled={isSavingEntity}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                          >
                              {isSavingEntity ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />}
                              Save Changes
                          </button>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* DOMAIN NAME FINDER */}
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden text-white">
                      <div className="p-6 border-b border-slate-800">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                              <Globe className="text-cyan-400" size={20} /> Digital Presence & Domain
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">
                              Manage your brand presence. (Status: Live)
                          </p>
                      </div>
                      <div className="p-8">
                          <div className="flex gap-2 mb-8">
                              <div className="relative flex-1">
                                  <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                                  <input 
                                    type="text" 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Enter your brand name"
                                    value={domainQuery}
                                    onChange={(e) => setDomainQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleDomainSearch()}
                                  />
                              </div>
                              <button 
                                onClick={handleDomainSearch}
                                disabled={isSearchingDomains}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                              >
                                  {isSearchingDomains ? <RefreshCw className="animate-spin" size={18} /> : 'Search'}
                              </button>
                          </div>

                          <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex justify-between items-center">
                              <div>
                                  <h4 className="text-white font-bold text-lg">getintelliledger.com</h4>
                                  <span className="text-green-400 text-xs font-bold uppercase">Active Domain</span>
                              </div>
                              <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors">Manage DNS</button>
                          </div>
                          
                          <div className="mt-4 text-xs text-slate-400">
                              <p>Primary Email: <strong>tesh@getintelliledger.com</strong></p>
                              <p className="mt-1">SSL Certificate: <span className="text-green-400">Valid</span></p>
                          </div>
                      </div>
                  </div>

                  {/* DOMAIN EXPLANATION CARD */}
                  <div className="bg-green-50 rounded-xl border border-green-200 p-6">
                      <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                          <Check size={20} /> Production Ready
                      </h3>
                      <p className="text-sm text-green-800 mb-6 leading-relaxed">
                          Great job! Your domain and email are configured. You are now eligible for live banking and payment processing.
                      </p>
                      
                      <div className="space-y-4">
                          <div className="flex gap-3">
                              <div className="p-2 bg-white rounded-lg border border-green-200 text-green-600 h-fit">
                                  <Plug size={18} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-green-900 text-sm">API Production Keys</h4>
                                  <p className="text-xs text-green-800 mt-1">
                                      Unlocked. You can now switch Stripe and Plaid to Live Mode.
                                  </p>
                              </div>
                          </div>

                          <div className="flex gap-3">
                              <div className="p-2 bg-white rounded-lg border border-green-200 text-green-600 h-fit">
                                  <Mail size={18} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-green-900 text-sm">Professional Email (Google Workspace)</h4>
                                  <p className="text-xs text-green-800 mt-1">
                                      Active. Emails sent from <strong>tesh@getintelliledger.com</strong> will have high deliverability.
                                  </p>
                              </div>
                          </div>

                          <div className="flex gap-3">
                              <div className="p-2 bg-white rounded-lg border border-green-200 text-green-600 h-fit">
                                  <Server size={18} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-green-900 text-sm">Trust & Security</h4>
                                  <p className="text-xs text-green-800 mt-1">
                                      Your brand is now verified and secure.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Integrations;
