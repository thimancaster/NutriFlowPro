
// Re-export all utilities from modular files
export * from './supabase/premiumValidation';
export * from './supabase/subscriptionUtils';

// Legacy export for backward compatibility
export { validatePremiumStatus } from './supabase/premiumValidation';
export { isSubscriptionExpired, formatSubscriptionDate } from './supabase/subscriptionUtils';
