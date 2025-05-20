
import { useQuery } from "@tanstack/react-query";
import { SUBSCRIPTION_QUERY_KEY, PREMIUM_EMAILS } from "@/constants/subscriptionConstants";
import { User } from "@supabase/supabase-js";
import { useRef } from "react";
import { useSubscriptionFetch } from "./subscription/useSubscriptionFetch";

export interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

// Query configuration to prevent excessive API calls
const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes stale time
  gcTime: 30 * 60 * 1000, // 30 minutes cache time
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  retry: 2,
  retryDelay: 5000
};

/**
 * Hook to fetch subscription data from the database
 */
export const useSubscriptionQuery = (user: User | null, isAuthenticated: boolean | null) => {
  const { fetchSubscriptionData } = useSubscriptionFetch();
  const isQueryRunningRef = useRef(false);
  
  // Query key based on user ID or anonymous
  const queryKey = user?.id ? [SUBSCRIPTION_QUERY_KEY, user.id] : [SUBSCRIPTION_QUERY_KEY, 'anonymous'];
  
  return useQuery({
    queryKey,
    queryFn: async (): Promise<SubscriptionData> => {
      // Not authenticated - return default data
      if (!isAuthenticated || !user) {
        return {
          isPremium: false,
          role: 'user',
          email: null
        };
      }
      
      // Prevent duplicate queries
      if (isQueryRunningRef.current) {
        console.log("Query already running, using cached data");
        
        // Return default data if we can't get cached data
        return {
          isPremium: false,
          role: 'user',
          email: user?.email || null
        };
      }
      
      try {
        isQueryRunningRef.current = true;
        return await fetchSubscriptionData(user);
      } finally {
        // Reset running flag after delay
        setTimeout(() => {
          isQueryRunningRef.current = false;
        }, 3000);
      }
    },
    enabled: !!isAuthenticated,
    ...QUERY_CONFIG
  });
};
