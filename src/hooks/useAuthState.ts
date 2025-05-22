
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { AUTH_STORAGE_KEYS } from '@/constants/authConstants';
import { storageUtils } from '@/utils/storageUtils';
import { logger } from '@/utils/logger';

export const useAuthState = () => {
  const authContext = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  
  // Check for any authentication issues
  useEffect(() => {
    let timeoutId: number | undefined;

    // Set a timeout to prevent long-running checks
    const setCheckTimeout = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      
      timeoutId = window.setTimeout(() => {
        setIsCheckingAuth(false);
        logger.warn("Auth check timed out");
      }, 5000); // 5 second timeout
    };
    
    const checkAuthSession = async () => {
      try {
        // Prevent multiple simultaneous checks
        if (isCheckingAuth) return;
        setIsCheckingAuth(true);
        
        // Check if we've checked recently (throttle checks)
        const lastCheck = storageUtils.getLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK);
        const now = Date.now();
        
        if (lastCheck && (now - lastCheck < 10000)) {
          logger.debug("Skipping auth check - checked recently");
          setIsCheckingAuth(false);
          return;
        }
        
        setCheckTimeout();
        
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error("Auth session error:", error);
          setIsCheckingAuth(false);
          return;
        }
        
        // Log session status for debugging
        logger.debug("Auth session check:", data.session ? "Active session" : "No session");
        
        // Update last check timestamp
        storageUtils.setLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, now);
        
        // Clear timeout and finish checking
        if (timeoutId) window.clearTimeout(timeoutId);
        setIsCheckingAuth(false);
      } catch (error) {
        logger.error("Failed to check auth session:", error);
        setIsCheckingAuth(false);
        
        // Clear timeout on error
        if (timeoutId) window.clearTimeout(timeoutId);
      }
    };
    
    // Only run periodic check if user is authenticated
    if (authContext.isAuthenticated) {
      // Initial check
      checkAuthSession();
      
      // Set up periodic check only for authenticated users
      const intervalId = window.setInterval(() => {
        checkAuthSession();
      }, 60000); // Check every minute
      
      return () => {
        if (intervalId) window.clearInterval(intervalId);
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }
  }, [authContext.isAuthenticated, isCheckingAuth]);
  
  // Return the values from our useAuth hook
  return authContext;
};
