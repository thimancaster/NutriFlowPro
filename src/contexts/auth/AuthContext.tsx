import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthSession } from '@supabase/supabase-js';
import type { AuthContextType } from './types';

const DEFAULT_AUTH_STATE = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isPremium: false,
  loading: true,
  userTier: 'free' as const,
  usageQuota: {
    patients: { used: 0, limit: 5 },
    mealPlans: { used: 0, limit: 3 },
  },
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');

  useEffect(() => {
    // Safety timeout: ensure initialLoad doesn't hang forever
    const safetyTimeout = setTimeout(() => {
      if (initialLoad) {
        console.warn('Auth initialization timeout - forcing completion');
        setInitialLoad(false);
        setIsLoading(false);
      }
    }, 10000); // 10 second safety net

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        setInitialLoad(false);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setIsLoading(false);
        setInitialLoad(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      subscription?.unsubscribe();
    };
  }, [initialLoad]);

  // Authentication methods
  const login = async (email: string, password: string, remember?: boolean) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const updateAuthState = async (session: AuthSession | null, remember?: boolean) => {
    setSession(session);
    setUser(session?.user ?? null);
  };

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    initialLoad,
    isAuthenticated: !!user,
    isPremium,
    loading: isLoading,
    userTier,
    usageQuota: DEFAULT_AUTH_STATE.usageQuota,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
    updateAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
