
export const AUTH_CONSTANTS = {
  VERIFICATION_TIMEOUT: 30000, // 30 seconds
  MAX_VERIFICATION_ATTEMPTS: 5,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT: 15 * 60 * 1000, // 15 minutes
};

// Auth storage keys
export const AUTH_STORAGE_KEYS = {
  SESSION_TOKEN: 'session_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LOGIN_ATTEMPTS: 'login_attempts',
  LAST_LOGIN: 'last_login',
  SESSION_FINGERPRINT: 'session_fingerprint',
  RATE_LIMIT_DATA: 'rate_limit_data'
};
