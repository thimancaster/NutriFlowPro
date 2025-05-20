
import { PREMIUM_EMAILS, DEVELOPER_EMAILS } from '@/constants/subscriptionConstants';

// Constants for premium check
export const PREMIUM_CHECK_CONSTANTS = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second initial delay
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes cache lifetime
  CACHE_NAME: 'premium-status',
};

// Export email lists for easy access
export { PREMIUM_EMAILS, DEVELOPER_EMAILS };
