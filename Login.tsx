import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck, User as UserIcon, Building2, CheckCircle2 } from 'lucide-react';
import { login, loginWithSSO, register, verifyEmailAndLogin } from '../services/authService';
import { User, TaxJurisdiction } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jurisdiction, setJurisdiction] = useState('US_IRS');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<'GOOGLE' | 'MICROSOFT' | null>(null);
  const [error, setError] = useState('');
  const [simulatedEmail, setSimulatedEmail] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        const user = await login(email, password);
        onLoginSuccess(user);
      } else {
        // Register Flow
        const { user, emailContent } = await register(name, email, jurisdiction);
        setPendingUser(user);
        setSimulatedEmail(emailContent); // Show the email simulation
      }
    } catch (err) {
      setError(mode === 'LOGIN' ? 'Invalid email or password.' : 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSO = async (provider: 'GOOGLE' | 'MICROSOFT') => {
      setSsoLoading(provider);
      try {
          const user = await loginWithSSO(provider);
          onLoginSuccess(user);
      } catch (e) {
          setError('SSO Failed. Please try again.');
      } finally {
          setSsoLoading(null);
      }
  };

  const handleVerifyClick = async () => {
      if (!pendingUser) return;
      setIsLoading(true);
      await verifyEmailAndLogin(pendingUser);
      onLoginSuccess({ ...pendingUser, isEmailVerified: true });
  };

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
    setMode('LOGIN');
  };

  // --- RENDER EMAIL SIMULATION MODAL ---
  if (simulatedEmail) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                  <div className="bg-green-50 p-4 border-b border-green-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-700 font-bold">
                          <CheckCircle2 size={20} />
                          <span>Registration Successful! Check your inbox.</span>
                      </div>
                      <button onClick={() => setSimulatedEmail(null)} className="text-xs text-slate-500 underline">Close Simulation</button>
                  </div>
                  
                  <div className="p-8 bg-slate-100">
                      <div className="text-center mb-4 text-slate-500 text-xs uppercase font-bold tracking-wider">
                          -- Simulated Email Client View --
                      </div>
                      
                      {/* Render the HTML string from authService safely */}
                      <div className="shadow-lg rounded-xl overflow-hidden">
                        <div dangerouslySetInnerHTML={{ __html: simulatedEmail }} />
                        
                        {/* Overlay the button action since HTML string buttons won't have React handlers */}
                        <div className="relative -mt-32 pb-16 text-center z-10 pointer-events-none">
                            <div className="pointer-events-auto inline-block opacity-0 w-48 h-12 cursor-pointer" onClick={handleVerifyClick} title="Click to Verify"></div>
                        </div>
                      </div>

                      <div className="text-center mt-6">
                           <button 
                             onClick={handleVerifyClick}
                             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
                           >
                               [Simulate] Click Link to Verify & Login
                           </button>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 relative">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
                {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-500 mt-2">
                {mode === 'LOGIN' ? 'Sign in to IntelliLedger Autonomous Bookkeeping' : 'Start your financial autopilot today.'}
            </p>
          </div>

          {mode === 'LOGIN' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    onClick={() => handleSSO('GOOGLE')}
                    disabled={!!ssoLoading}
                    className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                  >
                      {ssoLoading === 'GOOGLE' ? <Loader2 size={16} className="animate-spin"/> : (
                          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                      )}
                      <span>Google</span>
                  </button>
                  <button 
                    onClick={() => handleSSO('MICROSOFT')}
                    disabled={!!ssoLoading}
                    className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                  >
                      {ssoLoading === 'MICROSOFT' ? <Loader2 size={16} className="animate-spin"/> : (
                          <img src="https://www.svgrepo.com/show/452263/microsoft.svg" className="w-4 h-4" alt="Microsoft" />
                      )}
                      <span>Microsoft</span>
                  </button>
              </div>
          )}

          {mode === 'LOGIN' && (
              <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or continue with</span></div>
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* REGISTER FIELDS */}
            {mode === 'REGISTER' && (
                <div className="animate-in slide-in-from-left-4 fade-in duration-300 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon size={18} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Jane Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Operating Jurisdiction</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building2 size={18} className="text-slate-400" />
                            </div>
                            <select 
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={jurisdiction}
                                onChange={(e) => setJurisdiction(e.target.value)}
                            >
                                <option value="US_IRS">United States (IRS)</option>
                                <option value="UK_HMRC">United Kingdom (HMRC)</option>
                                <option value="EU_VAT">European Union (VAT)</option>
                                <option value="NG_FIRS">Nigeria (FIRS)</option>
                                <option value="ZA_SARS">South Africa (SARS)</option>
                                <option value="KE_KRA">Kenya (KRA)</option>
                                <option value="GH_GRA">Ghana (GRA)</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* COMMON FIELDS */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="you@getintelliledger.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!ssoLoading}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{mode === 'LOGIN' ? 'Authenticating...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'LOGIN' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* MODE TOGGLE */}
          <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                  {mode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }}
                    className="text-indigo-600 font-bold hover:underline focus:outline-none"
                  >
                      {mode === 'LOGIN' ? 'Sign up' : 'Sign in'}
                  </button>
              </p>
          </div>

          {mode === 'LOGIN' && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase text-center mb-4">Demo Credentials</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => fillCredentials('tesh@getintelliledger.com')}
                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">O</div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Owner (Admin)</p>
                        <p className="text-xs text-slate-500">tesh@getintelliledger.com</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 text-slate-400 text-xs">Use</div>
                  </button>
                  <button 
                    onClick={() => fillCredentials('mike@getintelliledger.com')}
                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">S</div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Staff</p>
                        <p className="text-xs text-slate-500">mike@getintelliledger.com</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 text-slate-400 text-xs">Use</div>
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-4 text-slate-500 text-xs">
        &copy; {new Date().getFullYear()} IntelliLedger Inc. Secured by SOC2
      </div>
    </div>
  );
};

export default Login;