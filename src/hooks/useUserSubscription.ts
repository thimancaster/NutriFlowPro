
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
  
  // Use the main subscription query hook with optimized settings
  const query = useSubscriptionQuery(user, isAuthenticated);
  
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
