
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Users, Activity, FileKey, RefreshCw, Eye, EyeOff, Globe, Server, Download, Trash2, CheckCircle2, UserCheck, Upload, AlertCircle } from 'lucide-react';
import { MOCK_USERS, delay } from '../services/mockDataService';
import { UserRole, KYCRecord, AuditLogEntry } from '../types';
import { performKYCVerification } from '../services/kycService';
import { getCurrentUser } from '../services/authService';
import { getAuditLogs } from '../services/auditService';

const Security: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'compliance' | 'kyc'>('audit');
  const [integrityVerified, setIntegrityVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // KYC State
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycStatus, setKycStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [kycRecord, setKycRecord] = useState<KYCRecord | null>(null);

  useEffect(() => {
      // Load logs on mount
      const logs = getAuditLogs();
      setAuditLogs(logs);
      
      // Poll for updates if viewing Audit tab
      if (activeTab === 'audit') {
          const interval = setInterval(() => {
              setAuditLogs(getAuditLogs());
          }, 2000);
          return () => clearInterval(interval);
      }
  }, [activeTab]);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    await delay(1500); // Simulate crypto hash check
    setIsVerifying(false);
    setIntegrityVerified(true);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleKYCUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setKycFile(e.target.files[0]);
      }
  };

  const submitKYC = async () => {
      if (!kycFile) return;
      setKycStatus('PROCESSING');
      
      const user = getCurrentUser() || MOCK_USERS[0];
      
      try {
          const record = await performKYCVerification(user, kycFile);
          setKycRecord(record);
          if (record.status === 'VERIFIED') {
              setKycStatus('SUCCESS');
          } else {
              setKycStatus('ERROR');
          }
      } catch (e) {
          setKycStatus('ERROR');
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Security, Compliance & Audit</h2>
          <p className="text-slate-500">Manage access controls, data privacy, and view immutable logs.</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-100">
          <ShieldCheck size={16} />
          <span>SOC2 Compliant</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200">
        <button 
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'audit' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Activity size={16} /> Audit Log
        </button>
        <button 
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'users' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Users size={16} /> Team & Access
        </button>
        <button 
            onClick={() => setActiveTab('kyc')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'kyc' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <UserCheck size={16} /> Identity & KYC
        </button>
        <button 
            onClick={() => setActiveTab('compliance')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'compliance' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
            <Lock size={16} /> Compliance
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
        
        {/* TAB: AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="p-0">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
               <div>
                  <h3 className="font-bold text-slate-800">Immutable Ledger</h3>
                  <p className="text-xs text-slate-500">All actions are hashed and appended.</p>
               </div>
               <button 
                 onClick={handleVerifyIntegrity}
                 disabled={isVerifying || integrityVerified}
                 className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    integrityVerified 
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
                 }`}
               >
                 {isVerifying ? (
                   <RefreshCw className="animate-spin" size={16} />
                 ) : integrityVerified ? (
                   <CheckCircle2 size={16} />
                 ) : (
                   <FileKey size={16} />
                 )}
                 <span>
                    {isVerifying ? 'Verifying Hashes...' : integrityVerified ? 'Chain Verified' : 'Verify Integrity'}
                 </span>
               </button>
             </div>
             
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-3 font-semibold">Timestamp</th>
                        <th className="px-6 py-3 font-semibold">Actor</th>
                        <th className="px-6 py-3 font-semibold">Action</th>
                        <th className="px-6 py-3 font-semibold">Resource</th>
                        <th className="px-6 py-3 font-semibold font-mono">Hash (SHA-256)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                            <td className="px-6 py-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                   {log.actorName.charAt(0)}
                                </div>
                                {log.actorName}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                    log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">{log.resource}</td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-[150px]" title={log.hash}>
                                {log.hash.substring(0, 20)}...
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
        )}

        {/* TAB: USERS & RBAC */}
        {activeTab === 'users' && (
           <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* User List */}
                  <div className="md:col-span-2 space-y-4">
                     <h3 className="font-bold text-slate-800 mb-4">Team Members</h3>
                     {MOCK_USERS.map(user => (
                         <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                             <div className="flex items-center space-x-4">
                                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full bg-slate-100" />
                                <div>
                                    <h4 className="font-bold text-slate-800">{user.name}</h4>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                             </div>
                             <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <span className={`block text-xs font-bold uppercase ${
                                        user.role === UserRole.OWNER ? 'text-purple-600' :
                                        user.role === UserRole.CPA ? 'text-green-600' : 'text-blue-600'
                                    }`}>
                                        {user.role}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {user.kycStatus === 'VERIFIED' ? 'ID Verified' : 'ID Pending'}
                                    </span>
                                </div>
                                <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500">
                                    <option>Edit Role</option>
                                    <option>Reset MFA</option>
                                    <option className="text-red-600">Revoke Access</option>
                                </select>
                             </div>
                         </div>
                     ))}
                     <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors font-medium">
                        + Invite New Member
                     </button>
                  </div>

                  {/* Role Definitions */}
                  <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 h-fit">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Lock size={18} /> Least Privilege
                      </h3>
                      <div className="space-y-4">
                          {[
                              { role: 'OWNER', access: ['Full Admin', 'Billing', 'User Management', 'Data Export'] },
                              { role: 'CPA', access: ['Read Only (Financials)', 'Tax Filing', 'Reconciliation', 'No Settings Access'] },
                              { role: 'STAFF', access: ['Create Invoices', 'Upload Receipts', 'No Banking Access', 'No Reports'] }
                          ].map(roleDef => (
                              <div key={roleDef.role} className="bg-white p-3 rounded shadow-sm border border-slate-100">
                                  <h5 className="font-bold text-xs text-slate-700 uppercase mb-2">{roleDef.role}</h5>
                                  <ul className="space-y-1">
                                      {roleDef.access.map(perm => (
                                          <li key={perm} className="text-xs text-slate-500 flex items-center gap-1">
                                              <div className="w-1 h-1 bg-slate-400 rounded-full"></div> {perm}
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
           </div>
        )}

        {/* TAB: KYC / IDENTITY */}
        {activeTab === 'kyc' && (
            <div className="p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 bg-indigo-100 rounded-full text-indigo-600 mb-4">
                            <UserCheck size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Identity Verification</h3>
                        <p className="text-slate-500 mt-2">To comply with banking regulations (AML/KYC), we need to verify the identity of all business signatories.</p>
                    </div>

                    {kycStatus === 'SUCCESS' ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-in zoom-in duration-300">
                            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-green-800">Verification Complete</h4>
                            <p className="text-green-700 mt-2">Your identity has been verified successfully. You now have full access to banking and tax features.</p>
                            <div className="mt-4 text-xs text-green-600 font-mono">ID: {kycRecord?.id} • {new Date().toLocaleDateString()}</div>
                        </div>
                    ) : kycStatus === 'ERROR' ? (
                         <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-in shake duration-300">
                            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-red-800">Verification Failed</h4>
                            <p className="text-red-700 mt-2">
                                {kycRecord?.reason || 'We could not verify your document. Please try again with a clearer image.'}
                            </p>
                            <button onClick={() => setKycStatus('IDLE')} className="mt-4 text-red-700 underline font-bold">Try Again</button>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-2">1. Select Document Type</label>
                                    <select className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>Passport</option>
                                        <option>Driver's License</option>
                                        <option>National ID Card</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-2">2. Upload Document Image</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleKYCUpload}
                                            accept="image/*,.pdf"
                                        />
                                        <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                                        {kycFile ? (
                                            <p className="text-indigo-600 font-bold">{kycFile.name}</p>
                                        ) : (
                                            <p className="text-slate-500">Click to upload or drag & drop</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-500">
                                    <p className="mb-2"><strong>Privacy Note:</strong> Your data is encrypted and sent securely to our verification partner (Stripe Identity). We do not store your raw ID images.</p>
                                    <p>By clicking verify, you consent to a biometric scan for identity verification purposes.</p>
                                </div>

                                <button 
                                    onClick={submitKYC}
                                    disabled={!kycFile || kycStatus === 'PROCESSING'}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {kycStatus === 'PROCESSING' ? (
                                        <>
                                            <RefreshCw className="animate-spin" /> Verifying...
                                        </>
                                    ) : (
                                        'Submit for Verification'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* TAB: COMPLIANCE */}
        {activeTab === 'compliance' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Data Protection */}
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Server size={20} className="text-indigo-600" /> Data Isolation & Encryption
                        </h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-slate-700">Tenant Isolation</p>
                                     <p className="text-xs text-slate-500">Row-level security enforced by <code>tenant_id</code></p>
                                 </div>
                                 <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">ENFORCED</div>
                             </div>
                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-slate-700">Encryption at Rest</p>
                                     <p className="text-xs text-slate-500">AWS KMS Key: <code>alias/ledger-tenant-101</code></p>
                                 </div>
                                 <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">AES-256</div>
                             </div>
                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="font-medium text-slate-700">Data Residency</p>
                                     <p className="text-xs text-slate-500">US East (N. Virginia)</p>
                                 </div>
                                 <Globe size={16} className="text-slate-400" />
                             </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Users size={20} className="text-indigo-600" /> GDPR / Privacy Controls
                        </h3>
                         <div className="flex gap-3">
                             <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                                 <Download size={16} /> Export Data (JSON)
                             </button>
                             <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium text-red-600">
                                 <Trash2 size={16} /> Anonymize PII
                             </button>
                         </div>
                    </div>
                </div>

                {/* Secrets Management */}
                <div>
                     <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <FileKey size={20} className="text-indigo-600" /> Secrets Vault
                     </h3>
                     <p className="text-sm text-slate-500 mb-4">API keys are stored in a dedicated Secrets Manager and never logged.</p>
                     
                     <div className="bg-slate-900 rounded-lg p-1 overflow-hidden">
                        {[
                            { name: 'Stripe API Key', id: 'key_stripe' },
                            { name: 'Plaid Client Secret', id: 'key_plaid' },
                            { name: 'QuickBooks OAuth', id: 'key_qb' }
                        ].map((key, idx) => (
                            <div key={key.id} className={`flex items-center justify-between p-3 ${idx !== 2 ? 'border-b border-slate-700' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow shadow-green-500/50"></div>
                                    <span className="text-slate-300 text-sm font-medium">{key.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-slate-500 text-sm">
                                        {showKeys[key.id] ? 'sk_live_51M...' : '••••••••••••'}
                                    </span>
                                    <button 
                                        onClick={() => toggleKeyVisibility(key.id)}
                                        className="text-slate-500 hover:text-white"
                                    >
                                        {showKeys[key.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors">
                                        Rotate
                                    </button>
                                </div>
                            </div>
                        ))}
                     </div>
                     <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                         <h5 className="text-xs font-bold text-amber-800 uppercase mb-1">Audit Policy</h5>
                         <p className="text-xs text-amber-700">
                             Key access is logged to the Audit Trail. Rotating keys will require re-authentication for connected services.
                         </p>
                     </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Security;
