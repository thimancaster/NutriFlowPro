import { useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';
import { useUsageQuota } from '@/hooks/useUsageQuota';
import useAuthStorage from './useAuthStorage';
import useVerification from './useVerification';
import usePremiumStatusCheck from './usePremiumStatusCheck';

export const useAuthStateManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // Auth storage utilities
  const { 
    loadStoredSession, 
    saveSession, 
    updateLastAuthCheck,
    getLastAuthCheck
  } = useAuthStorage();
  
  // Verification utilities
  const {
    isMountedRef,
    clearVerificationTimeout,
    setVerificationTimeout,
    incrementVerificationAttempt,
    resetVerificationAttempts
  } = useVerification();
  
  // Premium status check
  const { checkUserPremiumStatus } = usePremiumStatusCheck();

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
      resetVerificationAttempts();
      clearVerificationTimeout();
    }
    
    // Record the last authentication check timestamp
    updateLastAuthCheck();
    
    // Proceed with premium status check
    await checkUserPremiumStatus(
      user, 
      authState, 
      usageQuota, 
      setAuthState,
      isMountedRef
    );

    // Invalidate subscription data when auth state changes
    if (user?.id) {
      // Use setTimeout to avoid doing this synchronously
      setTimeout(() => {
        if (isMountedRef.current) {
          queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
        }
      }, 0);
    }
  }, [
    authState, 
    clearVerificationTimeout, 
    checkUserPremiumStatus, 
    isMountedRef, 
    queryClient, 
    resetVerificationAttempts, 
    saveSession, 
    updateLastAuthCheck, 
    usageQuota
  ]);

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
        incrementVerificationAttempt();
        
        // Set timeout to break potential infinite loops
        setVerificationTimeout(setAuthState);
        
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
  }, [
    clearVerificationTimeout, 
    incrementVerificationAttempt, 
    loadStoredSession, 
    queryClient, 
    saveSession, 
    setVerificationTimeout, 
    toast, 
    updateAuthState
  ]);

  return {
    authState,
    updateAuthState,
    toast,
    queryClient
  };
};

// Add missing imports
import { storageUtils } from '@/utils/storageUtils';
import { AUTH_STORAGE_KEYS } from '@/constants/authConstants';

export default useAuthStateManager;
