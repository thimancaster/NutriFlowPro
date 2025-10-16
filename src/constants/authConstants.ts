
// Premium access is now managed via subscribers table
// This constant is deprecated and should not be used
export const PREMIUM_EMAILS: string[] = [];

// Auth storage keys
export const AUTH_STORAGE_KEYS = {
  SESSION: 'nutriflow_session',
  REMEMBER_ME: 'nutriflow_remember_me',
  PREMIUM_STATUS_PREFIX: 'premium_status_',
  LAST_AUTH_CHECK: 'last_auth_check',
};

// Auth constants for better UX
export const AUTH_CONSTANTS = {
  SESSION_CHECK_INTERVAL: 60000, // 1 minute
  SESSION_CHECK_THROTTLE: 10000, // 10 seconds
  VERIFICATION_TIMEOUT: 5000, // 5 seconds
  MAX_VERIFICATION_ATTEMPTS: 3,
};
