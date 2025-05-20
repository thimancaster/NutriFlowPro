
import { useQuery } from "@tanstack/react-query";
import { SUBSCRIPTION_QUERY_KEY, PREMIUM_EMAILS } from "@/constants/subscriptionConstants";
import { useToast } from "./use-toast";
import { User } from "@supabase/supabase-js";
import React from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionData {
  isPremium: boolean;
  role: string;
  email: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

// Memory cache to prevent excessive API calls during the same session
const memoryCache = new Map<string, {data: SubscriptionData, timestamp: number}>();

// Optimized refetch settings to prevent excessive API calls
const OPTIMIZED_REFETCH_SETTINGS = {
  staleTime: 5 * 60 * 1000, // 5 minutes stale time
  gcTime: 30 * 60 * 1000, // 30 minutes cache time
  refetchOnWindowFocus: false, // Disabled to avoid calls on focus
  refetchOnMount: false, // Changed to false to reduce initial notifications
  refetchOnReconnect: false, // Disabled to avoid calls on reconnection
  retry: 2, // Maximum 2 retries to minimize excessive calls
  retryDelay: 5000 // 5 seconds between retries
};

/**
 * Hook to fetch subscription data from the database in an optimized and secure way
 */
export const useSubscriptionQuery = (user: User | null, isAuthenticated: boolean | null) => {
  const { toast } = useToast();
  
  // Track if we've already shown an error toast to prevent spam
  const errorToastShown = React.useRef(false);
  // Track if the query is currently running to prevent duplicates
  const isQueryRunningRef = React.useRef(false);
  // Track if initial toast has been shown to prevent multiple toasts
  const initialToastShown = React.useRef(false);

  // Force the same query key for all users unless logged in with specific ID
  const queryKey = user?.id ? [SUBSCRIPTION_QUERY_KEY, user.id] : [SUBSCRIPTION_QUERY_KEY, 'anonymous'];
  const cacheKey = user?.id || 'anonymous';
  
  return useQuery({
    queryKey: queryKey,
    queryFn: async (): Promise<SubscriptionData> => {
      try {
        // Don't query if user isn't authenticated
        if (!isAuthenticated || !user) {
          return {
            isPremium: false,
            role: 'user',
            email: null
          };
        }
        
        // Check if query is already running to prevent duplicate calls
        if (isQueryRunningRef.current) {
          console.log("Query already running, using cached or default data");
          
          // Return cache if available
          const cachedData = memoryCache.get(cacheKey);
          if (cachedData && (Date.now() - cachedData.timestamp) < 300000) { // 5 minutes cache
            return cachedData.data;
          }
          
          // Return default data if not authenticated
          return {
            isPremium: false,
            role: 'user',
            email: user?.email || null
          };
        }
        
        isQueryRunningRef.current = true;
        
        try {
          // Use memory cache if available and recent to prevent unnecessary database calls
          const cachedData = memoryCache.get(cacheKey);
          if (cachedData && (Date.now() - cachedData.timestamp) < 300000) { // 5 minutes cache
            return cachedData.data;
          }
  
          // Check premium emails directly (fast fail-fast)
          if (user.email && PREMIUM_EMAILS.includes(user.email)) {
            const result = {
              isPremium: true,
              role: 'premium',
              email: user.email,
              subscriptionStart: new Date().toISOString(),
              subscriptionEnd: null // No expiration date for premium emails
            };
            
            // Update memory cache
            memoryCache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });
            
            return result;
          }
  
          // Check if user has subscriber record
          const { data, error } = await supabase
            .from("subscribers")
            .select("is_premium, role, email, subscription_start, subscription_end")
            .eq("user_id", user.id)
            .maybeSingle();

          if (error) {
            console.warn("Error fetching subscription data:", error);
            
            // Only show toast once and only during initial load, not on retries/refetches
            if (!errorToastShown.current && !initialToastShown.current) {
              toast({
                title: "Error fetching subscription data",
                description: "Using default settings.",
                variant: "destructive",
              });
              errorToastShown.current = true;
              initialToastShown.current = true;
              
              // Reset after 15 minutes to avoid persistent messages
              setTimeout(() => {
                errorToastShown.current = false;
              }, 900000);
            }
            
            // Return default data based on email
            const isPremiumEmail = user.email ? PREMIUM_EMAILS.includes(user.email) : false;
            
            const result = {
              isPremium: isPremiumEmail,
              role: isPremiumEmail ? 'premium' : 'user',
              email: user.email
            };
            
            // Update memory cache
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
          
          // Update memory cache
          memoryCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
          
          initialToastShown.current = true;
          return result;
        } finally {
          // Reset running flag after delay to prevent immediate re-runs
          setTimeout(() => {
            isQueryRunningRef.current = false;
          }, 3000);
        }
      } catch (error: any) {
        console.error("Error in subscription query:", error);
        isQueryRunningRef.current = false;
        
        // Default to checking email on error
        const isPremium = user?.email ? PREMIUM_EMAILS.includes(user.email) : false;
        
        const result = {
          isPremium,
          role: isPremium ? 'premium' : 'user',
          email: user?.email || null
        };
        
        // Update memory cache
        memoryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      }
    },
    enabled: !!isAuthenticated,
    ...OPTIMIZED_REFETCH_SETTINGS
  });
};
