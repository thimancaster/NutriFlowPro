
import { supabase } from "@/integrations/supabase/client";
import { PREMIUM_EMAILS, DEVELOPER_EMAILS } from "@/constants/subscriptionConstants";
import { logSecurityEvent } from "../securityUtils";

const CACHE_TTL = 300000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * In-memory cache for premium status
 */
const premiumCache = new Map<string, { value: boolean; timestamp: number }>();

/**
 * Retry mechanism for Supabase queries
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>, 
  retries = MAX_RETRIES, 
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return executeWithRetry(fn, retries - 1, delay * 2);
  }
}

/**
 * Check if Supabase is healthy and available
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
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
 * Check if email is in premium or developer lists
 */
export function checkEmailPremiumStatus(email: string | null | undefined): boolean {
  if (!email) return false;
  return DEVELOPER_EMAILS.includes(email) || PREMIUM_EMAILS.includes(email);
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
 * Validates if a user has premium status using optimized functions
 */
export const validatePremiumStatus = async (
  userId: string | undefined,
  fallbackEmail: string | null | undefined
): Promise<boolean> => {
  // Early return for no user ID
  if (!userId) {
    console.log("Premium check: no userId, checking email only");
    
    if (fallbackEmail && DEVELOPER_EMAILS.includes(fallbackEmail)) {
      console.log("Developer email detected in fallback:", fallbackEmail);
      await logSecurityEvent('premium_check_developer_email', { email: fallbackEmail });
      return true;
    }
    
    return checkEmailPremiumStatus(fallbackEmail);
  }

  // Check cache first
  const cachedResult = getCachedPremiumStatus(userId);
  if (cachedResult !== null) {
    console.log("Using cached premium status:", cachedResult);
    return cachedResult;
  }

  try {
    console.log("Checking premium status for user:", userId);
    
    // Check developer emails first
    if (fallbackEmail && DEVELOPER_EMAILS.includes(fallbackEmail)) {
      console.log("Developer email detected:", fallbackEmail);
      await logSecurityEvent('premium_check_developer_email', { 
        user_id: userId, 
        email: fallbackEmail 
      });
      setCachedPremiumStatus(userId, true);
      return true;
    }
    
    // Check premium emails
    if (fallbackEmail && PREMIUM_EMAILS.includes(fallbackEmail)) {
      await logSecurityEvent('premium_check_premium_email', { 
        user_id: userId, 
        email: fallbackEmail 
      });
      setCachedPremiumStatus(userId, true);
      return true;
    }

    // Check Supabase health before making RPC call
    const isSupabaseHealthy = await checkSupabaseHealth();
    if (!isSupabaseHealthy) {
      console.error("Supabase service issues, using email check");
      await logSecurityEvent('premium_check_supabase_unhealthy', { user_id: userId });
      
      const emailResult = checkEmailPremiumStatus(fallbackEmail);
      setCachedPremiumStatus(userId, emailResult);
      return emailResult;
    }

    // Use optimized function with retry wrapper
    const result = await executeWithRetry(async () => {
      const { data, error } = await supabase.rpc('check_user_premium_status', {
        user_id: userId
      });

      if (error) throw error;
      return !!data;
    });
    
    await logSecurityEvent('premium_check_database', { 
      user_id: userId, 
      result,
      email: fallbackEmail 
    });
    
    setCachedPremiumStatus(userId, result);
    return result;
  } catch (err) {
    console.error("Error validating premium status:", err);
    
    await logSecurityEvent('premium_check_error', { 
      user_id: userId, 
      error: (err as Error).message,
      email: fallbackEmail 
    });
    
    // Check developer emails on error
    if (fallbackEmail && DEVELOPER_EMAILS.includes(fallbackEmail)) {
      console.log("Developer email access granted after error:", fallbackEmail);
      setCachedPremiumStatus(userId, true);
      return true;
    }
    
    setCachedPremiumStatus(userId, false);
    return checkEmailPremiumStatus(fallbackEmail);
  }
};
