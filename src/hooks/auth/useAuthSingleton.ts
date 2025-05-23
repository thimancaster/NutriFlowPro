import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useAuthStorage } from './useAuthStorage';
import { setUser as setSentryUser, clearUser } from '@/utils/sentry';
import { logger } from '@/utils/logger';

/**
 * This is a singleton hook to maintain auth state across components
 */
interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Initial auth state
const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true
};

// Keep track of initialization
let isInitialized = false;
let currentAuthState = { ...initialState };

export const useAuthSingleton = () => {
  const [authState, setAuthState] = useState<AuthState>(currentAuthState);
  const { storeSession, getStoredSession, clearStoredSession } = useAuthStorage();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;
      
      try {
        // First try to get session from Supabase (automatically refreshes token)
        const { data: { session } } = await supabase.auth.getSession();

        // If no session from Supabase, check local storage
        if (!session) {
          const storedSession = getStoredSession();
          if (storedSession) {
            // If we have a stored session, try to set it
            const { data: { session: refreshedSession } } = await supabase.auth.setSession({
              access_token: storedSession.access_token,
              refresh_token: storedSession.refresh_token,
            });
            
            if (refreshedSession) {
              updateState(refreshedSession);
            } else {
              // If refresh failed, clear stored session
              clearStoredSession();
              updateState(null);
            }
          } else {
            // No stored session
            updateState(null);
          }
        } else {
          // We have a valid session from Supabase
          updateState(session);
        }

        isInitialized = true;

      } catch (error) {
        console.error("Error initializing auth:", error);
        updateState(null);
        isInitialized = true;
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN') {
          updateState(session);
        } else if (event === 'SIGNED_OUT') {
          clearStoredSession();
          updateState(null);
        } else if (event === 'TOKEN_REFRESHED') {
          updateState(session);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update auth state
  const updateState = (session: Session | null, remember: boolean = false) => {
    const user = session?.user ?? null;
    const isAuthenticated = !!user;
    
    if (session && user) {
      // Store session if provided
      storeSession(session, remember);
      
      // Update Sentry user context
      setSentryUser({
        id: user.id,
        email: user.email || undefined,
        name: user.user_metadata?.name
      });
      
      logger.info("User authenticated", {
        context: "Auth",
        user: user.email,
        details: { id: user.id }
      });
    } else {
      clearUser();
      logger.debug("No session", { context: "Auth" });
    }
    
    // Update the internal state
    const newState = {
      user,
      session,
      isAuthenticated,
      isLoading: false
    };
    
    currentAuthState = newState;
    setAuthState(newState);
  };

  return {
    ...authState,
    updateState
  };
};
