
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PREMIUM_EMAILS, DEVELOPER_EMAILS } from "@/constants/subscriptionConstants";
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
      
      // Fast path: Check developer emails first - highest priority
      if (user.email && DEVELOPER_EMAILS.includes(user.email)) {
        const result = {
          isPremium: true,
          role: 'developer',
          email: user.email,
          subscriptionStart: new Date().toISOString(),
          subscriptionEnd: null
        };
        
        subscriptionCache.set(user, result);
        return result;
      }
      
      // Then check premium emails
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
        
        // Show error toast only once
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
        
        // Check developer emails first on error
        if (user.email && DEVELOPER_EMAILS.includes(user.email)) {
          const result = {
            isPremium: true,
            role: 'developer',
            email: user.email,
            subscriptionStart: new Date().toISOString(),
            subscriptionEnd: null
          };
          
          subscriptionCache.set(user, result);
          return result;
        }
        
        // Then fallback to premium email check
        const isPremiumEmail = user.email ? PREMIUM_EMAILS.includes(user.email) : false;
        
        const result = {
          isPremium: isPremiumEmail,
          role: isPremiumEmail ? 'premium' : 'user',
          email: user.email
        };
        
        subscriptionCache.set(user, result);
        return result;
      }
      
      // Special case: if a developer email has non-developer role in DB, override it
      if (user.email && DEVELOPER_EMAILS.includes(user.email) && data?.role !== 'developer') {
        const result = {
          isPremium: true,
          role: 'developer',
          email: user.email,
          subscriptionStart: data?.subscription_start || new Date().toISOString(),
          subscriptionEnd: null
        };
        
        // Update the database to be consistent
        await supabase
          .from("subscribers")
          .upsert({
            user_id: user.id,
            email: user.email,
            is_premium: true,
            role: 'developer',
            payment_status: 'active',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
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
      
      // Check for developer emails first on error
      if (user?.email && DEVELOPER_EMAILS.includes(user.email)) {
        const result = {
          isPremium: true,
          role: 'developer',
          email: user.email,
          subscriptionStart: new Date().toISOString(),
          subscriptionEnd: null
        };
        
        subscriptionCache.set(user, result);
        return result;
      }
      
      // Then check for premium emails
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
