
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { Activity, Clock, AlertTriangle, CheckCircle2, RotateCw, Server, Zap, Play, Workflow, AlertOctagon, FileWarning } from 'lucide-react';
import { MOCK_WORKFLOWS, MOCK_METRICS, MOCK_CIRCUIT_BREAKERS, MOCK_SCHEDULES, MOCK_ALERTS, MOCK_INTEGRATION_LOGS } from '../services/mockDataService';

const SystemHealth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orchestrator' | 'observability' | 'schedules'>('orchestrator');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">System Operations</h2>
          <p className="text-slate-500">Orchestration, Reliability & Observability</p>
        </div>
        
        {/* Global Status Indicator */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
           <div className={`w-3 h-3 rounded-full ${MOCK_ALERTS.some(a => a.status === 'ACTIVE') ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
           <span className="text-sm font-bold text-slate-700">
              {MOCK_ALERTS.some(a => a.status === 'ACTIVE') ? 'System Degraded' : 'All Systems Operational'}
           </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-6 border-b border-slate-200">
        <button 
            onClick={() => setActiveTab('orchestrator')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'orchestrator' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Workflow size={16} /> Orchestrator (Temporal)
        </button>
        <button 
            onClick={() => setActiveTab('observability')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'observability' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Activity size={16} /> Observability & Logs
        </button>
        <button 
            onClick={() => setActiveTab('schedules')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'schedules' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Clock size={16} /> Schedules (Cron)
        </button>
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div className="min-h-[600px]">
        
        {/* === ORCHESTRATOR TAB === */}
        {activeTab === 'orchestrator' && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Workflow Stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="text-sm font-bold text-slate-500 uppercase">Active Workflows</h3>
                   <div className="text-3xl font-bold text-slate-800 mt-2">12</div>
                   <div className="text-xs text-green-600 mt-1 flex items-center"><Zap size={12} className="mr-1"/> 450 processed / hour</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="text-sm font-bold text-slate-500 uppercase">Retry Queue (DLQ)</h3>
                   <div className="text-3xl font-bold text-slate-800 mt-2">3</div>
                   <div className="text-xs text-amber-600 mt-1 flex items-center"><AlertTriangle size={12} className="mr-1"/> Exponential backoff active</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="text-sm font-bold text-slate-500 uppercase">Avg. Completion Time</h3>
                   <div className="text-3xl font-bold text-slate-800 mt-2">2.4s</div>
                   <div className="text-xs text-slate-400 mt-1">P95: 4.1s</div>
                </div>
             </div>

             {/* Workflow List */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800">Recent Workflow Executions</h3>
                   <button className="text-xs text-indigo-600 font-medium hover:underline">View Historical Traces</button>
                </div>
                <div className="divide-y divide-slate-100">
                   {MOCK_WORKFLOWS.map(wf => (
                      <div key={wf.id} className="p-6 hover:bg-slate-50 transition-colors">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-800">{wf.name}</h4>
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                     wf.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                     wf.status === 'RETRYING' ? 'bg-amber-100 text-amber-700' :
                                     'bg-red-100 text-red-700'
                                  }`}>
                                     {wf.status}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono">{wf.id}</span>
                               </div>
                               <p className="text-xs text-slate-500 mt-1">Started: {new Date(wf.startTime).toLocaleTimeString()}</p>
                            </div>
                            {wf.status === 'RETRYING' && (
                               <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded transition-colors">
                                  <RotateCw size={14} /> Replay
                               </button>
                            )}
                         </div>

                         {/* Step Visualization */}
                         <div className="relative">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                            <div className="flex justify-between relative z-10">
                               {wf.steps.map((step, idx) => (
                                  <div key={idx} className="flex flex-col items-center">
                                     <div className={`w-3 h-3 rounded-full border-2 ${
                                        step.status === 'COMPLETED' ? 'bg-green-500 border-green-500' :
                                        step.status === 'FAILED' ? 'bg-red-500 border-red-500' :
                                        'bg-slate-100 border-slate-300'
                                     }`}></div>
                                     <span className={`text-[10px] mt-2 font-medium ${
                                         step.status === 'FAILED' ? 'text-red-600' : 'text-slate-500'
                                     }`}>{step.name}</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                         
                         {wf.error && (
                             <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100 font-mono">
                                Error: {wf.error} (Retry {wf.retryCount}/5)
                             </div>
                         )}
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* === OBSERVABILITY TAB === */}
        {activeTab === 'observability' && (
          <div className="space-y-6">
            
            {/* Active Alerts */}
            {MOCK_ALERTS.some(a => a.status === 'ACTIVE') && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
                    <AlertTriangle className="text-amber-600 mt-1" size={20} />
                    <div>
                        <h4 className="font-bold text-amber-900">Active Incidents</h4>
                        <ul className="space-y-1 mt-1">
                            {MOCK_ALERTS.filter(a => a.status === 'ACTIVE').map(alert => (
                                <li key={alert.id} className="text-sm text-amber-800">
                                    <span className="font-bold">[{alert.severity}]</span> {alert.message} <span className="text-xs opacity-70">({alert.timestamp})</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Metrics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">API Latency (P95)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_METRICS}>
                                <defs>
                                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="timestamp" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="latency" stroke="#6366f1" fillOpacity={1} fill="url(#colorLatency)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Queue Depth & Throughput</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_METRICS}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="timestamp" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="queueDepth" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ERROR LOGS (Admin Tool) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertOctagon size={18} className="text-red-500" /> System Error Logs
                    </h3>
                    <button className="text-xs text-slate-500 hover:text-slate-700 font-medium border border-slate-300 rounded px-2 py-1">
                        Export Logs
                    </button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Timestamp</th>
                            <th className="px-6 py-3 font-semibold">Severity</th>
                            <th className="px-6 py-3 font-semibold">Source</th>
                            <th className="px-6 py-3 font-semibold">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {MOCK_INTEGRATION_LOGS.filter(l => l.type === 'ERROR').length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No recent errors found.</td></tr>
                        ) : (
                            MOCK_INTEGRATION_LOGS.filter(l => l.type === 'ERROR').map(log => (
                                <tr key={log.id} className="hover:bg-red-50/50">
                                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-6 py-3">
                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">CRITICAL</span>
                                    </td>
                                    <td className="px-6 py-3 font-medium text-slate-700">{log.source}</td>
                                    <td className="px-6 py-3 text-slate-600">
                                        {log.message}
                                        {log.payloadSnippet && <div className="font-mono text-xs text-slate-400 mt-1">{log.payloadSnippet}</div>}
                                    </td>
                                </tr>
                            ))
                        )}
                        {/* Mocking some errors if list is empty for visualization */}
                        {MOCK_INTEGRATION_LOGS.length > 0 && MOCK_INTEGRATION_LOGS.filter(l => l.type === 'ERROR').length === 0 && (
                             <tr className="hover:bg-red-50/50 opacity-60">
                                <td className="px-6 py-3 text-slate-500 font-mono text-xs">10:45:22 AM</td>
                                <td className="px-6 py-3"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">ERROR</span></td>
                                <td className="px-6 py-3 font-medium text-slate-700">QuickBooks Online</td>
                                <td className="px-6 py-3 text-slate-600">Timeout waiting for gateway 504</td>
                             </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Circuit Breakers */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Server size={18} /> Integration Circuit Breakers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MOCK_CIRCUIT_BREAKERS.map((cb, idx) => (
                        <div key={idx} className={`p-4 rounded-lg border ${
                            cb.state === 'CLOSED' ? 'border-green-200 bg-green-50' : 
                            cb.state === 'HALF_OPEN' ? 'border-amber-200 bg-amber-50' : 
                            'border-red-200 bg-red-50'
                        }`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    cb.state === 'CLOSED' ? 'bg-green-200 text-green-800' : 
                                    cb.state === 'HALF_OPEN' ? 'bg-amber-200 text-amber-800' : 
                                    'bg-red-200 text-red-800'
                                }`}>
                                    {cb.state}
                                </span>
                                {cb.state !== 'CLOSED' && (
                                    <button className="text-slate-400 hover:text-slate-600"><RotateCw size={14}/></button>
                                )}
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">{cb.serviceName}</h4>
                            <p className="text-xs text-slate-500">Failures: {cb.failureCount}</p>
                            {cb.lastFailure && <p className="text-xs text-red-600 mt-1 truncate" title={cb.lastFailure}>{cb.lastFailure}</p>}
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* === SCHEDULES TAB === */}
        {activeTab === 'schedules' && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100">
                   <h3 className="font-bold text-slate-800">Cron Jobs & Schedules</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Job Name</th>
                            <th className="px-6 py-3 font-semibold">Schedule (Cron)</th>
                            <th className="px-6 py-3 font-semibold">Last Run</th>
                            <th className="px-6 py-3 font-semibold">Next Run</th>
                            <th className="px-6 py-3 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {MOCK_SCHEDULES.map(job => (
                            <tr key={job.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                    {job.name}
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-500 bg-slate-50 rounded w-fit">{job.schedule}</td>
                                <td className="px-6 py-4 text-slate-600">{job.lastRun}</td>
                                <td className="px-6 py-4 text-slate-600">{job.nextRun}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-xs font-medium border border-indigo-200">
                                        Trigger Now
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        )}

      </div>
    </div>
  );
};

export default SystemHealth;
