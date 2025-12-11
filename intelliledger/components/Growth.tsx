
import React, { useState } from 'react';
import { Rocket, Target, DollarSign, Megaphone, TrendingUp, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import { generateMarketingPlanAI } from '../services/geminiService';
import { MarketingPlan, MarketingCampaign } from '../types';
import { MOCK_CAMPAIGNS } from '../services/mockDataService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Growth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'campaigns'>('strategy');
  
  // Strategy State
  const [businessType, setBusinessType] = useState('SaaS');
  const [goal, setGoal] = useState('Acquire 100 new leads');
  const [budget, setBudget] = useState<number>(1000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<MarketingPlan | null>(null);

  // Campaign State
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(MOCK_CAMPAIGNS);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateMarketingPlanAI(businessType, goal, budget);
    setPlan(result);
    setIsGenerating(false);
  };

  const handleLaunchCampaign = (channelName: string, allocPercent: number) => {
      const budgetAmt = (budget * allocPercent) / 100;
      const newCampaign: MarketingCampaign = {
          id: `cmp_${Date.now()}`,
          name: `${channelName} Campaign`,
          channel: channelName,
          status: 'ACTIVE',
          budget: budgetAmt,
          spent: 0,
          revenueAttributed: 0,
          startDate: new Date().toISOString().split('T')[0]
      };
      setCampaigns([newCampaign, ...campaigns]);
      setActiveTab('campaigns');
      alert(`Campaign "${newCampaign.name}" launched! Budget allocated: $${budgetAmt}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Growth & Marketing</h2>
          <p className="text-slate-500">AI-driven strategy and campaign management.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200">
        <button 
            onClick={() => setActiveTab('strategy')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'strategy' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Target size={16} /> Strategy Generator
        </button>
        <button 
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'campaigns' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Megaphone size={16} /> Campaign Manager
        </button>
      </div>

      {/* === STRATEGY TAB === */}
      {activeTab === 'strategy' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Input Form */}
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Rocket size={18} className="text-indigo-600" /> Plan Parameters
                      </h3>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                              <select 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                              >
                                  <option>SaaS</option>
                                  <option>E-Commerce / Retail</option>
                                  <option>Professional Services</option>
                                  <option>Local Business</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Goal</label>
                              <input 
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="e.g. Increase sales by 20%"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Budget</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-2 text-slate-500">$</span>
                                  <input 
                                    type="number"
                                    className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={budget}
                                    onChange={(e) => setBudget(Number(e.target.value))}
                                  />
                              </div>
                          </div>

                          <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                          >
                              {isGenerating ? (
                                  <Zap className="animate-spin" size={18} /> 
                              ) : (
                                  <Zap size={18} />
                              )}
                              {isGenerating ? 'Generating Strategy...' : 'Generate Plan'}
                          </button>
                      </div>
                  </div>
              </div>

              {/* Plan Output */}
              <div className="lg:col-span-2">
                  {plan ? (
                      <div className="space-y-6">
                          {/* Summary Card */}
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                              <h3 className="font-bold text-indigo-900 text-lg mb-2">Strategy Executive Summary</h3>
                              <p className="text-slate-700 leading-relaxed">{plan.strategySummary}</p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                  <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-indigo-600 shadow-sm border border-indigo-100">
                                      Audience: {plan.targetAudience}
                                  </span>
                                  <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-green-600 shadow-sm border border-green-100">
                                      Projected ROI: {plan.estimatedROI}
                                  </span>
                              </div>
                          </div>

                          {/* Channels Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {plan.channels.map((channel, idx) => (
                                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-start mb-3">
                                          <h4 className="font-bold text-slate-800">{channel.name}</h4>
                                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                                              {channel.allocationPercent}%
                                          </span>
                                      </div>
                                      <ul className="text-sm text-slate-600 space-y-1 mb-4 list-disc pl-4">
                                          {channel.recommendedTactics.map((tactic, tIdx) => (
                                              <li key={tIdx}>{tactic}</li>
                                          ))}
                                      </ul>
                                      <button 
                                        onClick={() => handleLaunchCampaign(channel.name, channel.allocationPercent)}
                                        className="w-full py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors"
                                      >
                                          Launch Campaign
                                      </button>
                                  </div>
                              ))}
                          </div>

                          {/* Content Calendar */}
                          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                  <Calendar size={18} /> Content Calendar Ideas
                              </h3>
                              <div className="space-y-2">
                                  {plan.contentCalendar.map((idea, idx) => (
                                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                              {idx + 1}
                                          </div>
                                          <span className="text-sm text-slate-700">{idea}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 p-12">
                          <Target size={48} className="mb-4 opacity-50" />
                          <p className="font-medium">Define your goals and click Generate to create a bespoke marketing plan.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* === CAMPAIGNS TAB === */}
      {activeTab === 'campaigns' && (
          <div className="space-y-6">
              
              {/* ROI CHART */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
                  <h3 className="font-bold text-slate-800 mb-4">Campaign Performance (ROI)</h3>
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={campaigns}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{fontSize: 12}} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="spent" name="Spend" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="revenueAttributed" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>

              {/* Campaign Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                          <tr>
                              <th className="px-6 py-3 font-semibold">Campaign Name</th>
                              <th className="px-6 py-3 font-semibold">Status</th>
                              <th className="px-6 py-3 font-semibold">Budget</th>
                              <th className="px-6 py-3 font-semibold">Spent</th>
                              <th className="px-6 py-3 font-semibold">Revenue</th>
                              <th className="px-6 py-3 font-semibold">ROI</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                          {campaigns.map(cmp => {
                              const roi = cmp.spent > 0 ? ((cmp.revenueAttributed - cmp.spent) / cmp.spent) * 100 : 0;
                              return (
                                  <tr key={cmp.id} className="hover:bg-slate-50">
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-slate-800">{cmp.name}</div>
                                          <div className="text-xs text-slate-500">{cmp.channel}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                                              cmp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                          }`}>
                                              {cmp.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 font-mono">${cmp.budget.toLocaleString()}</td>
                                      <td className="px-6 py-4 font-mono">${cmp.spent.toLocaleString()}</td>
                                      <td className="px-6 py-4 font-mono text-green-600 font-bold">${cmp.revenueAttributed.toLocaleString()}</td>
                                      <td className="px-6 py-4">
                                          <span className={`font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                              {roi.toFixed(1)}%
                                          </span>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default Growth;
