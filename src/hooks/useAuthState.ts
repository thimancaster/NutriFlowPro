
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useAuthState = () => {
  const authContext = useAuth();
  
  // Check for any authentication issues
  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth session error:", error);
        }
        
        // Log session status for debugging
        console.log("Auth session check:", data.session ? "Active session" : "No session");
      } catch (error) {
        console.error("Failed to check auth session:", error);
      }
    };
    
    // Check auth session on component mount
    checkAuthSession();
  }, []);
  
  // Return the values from our useAuth hook
  return authContext;
};
