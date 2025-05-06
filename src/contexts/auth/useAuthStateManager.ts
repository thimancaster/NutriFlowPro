
import { useState, useCallback, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState } from './types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';

// Define limits for free tier
const FREE_TIER_LIMITS = {
  patients: 5,
  mealPlans: 3
};

export const useAuthStateManager = () => {
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
        limit: FREE_TIER_LIMITS.patients
      },
      mealPlans: {
        used: 0,
        limit: FREE_TIER_LIMITS.mealPlans
      }
    }
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update auth state with consistent format
  const updateAuthState = useCallback(async (session: Session | null) => {
    const user = session?.user || null;
    
    // Use the secure RPC function to check premium status
    let isPremium = false;
    let userTier = 'free' as 'free' | 'premium';
    
    if (user?.id) {
      try {
        const { data, error } = await supabase.rpc('check_user_premium_status', {
          user_id: user.id
        });
        
        if (error) {
          console.error("Error checking premium status:", error);
          // Fallback to email check if RPC fails
          isPremium = user?.email ? ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'].includes(user.email) : false;
        } else {
          isPremium = !!data;
        }
        
        // Set user tier based on premium status
        userTier = isPremium ? 'premium' : 'free';
        
        // If user is authenticated, fetch their usage data
        let patientsUsed = 0;
        let mealPlansUsed = 0;
        
        if (user.id) {
          // Get patient count
          const { count: patientCount, error: patientError } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
            
          if (!patientError) {
            patientsUsed = patientCount || 0;
          }
          
          // Get meal plan count
          const { count: mealPlanCount, error: mealPlanError } = await supabase
            .from('meal_plans')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
            
          if (!mealPlanError) {
            mealPlansUsed = mealPlanCount || 0;
          }
        }
        
        setAuthState({
          user,
          session,
          isAuthenticated: !!session,
          isLoading: false,
          isPremium,
          loading: false,
          userTier,
          usageQuota: {
            patients: {
              used: patientsUsed,
              limit: isPremium ? Infinity : FREE_TIER_LIMITS.patients
            },
            mealPlans: {
              used: mealPlansUsed,
              limit: isPremium ? Infinity : FREE_TIER_LIMITS.mealPlans
            }
          }
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
          usageQuota: {
            patients: {
              used: 0,
              limit: FREE_TIER_LIMITS.patients
            },
            mealPlans: {
              used: 0,
              limit: FREE_TIER_LIMITS.mealPlans
            }
          }
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
        usageQuota: {
          patients: {
            used: 0,
            limit: FREE_TIER_LIMITS.patients
          },
          mealPlans: {
            used: 0,
            limit: FREE_TIER_LIMITS.mealPlans
          }
        }
      });
    }

    // Invalidate subscription data when auth state changes
    if (user?.id) {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
      }, 0);
    }
  }, [queryClient]);

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
