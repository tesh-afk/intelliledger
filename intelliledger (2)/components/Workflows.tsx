
import React, { useState } from 'react';
import { Briefcase, ShoppingBag, Server, ArrowRight, Play, Check, Settings2, Box, Lock } from 'lucide-react';
import { BusinessType, SimulationResult } from '../types';
import { simulateWorkflow } from '../services/rulesEngineService';
import { getCurrentUser } from '../services/authService';

const Workflows: React.FC = () => {
  const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.SAAS);
  const [simulationAmount, setSimulationAmount] = useState<number>(1200);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const user = getCurrentUser();
  const isEnterprise = user?.planId === 'enterprise';

  const handleSimulate = () => {
    const res = simulateWorkflow(businessType, simulationAmount);
    setResult(res);
  };

  const types = [
    { id: BusinessType.SAAS, label: 'SaaS / Subscription', icon: Server, desc: 'Revenue recognition, deferred revenue, recurring billing.', locked: false },
    { id: BusinessType.RETAIL, label: 'Retail / E-Commerce', icon: ShoppingBag, desc: 'Inventory management, COGS, point of sale integration.', locked: false },
    { id: BusinessType.SERVICES, label: 'Professional Services', icon: Briefcase, desc: 'WIP billing, project-based accounting, retainers.', locked: false },
    { id: BusinessType.MANUFACTURING, label: 'Manufacturing', icon: Box, desc: 'BOM tracking, WIP inventory, finished goods.', locked: !isEnterprise },
    { id: BusinessType.CONSTRUCTION, label: 'Construction', icon: Briefcase, desc: 'Progress billing, percentage of completion.', locked: !isEnterprise }
  ];

  const handleTypeSelect = (t: any) => {
      if (t.locked) {
          alert("This industry workflow is only available on the Scale (Enterprise) plan.");
          return;
      }
      setBusinessType(t.id); 
      setResult(null);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Business Workflows</h2>
          <p className="text-slate-500">Custom rules engine for specific business models.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Configuration Column */}
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Settings2 size={18} /> Model Configuration
                  </h3>
                  <div className="space-y-3">
                      {types.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => handleTypeSelect(t)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all relative ${
                                businessType === t.id 
                                ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                                : t.locked ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                              {t.locked && <Lock size={14} className="absolute top-4 right-4 text-slate-400" />}
                              <div className="flex items-center gap-3 mb-2">
                                  <div className={`p-2 rounded-lg ${businessType === t.id ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                                      <t.icon size={18} />
                                  </div>
                                  <span className="font-bold text-slate-800">{t.label}</span>
                              </div>
                              <p className="text-xs text-slate-500">{t.desc}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Simulation Column */}
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Play size={18} className="text-green-600" /> Accounting Simulator
                  </h3>

                  <div className="flex items-end gap-4 mb-8 bg-slate-50 p-4 rounded-lg">
                      <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mock Transaction Amount</label>
                          <div className="relative">
                              <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                              <input 
                                type="number" 
                                value={simulationAmount}
                                onChange={(e) => setSimulationAmount(Number(e.target.value))}
                                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500"
                              />
                          </div>
                      </div>
                      <button 
                        onClick={handleSimulate}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md transition-colors"
                      >
                          Run Simulation
                      </button>
                  </div>

                  {result && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                          
                          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r text-sm text-blue-800">
                              <h4 className="font-bold mb-2 flex items-center gap-2">
                                  <Box size={16} /> Workflow Explanation
                              </h4>
                              <div className="whitespace-pre-line">{result.explanation}</div>
                          </div>

                          <div>
                              <h4 className="font-bold text-slate-700 mb-4">Generated Journal Entries</h4>
                              <div className="space-y-4">
                                  {result.journalEntries.map((je, idx) => (
                                      <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                                          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                              <span className="font-mono text-xs font-bold text-slate-500">ENTRY #{idx + 1}</span>
                                              <span className="text-xs font-bold text-slate-700">{je.description}</span>
                                              <span className="text-xs text-slate-400">{je.date}</span>
                                          </div>
                                          <table className="w-full text-sm">
                                              <thead className="bg-white border-b border-slate-100">
                                                  <tr>
                                                      <th className="px-4 py-2 text-left text-xs text-slate-500">Account</th>
                                                      <th className="px-4 py-2 text-right text-xs text-slate-500 w-24">Debit</th>
                                                      <th className="px-4 py-2 text-right text-xs text-slate-500 w-24">Credit</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="bg-white">
                                                  {je.lines.map((line, lIdx) => (
                                                      <tr key={lIdx}>
                                                          <td className="px-4 py-2 text-slate-700 font-mono text-xs">
                                                              {line.accountId} - {line.accountName}
                                                          </td>
                                                          <td className="px-4 py-2 text-right font-mono text-slate-600">
                                                              {line.debit ? `$${line.debit.toFixed(2)}` : ''}
                                                          </td>
                                                          <td className="px-4 py-2 text-right font-mono text-slate-600">
                                                              {line.credit ? `$${line.credit.toFixed(2)}` : ''}
                                                          </td>
                                                      </tr>
                                                  ))}
                                              </tbody>
                                          </table>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Workflows;
