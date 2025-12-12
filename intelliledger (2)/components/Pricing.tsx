
import React, { useState } from 'react';
import { Check, X, Star, CreditCard, ShieldCheck } from 'lucide-react';
import { SubscriptionPlan } from '../types';

const PLANS: SubscriptionPlan[] = [
    {
        id: 'starter',
        name: 'Solopreneur',
        priceMonthly: 29,
        priceAnnual: 290,
        features: [
            'Connect 2 Bank Accounts',
            'Unlimited Invoicing',
            '500 Transactions / mo',
            'Basic P&L Reports',
            'Standard Support'
        ],
        missingFeatures: [
            'AI Executive Briefs',
            'Tax Compliance Engine',
            'Custom Industry Workflows',
            'Audit Logs'
        ]
    },
    {
        id: 'growth',
        name: 'Growth',
        priceMonthly: 79,
        priceAnnual: 790,
        recommended: true,
        features: [
            'Unlimited Bank Connections',
            'Unlimited Transactions',
            'Full Financial Reports (BS/CF)',
            'AI Executive Briefs',
            'Tax Compliance Engine',
            'SaaS/Service Workflows',
            'Unlimited Receipt Scanning'
        ],
        missingFeatures: [
            'Advanced Industry Templates',
            'Single Sign-On (SSO)',
            'Dedicated Account Manager'
        ]
    },
    {
        id: 'enterprise',
        name: 'Scale',
        priceMonthly: 199,
        priceAnnual: 1990,
        features: [
            'Everything in Growth',
            'Advanced Industry Workflows',
            'Multi-Entity Management',
            'Audit Logs & RBAC',
            'Priority Support',
            'API Access',
            'Dedicated Success Manager'
        ]
    }
];

const Pricing: React.FC = () => {
    const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
    const [currentPlan, setCurrentPlan] = useState<string>('trial'); // User starts on trial/free

    const handleUpgrade = (planId: string) => {
        if (confirm(`Confirm upgrade to ${planId.toUpperCase()} plan?`)) {
            setCurrentPlan(planId);
            alert("Subscription updated successfully! Welcome to your new plan.");
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-slate-800">Choose the Perfect Plan</h2>
                <p className="text-slate-500 max-w-xl mx-auto">
                    Automate your bookkeeping and tax compliance. Scale as you grow.
                </p>
                
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <span className={`text-sm font-bold ${billingInterval === 'MONTHLY' ? 'text-slate-800' : 'text-slate-400'}`}>Monthly</span>
                    <button 
                        onClick={() => setBillingInterval(prev => prev === 'MONTHLY' ? 'ANNUAL' : 'MONTHLY')}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${billingInterval === 'ANNUAL' ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${billingInterval === 'ANNUAL' ? 'translate-x-6' : ''}`}></div>
                    </button>
                    <span className={`text-sm font-bold ${billingInterval === 'ANNUAL' ? 'text-slate-800' : 'text-slate-400'}`}>
                        Annual <span className="text-green-600 text-xs ml-1">(Save 20%)</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map(plan => (
                    <div 
                        key={plan.id} 
                        className={`relative bg-white rounded-2xl shadow-lg border-2 flex flex-col ${
                            plan.recommended ? 'border-indigo-500 scale-105 z-10' : 'border-slate-100 hover:border-indigo-200 transition-colors'
                        }`}
                    >
                        {plan.recommended && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-md">
                                <Star size={12} fill="currentColor" /> Most Popular
                            </div>
                        )}

                        <div className="p-8 flex-1">
                            <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-slate-900">
                                    ${billingInterval === 'MONTHLY' ? plan.priceMonthly : Math.round(plan.priceAnnual / 12)}
                                </span>
                                <span className="text-slate-500 text-sm">/mo</span>
                            </div>
                            {billingInterval === 'ANNUAL' && (
                                <p className="text-xs text-green-600 font-medium mt-1">Billed ${plan.priceAnnual} yearly</p>
                            )}

                            <hr className="my-6 border-slate-100" />

                            <ul className="space-y-4">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="mt-0.5 min-w-[18px]"><Check size={18} className="text-green-500" /></div>
                                        {feature}
                                    </li>
                                ))}
                                {plan.missingFeatures?.map((feature, idx) => (
                                    <li key={`missing-${idx}`} className="flex items-start gap-3 text-sm text-slate-400">
                                        <div className="mt-0.5 min-w-[18px]"><X size={18} /></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-8 pt-0 mt-auto">
                            <button 
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={currentPlan === plan.id}
                                className={`w-full py-3 rounded-xl font-bold transition-all shadow-md ${
                                    plan.recommended 
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg' 
                                    : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200'
                                } ${currentPlan === plan.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {currentPlan === plan.id ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between border border-slate-200">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Enterprise Security included</h4>
                        <p className="text-sm text-slate-500">All plans come with SOC2 Type II compliance and 256-bit encryption.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <CreditCard size={16} /> Powered by Stripe
                </div>
            </div>
        </div>
    );
};

export default Pricing;
