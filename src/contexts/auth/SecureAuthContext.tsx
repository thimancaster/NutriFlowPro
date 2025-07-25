
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { enhancedLogin, validateSession, enhancedLogout } from './enhancedAuthMethods';
import { generateSessionFingerprint, logSecurityEvent } from '@/utils/security/advancedSecurityUtils';
import { validatePremiumAccess } from '@/utils/premium/premiumSecurityUtils';

interface SecureAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkPremiumAccess: (feature: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (!context) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize session fingerprint
    if (!localStorage.getItem('session_fingerprint')) {
      localStorage.setItem('session_fingerprint', generateSessionFingerprint());
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const currentSession = await validateSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
      } catch (error) {
        console.error('Session validation failed:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes with enhanced security
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        try {
          if (event === 'SIGNED_IN' && currentSession) {
            const validatedSession = await validateSession();
            setSession(validatedSession);
            setUser(validatedSession?.user || null);
            
            await logSecurityEvent('auth_state_change', { 
              event: 'signed_in',
              user_id: validatedSession?.user?.id 
            });
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
            
            await logSecurityEvent('auth_state_change', { 
              event: 'signed_out' 
            });
          } else if (event === 'TOKEN_REFRESHED' && currentSession) {
            const validatedSession = await validateSession();
            setSession(validatedSession);
            setUser(validatedSession?.user || null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await enhancedLogin(email, password);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await enhancedLogout();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkPremiumAccess = async (feature: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await validatePremiumAccess(user.id, feature as any);
      return result.canAccess;
    } catch (error) {
      console.error('Premium access check failed:', error);
      return false;
    }
  };

  const value = {
    user,
    session,
    loading,
    login,
    logout,
    checkPremiumAccess,
    isAuthenticated: !!user
  };

  return (
    <SecureAuthContext.Provider value={value}>
      {children}
    </SecureAuthContext.Provider>
  );
};
