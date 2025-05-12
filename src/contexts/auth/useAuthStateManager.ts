
import { useState, useCallback, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';
import { useUsageQuota } from '@/hooks/useUsageQuota';
import { usePremiumCheck } from '@/hooks/usePremiumCheck';

export const useAuthStateManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { checkPremiumStatus } = usePremiumCheck();
  
  // Track if premium check is in progress to prevent multiple simultaneous calls
  const isPremiumCheckingRef = useRef(false);
  // Track last check timestamp to prevent too frequent checks
  const lastCheckTimeRef = useRef(0);
  // Track if the component is mounted
  const isMountedRef = useRef(true);

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

  // Update auth state with consistent format and debounce premium checks
  const updateAuthState = useCallback(async (session: Session | null) => {
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
    
    // Proceed with premium status check only if user is logged in
    let isPremium = false;
    let userTier = 'free' as 'free' | 'premium';
    
    if (user?.id) {
      // Skip premium check if one is already in progress or was done recently
      const now = Date.now();
      const shouldSkipCheck = 
        isPremiumCheckingRef.current || 
        (now - lastCheckTimeRef.current < 10000); // 10 second throttle
      
      if (!shouldSkipCheck) {
        try {
          isPremiumCheckingRef.current = true;
          
          // Try to get premium status from local storage first for instant response
          const cachedStatus = localStorage.getItem(`premium_status_${user.id}`);
          if (cachedStatus) {
            const { isPremium: cachedIsPremium, timestamp } = JSON.parse(cachedStatus);
            // Use cache only if it's less than 5 minutes old
            if (now - timestamp < 300000) {
              isPremium = cachedIsPremium;
              userTier = isPremium ? 'premium' : 'free';
              console.log("Using cached premium status:", isPremium);
            }
          }
          
          // Make API call to verify premium status in background
          const checkPremiumAsync = async () => {
            try {
              const freshIsPremium = await checkPremiumStatus(user.id);
              const freshUserTier = freshIsPremium ? 'premium' : 'free';
              
              // Cache the result
              localStorage.setItem(`premium_status_${user.id}`, JSON.stringify({
                isPremium: freshIsPremium,
                timestamp: Date.now()
              }));
              
              // Update state only if value changed or we were using cached value
              if (freshIsPremium !== isPremium || cachedStatus) {
                if (isMountedRef.current) {
                  setAuthState(prevState => ({
                    ...prevState,
                    isPremium: freshIsPremium,
                    userTier: freshUserTier,
                    usageQuota: {
                      ...usageQuota,
                      patients: {
                        ...usageQuota.patients,
                        limit: freshIsPremium ? Infinity : usageQuota.patients.limit
                      },
                      mealPlans: {
                        ...usageQuota.mealPlans,
                        limit: freshIsPremium ? Infinity : usageQuota.mealPlans.limit
                      }
                    }
                  }));
                }
              }
              
              lastCheckTimeRef.current = Date.now();
            } finally {
              isPremiumCheckingRef.current = false;
            }
          };
          
          // Start async check but don't await it
          checkPremiumAsync();
        } catch (error) {
          console.error("Error in initial premium status check:", error);
          isPremiumCheckingRef.current = false;
          
          // Set default values in case of error
          if (isMountedRef.current) {
            setAuthState(prevState => ({
              ...prevState,
              isPremium: false,
              userTier: 'free'
            }));
          }
        }
      }
    } else if (isMountedRef.current) {
      // Not logged in
      setAuthState(prevState => ({
        ...prevState,
        isPremium: false,
        userTier: 'free'
      }));
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
  }, [checkPremiumStatus, queryClient, usageQuota]);

  // Initialize authentication state
  useEffect(() => {
    isMountedRef.current = true;

    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMountedRef.current) return;
      
      console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
      
      if (event === 'SIGNED_IN') {
        toast({
          title: "Login realizado",
          description: "Você foi autenticado com sucesso."
        });
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Sessão encerrada",
          description: "Você foi desconectado com sucesso."
        });
        queryClient.clear();
      }

      updateAuthState(session);
    });

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log("Initial session check:", data.session ? "Session found" : "No session");
        if (isMountedRef.current) updateAuthState(data.session);
      } catch (error) {
        console.error("Error checking session:", error);
        if (isMountedRef.current) {
          setAuthState(prev => ({ ...prev, isLoading: false, loading: false, isAuthenticated: false }));
        }
      }
    };

    checkSession();

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState, toast, queryClient]);

  return {
    authState,
    updateAuthState,
    toast,
    queryClient
  };
};
