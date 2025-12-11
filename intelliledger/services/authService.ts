import { User, UserRole, TaxJurisdiction } from '../types';
import { MOCK_USERS, delay } from './mockDataService';
import { logAuditAction } from './auditService';

// Mock session key
const SESSION_KEY = 'intelliledger_session';

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800); // Simulate network latency

  // Simple mock validation
  const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user && password === 'password') { // Hardcoded password for demo
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    logAuditAction(user, 'LOGIN', 'SESSION');
    return user;
  }

  throw new Error('Invalid credentials');
};

export const loginWithSSO = async (provider: 'GOOGLE' | 'MICROSOFT'): Promise<User> => {
    await delay(1500); // Simulate Redirect
    
    // Simulate finding a user via SSO email match
    const user = MOCK_USERS[0]; // Tesh
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    logAuditAction(user, 'LOGIN', `SSO_PROVIDER:${provider}`);
    return user;
};

/**
 * Simulates user registration and triggers the welcome email workflow.
 * Returns the "Email Content" so the frontend can display it in simulation mode.
 */
export const register = async (name: string, email: string, jurisdiction: string): Promise<{ user: User; emailContent: string }> => {
  await delay(1200); // Simulate API call

  const newUser: User = {
    id: `u_gen_${Date.now()}`,
    name,
    email,
    role: UserRole.OWNER,
    lastLogin: 'Just now',
    mfaEnabled: false,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`,
    jurisdiction: jurisdiction as TaxJurisdiction,
    isEmailVerified: false
  };

  // In a real app, we would send this via SendGrid/SES.
  // Here we return the HTML string to display it.
  const emailContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
         <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Welcome to IntelliLedger</h1>
         <p style="color: #e0e7ff; margin-top: 5px;">Your financial autopilot has arrived.</p>
      </div>
      
      <div style="padding: 40px 30px;">
        <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
        
        <p>Thrilled to have you on board! You have just taken the first step towards never worrying about messy spreadsheets or surprise tax bills again.</p>
        
        <p>At IntelliLedger, we combine advanced AI with secure banking integrations to handle the heavy lifting for you:</p>
        
        <ul style="background-color: #f8fafc; padding: 20px 40px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <li style="margin-bottom: 10px;"><strong>Connect:</strong> Sync your bank feeds, Stripe, and Quickbooks in seconds.</li>
          <li style="margin-bottom: 10px;"><strong>Automate:</strong> Our AI categorizes your expenses and reconciles invoices instantly.</li>
          <li><strong>Relax:</strong> Get audit-ready financial reports and tax estimates on autopilot.</li>
        </ul>

        <p>To ensure the security of your financial data, please verify your email address to unlock your dashboard.</p>
        
        <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
           <button id="verify-btn" style="background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; border: none; cursor: pointer;">Verify Email Address</button>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">If you didn't create this account, you can safely ignore this email.</p>
      </div>

      <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} IntelliLedger Inc. • Secured by SOC2<br>
        <a href="https://getintelliledger.com" style="color: #4f46e5; text-decoration: none;">getintelliledger.com</a>
      </div>
    </div>
  `;

  // We do NOT log them in automatically. They must click verify.
  // We return the user object but don't set session yet.
  return { user: newUser, emailContent };
};

export const verifyEmailAndLogin = async (user: User): Promise<void> => {
    // Simulate verification
    await delay(500);
    const verifiedUser = { ...user, isEmailVerified: true };
    localStorage.setItem(SESSION_KEY, JSON.stringify(verifiedUser));
    logAuditAction(verifiedUser, 'LOGIN', 'EMAIL_VERIFICATION');
};

export const logout = async (): Promise<void> => {
  await delay(200);
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as User;
    } catch (e) {
      return null;
    }
  }
  return null;
};