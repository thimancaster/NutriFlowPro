
/**
 * Constants for premium status checking
 */
export const PREMIUM_CHECK_CONSTANTS = {
  // Cache prefix for premium status in localStorage
  CACHE_PREFIX: 'premium_status_',
  
  // Cache name for in-memory storage
  CACHE_NAME: 'premium_status_cache',
  
  // Cache TTL in milliseconds (5 minutes)
  CACHE_TTL: 5 * 60 * 1000,
  
  // Time between premium status checks in milliseconds (10 minutes)
  CHECK_INTERVAL: 10 * 60 * 1000,
  
  // Maximum number of retries for premium status checks
  MAX_RETRIES: 3,
  
  // Delay between retries in milliseconds (exponential backoff)
  RETRY_DELAY: 2000,
};

// List of email addresses that have developer access (full system access)
export const DEVELOPER_EMAILS = ['thimancaster@hotmail.com'];

// List of email addresses that have premium access
export const PREMIUM_EMAILS = ['thiago@nutriflowpro.com'];
