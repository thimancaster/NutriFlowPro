
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { enhancedLogin, enhancedSignup, enhancedLogout, validateSession } from './enhancedAuthMethods';
import { useToast } from '@/components/ui/use-toast';

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<{ success: boolean; error?: Error }>;
  validateSessionIntegrity: () => Promise<boolean>;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await enhancedLogin(email, password, toast);
      return result;
    } catch (error) {
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const result = await enhancedSignup(email, password, name, toast);
      return result;
    } catch (error) {
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const result = await enhancedLogout(toast);
      return result;
    } catch (error) {
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const validateSessionIntegrity = async () => {
    return await validateSession();
  };

  const value = {
    user,
    session,
    loading,
    login,
    signup,
    logout,
    validateSessionIntegrity
  };

  return (
    <SecureAuthContext.Provider value={value}>
      {children}
    </SecureAuthContext.Provider>
  );
};

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};
