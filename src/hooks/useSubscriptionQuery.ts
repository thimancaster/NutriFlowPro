
import { useQuery } from "@tanstack/react-query";
import { SUBSCRIPTION_QUERY_KEY, PREMIUM_EMAILS } from "@/constants/subscriptionConstants";
import { useToast } from "./use-toast";
import { User } from "@supabase/supabase-js";
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

// Memory cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache time
const memoryCache = new Map<string, {data: SubscriptionData, timestamp: number}>();

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
  const { toast } = useToast();
  const errorToastShown = useRef(false);
  const isQueryRunningRef = useRef(false);
  
  // Query key based on user ID or anonymous
  const queryKey = user?.id ? [SUBSCRIPTION_QUERY_KEY, user.id] : [SUBSCRIPTION_QUERY_KEY, 'anonymous'];
  const cacheKey = user?.id || 'anonymous';
  
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
        
        // Return cache if available
        const cachedData = memoryCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
          return cachedData.data;
        }
        
        return {
          isPremium: false,
          role: 'user',
          email: user?.email || null
        };
      }
      
      try {
        isQueryRunningRef.current = true;
        
        // Check memory cache first
        const cachedData = memoryCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
          return cachedData.data;
        }
  
        // Fast path: Check premium emails directly
        if (user.email && PREMIUM_EMAILS.includes(user.email)) {
          const result = {
            isPremium: true,
            role: 'premium',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null
          };
          
          memoryCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
          
          return result;
        }
  
        // Check subscription in database
        const { data, error } = await supabase
          .from("subscribers")
          .select("is_premium, role, email, subscription_start, subscription_end")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("Error fetching subscription data:", error);
          
          if (!errorToastShown.current) {
            toast({
              title: "Error fetching subscription data",
              description: "Using default settings.",
              variant: "destructive",
            });
            errorToastShown.current = true;
            
            setTimeout(() => {
              errorToastShown.current = false;
            }, 15 * 60 * 1000); // Reset after 15 minutes
          }
          
          // Fallback to email check
          const isPremiumEmail = user.email ? PREMIUM_EMAILS.includes(user.email) : false;
          
          const result = {
            isPremium: isPremiumEmail,
            role: isPremiumEmail ? 'premium' : 'user',
            email: user.email
          };
          
          memoryCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
          
          return result;
        }

        // Build response from database or determine from email
        const isPremium = data?.is_premium || false;
        const result = {
          isPremium,
          role: data?.role || 'user',
          email: data?.email || user.email,
          subscriptionStart: data?.subscription_start,
          subscriptionEnd: data?.subscription_end
        };
        
        memoryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      } catch (error: any) {
        console.error("Error in subscription query:", error);
        
        // Default to checking email on error
        const isPremium = user?.email ? PREMIUM_EMAILS.includes(user.email) : false;
        
        const result = {
          isPremium,
          role: isPremium ? 'premium' : 'user',
          email: user?.email || null
        };
        
        memoryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
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
