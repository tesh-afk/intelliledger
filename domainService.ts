
import { delay } from './mockDataService';

export interface DomainResult {
  name: string;
  status: 'AVAILABLE' | 'TAKEN' | 'PREMIUM';
  price?: string;
  extension: string;
  fitScore: 'HIGH' | 'MEDIUM' | 'LOW';
  tag?: string;
}

/**
 * Simulates checking domain availability.
 * Updated to reflect real-world scenario for 'intelliledger'.
 */
export const checkDomainAvailability = async (brandName: string): Promise<DomainResult[]> => {
  await delay(800); // Simulate API latency

  const cleanName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const results: DomainResult[] = [];

  // 1. Check Exact Match .com
  results.push({
    name: `${cleanName}.com`,
    status: 'TAKEN', 
    extension: '.com',
    price: 'Unavailable',
    fitScore: 'HIGH',
    tag: 'Gold Standard'
  });

  // 2. Check .org (User identified as available)
  results.push({
    name: `${cleanName}.org`,
    status: 'AVAILABLE',
    extension: '.org',
    price: '$12.00/yr',
    fitScore: 'LOW',
    tag: 'Non-Profit Signal'
  });

  // 3. Check Modern Tech TLDs (Best for SaaS)
  results.push({
    name: `${cleanName}.ai`,
    status: 'AVAILABLE',
    extension: '.ai',
    price: '$65.00/yr',
    fitScore: 'HIGH',
    tag: 'Best for AI Tech'
  });

  results.push({
    name: `${cleanName}.io`,
    status: 'AVAILABLE',
    extension: '.io',
    price: '$35.00/yr',
    fitScore: 'HIGH',
    tag: 'SaaS Standard'
  });

  // 4. SaaS Prefixes/Suffixes (The "Get", "Try" strategy)
  const variations = [
    { name: `get${cleanName}.com`, tag: 'Action Verb' },
    { name: `try${cleanName}.com`, tag: 'Action Verb' },
    { name: `${cleanName}app.com`, tag: 'App Suffix' }
  ];

  variations.forEach(v => {
    results.push({
        name: v.name,
        status: 'AVAILABLE',
        extension: '.com',
        price: '$12.00/yr',
        fitScore: 'MEDIUM',
        tag: v.tag
    });
  });

  return results;
};
