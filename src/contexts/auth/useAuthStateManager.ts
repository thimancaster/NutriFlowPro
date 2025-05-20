import { useState, useCallback, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';
import { useUsageQuota } from '@/hooks/useUsageQuota';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';
import { AUTH_STORAGE_KEYS, AUTH_CONSTANTS } from '@/constants/authConstants';
import { storageUtils } from '@/utils/storageUtils';

const useAuthStateManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { checkPremiumStatus } = usePremiumCheck();
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  // Track verification attempts
  const verificationAttemptsRef = useRef(0);
  // Track verification timeout ID
  const verificationTimeoutRef = useRef<number | null>(null);

  // Initialize state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    isPremium: false,
    loading: true,
    userTier: 'free',
    usageQuota: {
      patients: {
        used: 0,
        limit: 5
      },
      mealPlans: {
        used: 0,
        limit: 3
      }
    }
  });

  // Get usage quota based on user and premium status
  const usageQuota = useUsageQuota(authState.user, authState.isPremium);

  // Clear verification timeout to prevent memory leaks
  const clearVerificationTimeout = useCallback(() => {
    if (verificationTimeoutRef.current) {
      window.clearTimeout(verificationTimeoutRef.current);
      verificationTimeoutRef.current = null;
    }
  }, []);

  // Set verification timeout to break infinite loops
  const setVerificationTimeout = useCallback(() => {
    clearVerificationTimeout();
    
    verificationTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      
      if (verificationAttemptsRef.current >= AUTH_CONSTANTS.MAX_VERIFICATION_ATTEMPTS) {
        console.error('Authentication verification timed out after multiple attempts');
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          loading: false, 
          isAuthenticated: false,
          user: null,
          session: null 
        }));
        
        toast({
          title: "Erro de autenticação",
          description: "Não foi possível verificar sua sessão. Por favor, faça login novamente.",
          variant: "destructive"
        });
      }
    }, AUTH_CONSTANTS.VERIFICATION_TIMEOUT);
    
    return () => clearVerificationTimeout();
  }, [clearVerificationTimeout, toast]);

  // Function to load session from storage (used for remember me feature)
  const loadStoredSession = useCallback(() => {
    try {
      const storedSession = storageUtils.getLocalItem<{
        session: Session | null;
        remember: boolean;
      }>(AUTH_STORAGE_KEYS.SESSION);
      
      if (storedSession && storedSession.session) {
        console.log('Loaded stored session:', storedSession.remember ? 'with remember me' : 'without remember me');
        return { session: storedSession.session, remember: storedSession.remember };
      }
    } catch (error) {
      console.error('Failed to load stored session:', error);
    }
    return { session: null, remember: false };
  }, []);

  // Function to save session to storage (used for remember me feature)
  const saveSession = useCallback((session: Session | null, remember: boolean = false) => {
    try {
      if (session) {
        storageUtils.setLocalItem(AUTH_STORAGE_KEYS.SESSION, { 
          session, 
          remember 
        });
        storageUtils.setLocalItem(AUTH_STORAGE_KEYS.REMEMBER_ME, remember);
        console.log('Session saved to storage with remember me:', remember);
      } else {
        storageUtils.removeLocalItem(AUTH_STORAGE_KEYS.SESSION);
        console.log('Session removed from storage');
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, []);

  // Update auth state with consistent format and debounce premium checks
  const updateAuthState = useCallback(async (session: Session | null, remember: boolean = false) => {
    const user = session?.user || null;
    
    // Don't proceed if component is unmounted
    if (!isMountedRef.current) return;
    
    // Set basic auth state immediately for better UX
    setAuthState(prevState => ({
      ...prevState,
      user,
      session,
      isAuthenticated: !!session,
      isLoading: false,
      loading: false
    }));
    
    // Save session based on remember me preference
    saveSession(session, remember);
    
    // Reset verification attempts when successfully authenticated
    if (session) {
      verificationAttemptsRef.current = 0;
      clearVerificationTimeout();
    }
    
    // Record the last authentication check timestamp
    storageUtils.setLocalItem(AUTH_STORAGE_KEYS.LAST_AUTH_CHECK, Date.now());
    
    // Check premium status if user is logged in
    if (user?.id) {
      try {
        const isPremium = await checkPremiumStatus(user.id);
        const userTier = isPremium ? 'premium' : 'free';
        
        if (isMountedRef.current) {
          setAuthState(prevState => ({
            ...prevState,
            isPremium,
            userTier,
            usageQuota: {
              ...usageQuota,
              patients: {
                ...usageQuota.patients,
                limit: isPremium ? Infinity : usageQuota.patients.limit
              },
              mealPlans: {
                ...usageQuota.mealPlans,
                limit: isPremium ? Infinity : usageQuota.mealPlans.limit
              }
            }
          }));
        }
        
        // Store premium status in local storage with timestamp
        const premiumStatusKey = `${AUTH_STORAGE_KEYS.PREMIUM_STATUS_PREFIX}${user.id}`;
        storageUtils.setLocalItem(premiumStatusKey, {
          isPremium,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
    }

    // Invalidate subscription data when auth state changes
    if (user?.id) {
      // Use setTimeout to avoid doing this synchronously
      setTimeout(() => {
        if (isMountedRef.current) {
          queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
        }
      }, 0);
    }
  }, [checkPremiumStatus, queryClient, usageQuota, saveSession, clearVerificationTimeout]);

  // Initialize authentication state
  useEffect(() => {
    isMountedRef.current = true;
    let subscription: { unsubscribe: () => void } | null = null;

    // Set up auth state change listener first
    const setupAuthListener = async () => {
      const { data } = await supabase.auth.onAuthStateChange((event, session) => {
        if (!isMountedRef.current) return;
        
        console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
        
        // Get remember me preference
        const rememberMe = storageUtils.getLocalItem<boolean>(AUTH_STORAGE_KEYS.REMEMBER_ME) || false;
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado",
            description: "Você foi autenticado com sucesso."
          });
          
          // Update auth state with session and remember me preference
          updateAuthState(session, rememberMe);
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Sessão encerrada",
            description: "Você foi desconectado com sucesso."
          });
          
          // Clear session data and query cache
          saveSession(null);
          queryClient.clear();
          
          // Update auth state
          updateAuthState(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          
          // Update auth state with refreshed session
          updateAuthState(session, rememberMe);
        }
      });
      
      subscription = data.subscription;
    };

    // Check for existing session
    const checkSession = async () => {
      try {
        // First set up the auth listener
        await setupAuthListener();
        
        // Increment verification attempt counter
        verificationAttemptsRef.current += 1;
        console.log(`Session verification attempt ${verificationAttemptsRef.current}`);
        
        // Set timeout to break potential infinite loops
        setVerificationTimeout();
        
        // Try to load session from storage first (for remember me)
        const { session: storedSession, remember } = loadStoredSession();
        
        // If we have a stored session and remember me is enabled, use that
        if (storedSession && remember) {
          console.log("Using stored session from localStorage");
          updateAuthState(storedSession, remember);
          return;
        }
        
        // Otherwise check with Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log("Session check:", data.session ? "Session found" : "No session");
        
        // If there's an active session from Supabase
        if (data.session) {
          // Check if the session is still valid
          const expiresAt = data.session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          
          if (expiresAt && expiresAt < now) {
            console.warn("Session expired, clearing session data");
            await supabase.auth.signOut();
            updateAuthState(null);
          } else {
            // Valid session, update state
            updateAuthState(data.session, remember);
          }
        } else {
          // No session found
          updateAuthState(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        
        if (isMountedRef.current) {
          setAuthState(prev => ({ 
            ...prev, 
            isLoading: false, 
            loading: false, 
            isAuthenticated: false 
          }));
          
          toast({
            title: "Erro de autenticação",
            description: "Houve um problema ao verificar sua sessão. Por favor, tente novamente.",
            variant: "destructive"
          });
        }
      }
    };

    checkSession();

    return () => {
      isMountedRef.current = false;
      clearVerificationTimeout();
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [updateAuthState, toast, queryClient, loadStoredSession, setVerificationTimeout, clearVerificationTimeout]);

  return {
    authState,
    updateAuthState
  };
};

export default useAuthStateManager;
