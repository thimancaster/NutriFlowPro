
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPremium: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<{ success: boolean; error?: Error }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: Error }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    isPremium: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is premium based on email
  const checkPremiumStatus = useCallback((email: string | undefined) => {
    if (!email) return false;
    // Check against premium emails list
    const PREMIUM_EMAILS = ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'];
    return PREMIUM_EMAILS.includes(email);
  }, []);

  // Update auth state with consistent format
  const updateAuthState = useCallback((session: Session | null) => {
    const user = session?.user || null;
    const isPremium = user ? checkPremiumStatus(user.email) : false;
    
    setAuthState({
      user,
      session,
      isAuthenticated: !!session,
      isLoading: false,
      isPremium
    });

    // Invalidate subscription data when auth state changes
    if (user?.id) {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY, user.id] });
      }, 0);
    }
  }, [checkPremiumStatus, queryClient]);

  // Initialize authentication state
  useEffect(() => {
    let isMounted = true;

    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      console.log("Auth state changed:", event);
      
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
        if (isMounted) updateAuthState(data.session);
      } catch (error) {
        console.error("Error checking session:", error);
        if (isMounted) {
          setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState, toast, queryClient]);

  // Authentication methods
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique seu email e senha e tente novamente.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile for the new user
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ 
            id: data.user.id,
            name,
            email
          }]);

        if (profileError) throw profileError;
        
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo ao NutriFlow Pro!",
        });
        
        return { success: true };
      }
      
      return { success: false, error: new Error("Falha ao criar usuário") };
    } catch (error: any) {
      console.error("Signup error:", error.message);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um problema ao tentar criar sua conta.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      queryClient.clear();
      return { success: true };
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Reset password error:", error.message);
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message || "Ocorreu um problema ao tentar enviar o e-mail de redefinição de senha.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
