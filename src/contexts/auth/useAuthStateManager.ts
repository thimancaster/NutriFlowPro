
import { useState, useCallback, useEffect } from 'react';
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

  // Update auth state with consistent format
  const updateAuthState = useCallback(async (session: Session | null) => {
    const user = session?.user || null;
    
    let isPremium = false;
    let userTier = 'free' as 'free' | 'premium';
    
    if (user?.id) {
      try {
        isPremium = await checkPremiumStatus(user.id);
        userTier = isPremium ? 'premium' : 'free';
        
        setAuthState({
          user,
          session,
          isAuthenticated: !!session,
          isLoading: false,
          isPremium,
          loading: false,
          userTier,
          usageQuota
        });
      } catch (error) {
        console.error("Error checking premium status:", error);
        // Set default values in case of error
        setAuthState({
          user,
          session,
          isAuthenticated: !!session,
          isLoading: false,
          isPremium: false,
          loading: false,
          userTier: 'free',
          usageQuota
        });
      }
    } else {
      // Not logged in
      setAuthState({
        user,
        session,
        isAuthenticated: !!session,
        isLoading: false,
        isPremium: false,
        loading: false,
        userTier: 'free',
        usageQuota
      });
    }

    // Invalidate subscription data when auth state changes
    if (user?.id) {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
      }, 0);
    }
  }, [checkPremiumStatus, queryClient, usageQuota]);

  // Initialize authentication state
  useEffect(() => {
    let isMounted = true;

    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
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
        if (isMounted) updateAuthState(data.session);
      } catch (error) {
        console.error("Error checking session:", error);
        if (isMounted) {
          setAuthState(prev => ({ ...prev, isLoading: false, loading: false, isAuthenticated: false }));
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
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
