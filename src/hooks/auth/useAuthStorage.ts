
import { logger } from "@/utils/logger";
import { Session } from "@supabase/supabase-js";

/**
 * Utility for storing and retrieving auth session from local storage
 */
const AUTH_STORAGE_KEY = "nutriflow-auth";
const PREMIUM_STATUS_KEY_PREFIX = "premium-status-";

export const useAuthStorage = () => {
  /**
   * Store session in localStorage with remember me preference
   */
  const storeSession = (session: Session | null, remember: boolean = false): void => {
    try {
      if (session && remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        logger.debug("Session stored in localStorage", { context: "Auth" });
      } else {
        // If not remember, use sessionStorage (cleared on browser close)
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        logger.debug("Session stored in sessionStorage", { context: "Auth" });
      }
    } catch (error) {
      console.error("Failed to store auth session", error);
    }
  };

  /**
   * Get stored session from storage
   */
  const getStoredSession = (): Session | null => {
    try {
      // Try localStorage first (remember me enabled)
      const localSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (localSession) {
        const parsedSession = JSON.parse(localSession) as Session;
        logger.debug("Session retrieved from localStorage", { context: "Auth" });
        return parsedSession;
      }

      // Try sessionStorage next (standard session)
      const sessionData = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData) as Session;
        logger.debug("Session retrieved from sessionStorage", { context: "Auth" });
        return parsedSession;
      }
    } catch (error) {
      console.error("Failed to retrieve auth session", error);
    }
    
    return null;
  };

  /**
   * Clear stored session from both storages
   */
  const clearStoredSession = (): void => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      logger.debug("Session cleared from storage", { context: "Auth" });
    } catch (error) {
      console.error("Failed to clear auth session", error);
    }
  };
  
  /**
   * Store premium status for a user
   */
  const savePremiumStatus = (userId: string, isPremium: boolean): void => {
    try {
      const statusData = {
        isPremium,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`${PREMIUM_STATUS_KEY_PREFIX}${userId}`, JSON.stringify(statusData));
      logger.debug("Premium status saved", { context: "Auth" });
    } catch (error) {
      console.error("Failed to store premium status", error);
    }
  };
  
  /**
   * Load premium status for a user
   */
  const loadPremiumStatus = (userId: string): { isPremium: boolean; timestamp: number } | null => {
    try {
      const statusData = localStorage.getItem(`${PREMIUM_STATUS_KEY_PREFIX}${userId}`);
      if (statusData) {
        return JSON.parse(statusData);
      }
    } catch (error) {
      console.error("Failed to load premium status", error);
    }
    
    return null;
  };

  return {
    storeSession,
    getStoredSession,
    clearStoredSession,
    savePremiumStatus,
    loadPremiumStatus
  };
};

// Also export as default for compatibility
export default useAuthStorage;
