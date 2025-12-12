
import { AuditLogEntry, User } from '../types';
import { MOCK_AUDIT_LOGS } from './mockDataService';

// In-memory store for the session (extending the mock data)
let dynamicAuditLogs: AuditLogEntry[] = [...MOCK_AUDIT_LOGS];

export const getAuditLogs = () => {
    // Return sorted by newest first
    return [...dynamicAuditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateHash = (input: string): string => {
    // Simple mock hash for demonstration
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16) + 'x' + Date.now().toString(16);
};

export const logAuditAction = (
    user: User, 
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'View' | 'APPROVE', 
    resource: string
) => {
    const timestamp = new Date().toISOString();
    
    const newEntry: AuditLogEntry = {
        id: `log_${Date.now()}`,
        timestamp,
        actorName: user.name,
        action,
        resource,
        ipAddress: '192.168.1.1', // Mock IP
        hash: generateHash(`${timestamp}|${user.id}|${action}|${resource}`)
    };

    dynamicAuditLogs.unshift(newEntry);
    console.log(`[AUDIT] ${action} on ${resource} by ${user.name}`);
};
