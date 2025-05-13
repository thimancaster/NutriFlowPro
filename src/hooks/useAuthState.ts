
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { AUTH_STORAGE_KEYS } from '@/constants/authConstants';
import { storageUtils } from '@/utils/storageUtils';

export const useAuthState = () => {
  const authContext = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  
  // Check for any authentication issues
  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        // Prevent multiple simultaneous checks
        if (isCheckingAuth) return;
        setIsCheckingAuth(true);
        
        // Check if we've checked recently (throttle checks)
        const lastCheck = storageUtils.getLocalItem<number>(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK);
        const now = Date.now();
        
        if (lastCheck && (now - lastCheck < 10000)) {
          console.log("Skipping auth check - checked recently");
          setIsCheckingAuth(false);
          return;
        }
        
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth session error:", error);
          setIsCheckingAuth(false);
          return;
        }
        
        // Log session status for debugging
        console.log("Auth session check:", data.session ? "Active session" : "No session");
        
        // Update last check timestamp
        storageUtils.setLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, now);
      } catch (error) {
        console.error("Failed to check auth session:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    // Check auth session on component mount
    checkAuthSession();
    
    // Set up periodic check if user is authenticated
    let intervalId: number | null = null;
    
    if (authContext.isAuthenticated) {
      intervalId = window.setInterval(() => {
        checkAuthSession();
      }, 60000); // Check every minute
    }
    
    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [authContext.isAuthenticated, isCheckingAuth]);
  
  // Return the values from our useAuth hook
  return authContext;
};
