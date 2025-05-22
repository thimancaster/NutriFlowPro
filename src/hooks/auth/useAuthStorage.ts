
import { AUTH_STORAGE_KEYS } from '@/constants/authConstants';
import { storageUtils } from '@/utils/storageUtils';
import { Session } from '@supabase/supabase-js';
import { StoredSession, PremiumStatus } from '@/types/auth';
import { logger } from '@/utils/logger';

export const useAuthStorage = () => {
  // Function to load session from storage (used for remember me feature)
  const loadStoredSession = (): StoredSession => {
    try {
      const storedSession = storageUtils.getLocalItem(AUTH_STORAGE_KEYS.SESSION);
      
      if (storedSession && storedSession.session) {
        logger.debug('Loaded stored session:', storedSession.remember ? 'with remember me' : 'without remember me');
        return storedSession;
      }
    } catch (error) {
      logger.error('Failed to load stored session:', error);
    }
    return { session: null, remember: false };
  };

  // Function to save session to storage (used for remember me feature)
  const saveSession = (session: Session | null, remember: boolean = false) => {
    try {
      if (session) {
        storageUtils.setLocalItem(AUTH_STORAGE_KEYS.SESSION, { 
          session, 
          remember 
        });
        storageUtils.setLocalItem(AUTH_STORAGE_KEYS.REMEMBER_ME, remember);
        logger.debug('Session saved to storage with remember me:', remember);
      } else {
        storageUtils.removeLocalItem(AUTH_STORAGE_KEYS.SESSION);
        logger.debug('Session removed from storage');
      }
    } catch (error) {
      logger.error('Failed to save session:', error);
    }
  };

  // Function to save premium status
  const savePremiumStatus = (userId: string, isPremium: boolean) => {
    const cachedStatusKey = `${AUTH_STORAGE_KEYS.PREMIUM_STATUS_PREFIX}${userId}`;
    storageUtils.setLocalItem(cachedStatusKey, {
      isPremium: isPremium,
      timestamp: Date.now()
    });
  };

  // Function to load premium status
  const loadPremiumStatus = (userId: string): PremiumStatus | null => {
    try {
      const cachedStatusKey = `${AUTH_STORAGE_KEYS.PREMIUM_STATUS_PREFIX}${userId}`;
      const cachedStatus = storageUtils.getLocalItem(cachedStatusKey);
      
      const now = Date.now();
      if (cachedStatus && now - cachedStatus.timestamp < 300000) {
        // Use cache only if it's less than 5 minutes old
        logger.debug("Using cached premium status:", cachedStatus.isPremium);
        return cachedStatus;
      }
    } catch (error) {
      logger.error('Failed to load premium status:', error);
    }
    return null;
  };

  // Record the last authentication check timestamp
  const updateLastAuthCheck = () => {
    storageUtils.setLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, Date.now());
  };

  // Get last auth check
  const getLastAuthCheck = (): number | null => {
    return storageUtils.getLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK);
  };

  return {
    loadStoredSession,
    saveSession,
    savePremiumStatus,
    loadPremiumStatus,
    updateLastAuthCheck,
    getLastAuthCheck
  };
};

export default useAuthStorage;
