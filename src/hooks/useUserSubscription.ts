
import { useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "./useAuthState";
import { useSubscriptionQuery } from "./useSubscriptionQuery";
import { SUBSCRIPTION_QUERY_KEY } from "@/constants/subscriptionConstants";
import { useCallback, useRef } from "react";

export { SUBSCRIPTION_QUERY_KEY } from "@/constants/subscriptionConstants";
export type { SubscriptionData } from "./useSubscriptionQuery";

/**
 * Hook to manage user subscription status with extended functionality and optimization
 */
export const useUserSubscription = () => {
  const { user, isAuthenticated } = useAuthState();
  const queryClient = useQueryClient();
  const refetchInProgressRef = useRef(false);
  
  // Convert our custom user type to Supabase user type for the query
  const supabaseUser = user ? {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata || {},
    app_metadata: user.app_metadata || {},
    aud: user.aud || 'authenticated',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: null,
    role: 'authenticated',
    phone: null,
    email_confirmed_at: null,
    phone_confirmed_at: null,
    recovery_sent_at: null,
    new_email: null,
    invited_at: null,
    action_link: null,
    email_change_sent_at: null,
    email_change_confirm_status: 0,
    banned_until: null,
    new_phone: null,
    phone_change_sent_at: null,
    phone_change_token: null,
    email_change_token_current: null,
    email_change_token_new: null,
    is_anonymous: false
  } : null;
  
  // Use the main subscription query hook with optimized settings
  const query = useSubscriptionQuery(supabaseUser, isAuthenticated);
  
  // Determine premium status safely with fallback
  const isPremiumUser = query.data?.isPremium || false;
  
  // Determine extra subscription data
  const subscriptionData = {
    role: query.data?.role || 'user',
    subscriptionStart: query.data?.subscriptionStart,
    subscriptionEnd: query.data?.subscriptionEnd,
    email: query.data?.email
  };

  /**
   * Invalidate subscription cache to force an update
   * With internal debounce to prevent multiple calls
   */
  const invalidateSubscriptionCache = useCallback(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
    } else {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY] });
    }
  }, [queryClient, user?.id]);

  /**
   * Force a subscription data update with control to prevent multiple calls
   * and with retry in case of failure
   */
  const refetchSubscription = useCallback(async () => {
    if (refetchInProgressRef.current) {
      console.log("A refetch is already in progress, skipping...");
      return;
    }
    
    refetchInProgressRef.current = true;
    console.log("Updating subscription data...");
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const result = await query.refetch();
        refetchInProgressRef.current = false;
        return result;
      } catch (error) {
        attempts++;
        console.error(`Error updating data (attempt ${attempts}/${maxAttempts}):`, error);
        
        if (attempts >= maxAttempts) {
          refetchInProgressRef.current = false;
          throw error;
        }
        
        // Wait before retrying (with exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      }
    }
    
    // Ensure the flag is reset even in case of error
    refetchInProgressRef.current = false;
  }, [query]);

  return {
    ...query,
    isPremiumUser,
    subscriptionData,
    invalidateSubscriptionCache,
    refetchSubscription,
  };
};
