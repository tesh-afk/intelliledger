
import { KYCRecord, KYCStatus, User } from '../types';
import { delay } from './mockDataService';

/**
 * Simulates an AML (Anti-Money Laundering) Watchlist Check.
 * In a real scenario, this connects to endpoints like ComplyAdvantage, Onfido, or Stripe Identity.
 */
const checkAMLWatchlist = async (name: string): Promise<boolean> => {
    // Mock Logic: Block known bad actors for demo purposes
    const BLOCKED_NAMES = ['Pablo Escobar', 'Osama', 'Capone', 'Fraudster'];
    const isBlocked = BLOCKED_NAMES.some(bad => name.toLowerCase().includes(bad.toLowerCase()));
    return !isBlocked;
};

/**
 * Simulates document verification (Passport/ID).
 */
const verifyDocumentAI = async (file: File): Promise<boolean> => {
    // Mock: Assume valid if file size > 0.
    // In real app, this sends file to Stripe Identity / Persona API.
    return file.size > 0;
};

/**
 * Initiates and processes a KYC Request.
 */
export const performKYCVerification = async (user: User, documentFile: File): Promise<KYCRecord> => {
    await delay(2000); // Simulate API Processing Time

    // 1. AML Check
    const amlPassed = await checkAMLWatchlist(user.name);

    if (!amlPassed) {
        return {
            id: `kyc_${Date.now()}`,
            userId: user.id,
            status: 'REJECTED',
            submittedAt: new Date().toISOString(),
            amlCheckPassed: false,
            reason: 'Flagged by Global Sanctions/AML Watchlist'
        };
    }

    // 2. Document Check
    const docPassed = await verifyDocumentAI(documentFile);
    
    if (!docPassed) {
        return {
            id: `kyc_${Date.now()}`,
            userId: user.id,
            status: 'MANUAL_REVIEW',
            submittedAt: new Date().toISOString(),
            amlCheckPassed: true,
            reason: 'Document image quality low or unreadable'
        };
    }

    // 3. Success
    return {
        id: `kyc_${Date.now()}`,
        userId: user.id,
        status: 'VERIFIED',
        submittedAt: new Date().toISOString(),
        amlCheckPassed: true
    };
};
