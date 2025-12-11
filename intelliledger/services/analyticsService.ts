import { User } from '../types';

/**
 * Analytics Service
 * 
 * Handles event tracking for user behavior (Page Views, Clicks, Conversions).
 * Currently logs to console, but ready for Google Analytics 4 (GA4) or PostHog injection.
 */

// Placeholder for GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; 

export const initAnalytics = () => {
    console.log(`[Analytics] Initialized with ID: ${GA_MEASUREMENT_ID}`);
    // In a real app: ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const trackPageView = (pageName: string) => {
    console.log(`[Analytics] Page View: ${pageName}`);
    // In a real app: ReactGA.send({ hitType: "pageview", page: pageName });
};

export const trackEvent = (category: string, action: string, label?: string) => {
    console.log(`[Analytics] Event: ${category} - ${action} ${label ? `(${label})` : ''}`);
    // In a real app: ReactGA.event({ category, action, label });
};

export const identifyUser = (user: User) => {
    console.log(`[Analytics] Identify: ${user.id} (${user.planId})`);
    // In a real app: PostHog.identify(user.id, { email: user.email, plan: user.planId });
};