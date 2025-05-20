
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PREMIUM_EMAILS } from "@/constants/subscriptionConstants";
import { SubscriptionData } from "../useSubscriptionQuery";
import { subscriptionCache } from "./useSubscriptionCache";
import { useToast } from "../use-toast";
import { useRef } from "react";

/**
 * Service for fetching subscription data
 */
export const useSubscriptionFetch = () => {
  const { toast } = useToast();
  const errorToastShown = useRef(false);
  
  /**
   * Fetch subscription data from the database
   */
  const fetchSubscriptionData = async (user: User | null): Promise<SubscriptionData> => {
    // Not authenticated - return default data
    if (!user) {
      return {
        isPremium: false,
        role: 'user',
        email: null
      };
    }
    
    try {
      // Check cache first
      const cachedData = subscriptionCache.get(user);
      if (cachedData) {
        return cachedData;
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
        
        subscriptionCache.set(user, result);
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
        
        subscriptionCache.set(user, result);
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
      
      subscriptionCache.set(user, result);
      return result;
    } catch (error) {
      console.error("Error in subscription query:", error);
      
      // Default to checking email on error
      const isPremium = user?.email ? PREMIUM_EMAILS.includes(user.email) : false;
      
      const result = {
        isPremium,
        role: isPremium ? 'premium' : 'user',
        email: user?.email
      };
      
      subscriptionCache.set(user, result);
      return result;
    }
  };
  
  return { fetchSubscriptionData };
};
