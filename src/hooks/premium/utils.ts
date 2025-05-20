
import { supabase } from "@/integrations/supabase/client";
import { PREMIUM_CHECK_CONSTANTS, DEVELOPER_EMAILS, PREMIUM_EMAILS } from './constants';

/**
 * Retry mechanism for Supabase queries
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  retries = PREMIUM_CHECK_CONSTANTS.MAX_RETRIES,
  delay = PREMIUM_CHECK_CONSTANTS.RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Operation failed, retrying... (${PREMIUM_CHECK_CONSTANTS.MAX_RETRIES - retries + 1}/${PREMIUM_CHECK_CONSTANTS.MAX_RETRIES})`);
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
 * Checks if a user email is in the developer list
 */
export function isDeveloperEmail(email: string | null | undefined): boolean {
  return !!email && DEVELOPER_EMAILS.includes(email);
}

/**
 * Checks if a user email is in the premium list
 */
export function isPremiumEmail(email: string | null | undefined): boolean {
  return !!email && PREMIUM_EMAILS.includes(email);
}
