
import { PREMIUM_EMAILS } from "@/constants/subscriptionConstants";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

// Cache configuration
const CACHE_TTL = 300000; // 5 minute cache lifetime
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// In-memory cache for premium validation
const premiumCache = new Map<string, { value: boolean; timestamp: number }>();

/**
 * Retry mechanism for Supabase queries
 */
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2); // Exponential backoff
  }
}

/**
 * Get cached premium status
 */
function getCachedPremiumStatus(userId: string): boolean | null {
  const cached = premiumCache.get(userId);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    premiumCache.delete(userId);
    return null;
  }
  
  return cached.value;
}

/**
 * Set cached premium status
 */
function setCachedPremiumStatus(userId: string, value: boolean): void {
  premiumCache.set(userId, { value, timestamp: Date.now() });
}

/**
 * Validates if a user has premium status based on email or subscription data
 * using a secure database function with in-memory cache to reduce API calls
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
  const cachedResult = getCachedPremiumStatus(userId);
  if (cachedResult !== null) {
    console.log("Using cached premium status:", cachedResult);
    return cachedResult;
  }

  try {
    console.log("Checking premium status for user:", userId);
    
    // Check email first for quick response (avoid DB call if possible)
    if (fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail)) {
      setCachedPremiumStatus(userId, true);
      return true;
    }

    // Circuit breaker - check if Supabase is available before making RPC call
    try {
      const healthCheck = await supabase.from('subscribers').select('count(*)', { 
        count: 'exact', 
        head: true 
      });
      
      if (healthCheck.error) {
        console.error("Supabase service issues, using email check:", healthCheck.error);
        const emailResult = !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
        setCachedPremiumStatus(userId, emailResult);
        return emailResult;
      }
    } catch (error) {
      console.error("Error in Supabase health check:", error);
      const emailResult = !!fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail);
      setCachedPremiumStatus(userId, emailResult);
      return emailResult;
    }

    // Use a retry wrapper for the RPC call
    const result = await withRetry(async () => {
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
    setCachedPremiumStatus(userId, result);
    return result;
  } catch (err) {
    console.error("Error validating premium status:", err);
    // Cache the error state temporarily with shorter expiry
    setCachedPremiumStatus(userId, false);
    
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
