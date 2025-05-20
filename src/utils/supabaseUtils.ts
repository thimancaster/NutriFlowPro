
import { supabase } from "@/integrations/supabase/client";
import { dbCache } from "@/services/dbCacheService";
import { PREMIUM_EMAILS } from "@/constants/subscriptionConstants";

interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

// Cache configuration
const CACHE_TTL = 300000; // 5 minute cache lifetime
const CACHE_NAME = 'premium-validation';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Retry mechanism for Supabase queries
 */
export async function executeWithRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return executeWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
  }
}

/**
 * Check if Supabase is healthy and available
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    // Use a simple and fast query to check if Supabase is responsive
    const healthCheck = await supabase.from('subscribers').select('count(*)', { 
      count: 'exact', 
      head: true 
    });
    
    return !healthCheck.error;
  } catch (error) {
    console.error("Error in Supabase health check:", error);
    return false;
  }
}

/**
 * Validates if a user has premium status based on email or subscription data
 * using a secure database function with local cache to reduce API calls
 * @param userId User ID
 * @returns Boolean indicating premium status
 */
export const validatePremiumStatus = async (
  userId: string | undefined,
  fallbackEmail: string | null | undefined
): Promise<boolean> => {
  // Early return for no user ID
  if (!userId) {
    console.log("Premium check: no userId, checking email only");
    // Fallback to email check for compatibility
    return !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
  }

  // Check cache first
  const cacheKey = userId;
  const cachedResult = dbCache.get<boolean>(CACHE_NAME, cacheKey, CACHE_TTL);
  if (cachedResult !== undefined) {
    console.log("Using cached premium status:", cachedResult);
    return cachedResult;
  }

  try {
    console.log("Checking premium status for user:", userId);
    
    // Check email first for quick response (avoid DB call if possible)
    if (fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail)) {
      dbCache.set(CACHE_NAME, cacheKey, true);
      return true;
    }

    // Circuit breaker - check if Supabase is available before making RPC call
    const isSupabaseHealthy = await checkSupabaseHealth();
    if (!isSupabaseHealthy) {
      console.error("Supabase service issues, using email check");
      const emailResult = !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
      dbCache.set(CACHE_NAME, cacheKey, emailResult);
      return emailResult;
    }

    // Use a retry wrapper for the RPC call
    const result = await executeWithRetry(async () => {
      // Use the secure SQL function to check premium status
      const { data, error } = await supabase.rpc('check_user_premium_status', {
        user_id: userId
      });

      if (error) {
        throw error;
      }

      return !!data;
    });
    
    // Cache the result
    dbCache.set(CACHE_NAME, cacheKey, result);
    return result;
  } catch (err) {
    console.error("Error validating premium status:", err);
    // Cache the error state temporarily with shorter expiry
    dbCache.set(CACHE_NAME, cacheKey, false);
    
    // Fallback to email check
    return !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
  }
};

/**
 * Checks if a subscription has expired
 * @param subscriptionEnd Subscription end date as ISO string
 * @returns Boolean indicating if subscription has expired
 */
export const isSubscriptionExpired = (subscriptionEnd: string | null | undefined): boolean => {
  if (!subscriptionEnd) return false;
  return new Date() > new Date(subscriptionEnd);
};

/**
 * Formats subscription date for display
 * @param dateString ISO date string
 * @returns Formatted date or default text
 */
export const formatSubscriptionDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Não disponível';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return 'Data inválida';
  }
};
