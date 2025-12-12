
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Rocket, CheckCircle2, Lock, Clock, Building2, UserCheck, PlayCircle } from 'lucide-react';
import { generateFinancialInsight } from '../services/geminiService';
import { OnboardingStep } from '../types';

const data = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
  { name: 'Jul', income: 3490, expenses: 4300 },
];

const mockSteps: OnboardingStep[] = [
    { id: '1', label: 'Company Formation', status: 'COMPLETED', description: 'Registered via Doola (Wyoming LLC)' },
    { id: '2', label: 'EIN Assignment', status: 'IN_PROGRESS', description: 'Waiting for IRS (Est. 1-2 weeks)' },
    { id: '3', label: 'Identity / KYC', status: 'COMPLETED', description: 'Verified Signatory ID' },
    { id: '4', label: 'Business Banking', status: 'PENDING', description: 'Ready to apply with getintelliledger.com' },
];

const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string>('Analyzing financial data...');

  useEffect(() => {
    // Simulate fetching insight on mount
    const fetchInsight = async () => {
      // Create a simplified summary string for the AI
      const summary = "Net Income is volatile. Expenses spiked in March due to capital investment. Current month shows recovery.";
      const aiText = await generateFinancialInsight(summary);
      setInsight(aiText);
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Executive Dashboard</h2>
        <p className="text-slate-500">Real-time financial overview for Tesh</p>
      </header>

      {/* STARTUP LAUNCHPAD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500 rounded-lg">
                  <Rocket className="text-white" size={24} />
              </div>
              <div>
                  <h3 className="text-xl font-bold">Startup Launchpad</h3>
                  <p className="text-slate-400 text-sm">Track your business setup progress</p>
              </div>
          </div>

          <div className="relative">
              {/* Connector Line */}
              <div className="absolute top-5 left-0 w-full h-1 bg-slate-700 -z-0"></div>
              
              <div className="flex justify-between relative z-10">
                  {mockSteps.map((step, idx) => (
                      <div key={step.id} className="flex flex-col items-center flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                              step.status === 'COMPLETED' ? 'bg-green-500 border-slate-900 text-white' : 
                              step.status === 'IN_PROGRESS' ? 'bg-amber-500 border-slate-900 text-white animate-pulse' : 
                              step.status === 'PENDING' ? 'bg-white border-slate-900 text-indigo-600' :
                              'bg-slate-700 border-slate-900 text-slate-400'
                          }`}>
                              {step.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : 
                               step.status === 'LOCKED' ? <Lock size={18} /> : 
                               step.status === 'PENDING' ? <PlayCircle size={20} /> :
                               <Clock size={20} />}
                          </div>
                          <div className="text-center mt-3">
                              <h4 className={`text-sm font-bold ${step.status === 'LOCKED' ? 'text-slate-500' : 'text-white'}`}>{step.label}</h4>
                              <p className="text-[10px] text-slate-400 mt-1 max-w-[120px] mx-auto">{step.description}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$124,500" 
          change="+12.5%" 
          isPositive={true} 
          icon={DollarSign}
        />
        <StatCard 
          title="Total Expenses" 
          value="$82,100" 
          change="+4.2%" 
          isPositive={false} 
          icon={ArrowDownRight}
        />
        <StatCard 
          title="Net Profit" 
          value="$42,400" 
          change="+24.2%" 
          isPositive={true} 
          icon={TrendingUp}
        />
        <StatCard 
          title="Pending Invoices" 
          value="$8,250" 
          change="-2.1%" 
          isPositive={false} 
          icon={ArrowUpRight} 
        />
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-xl shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-indigo-900 font-semibold text-lg mb-1">Gemini Financial Insight</h3>
            <p className="text-indigo-800 leading-relaxed">
              {insight}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Cash Flow</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#4f46e5" fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-semibold text-slate-800 mb-4">Profit vs Loss</h3>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      <span className={`text-sm font-medium mt-2 block ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        {change} from last month
      </span>
    </div>
    <div className={`p-3 rounded-full ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
      <Icon size={24} />
    </div>
  </div>
);

export default Dashboard;