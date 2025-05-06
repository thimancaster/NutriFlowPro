
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from '@/hooks/useUserSubscription';
import { validatePremiumStatus } from '@/utils/subscriptionUtils';
import { User } from '@supabase/supabase-js';
import { useCallback } from 'react';

export const useAuthMethods = (
  updateAuthState: (session: any) => Promise<void>,
  toast: ReturnType<typeof useToast>['toast'],
  queryClient: ReturnType<typeof useQueryClient>
) => {
  // Check if user is premium using the secure database function
  const checkPremiumStatus = useCallback(async (userId: string | undefined, email: string | undefined) => {
    if (!userId && !email) return false;
    try {
      return await validatePremiumStatus(userId, email);
    } catch (error) {
      console.error("Error checking premium status:", error);
      return false;
    }
  }, []);

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
      console.log("Iniciando processo de logout...");
      
      // Limpar o cache do React Query antes do logout
      queryClient.clear();
      
      // Executar o logout no Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Force global scope to clear all sessions
      });
      
      if (error) {
        console.error("Erro Supabase durante logout:", error);
        throw error;
      }
      
      console.log("Supabase signOut concluído, limpando localStorage...");
      
      // Limpar manualmente todos os itens relacionados ao Supabase no localStorage
      try {
        // Clean all Supabase-related items
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            localStorage.removeItem(key);
            console.log(`Removed localStorage item: ${key}`);
          }
        }
      } catch (e) {
        console.error("Erro ao limpar localStorage:", e);
      }
      
      // Verificação adicional após um curto atraso para garantir que a sessão foi removida
      setTimeout(async () => {
        try {
          const { data: sessionCheck } = await supabase.auth.getSession();
          
          if (sessionCheck.session) {
            console.error("Logout incompleto: sessão ainda existe após limpeza");
          } else {
            console.log("Verificação adicional: logout completo, sessão removida");
          }
        } catch (e) {
          console.error("Erro na verificação adicional da sessão:", e);
        }
      }, 300);
      
      // Atualizar estado local imediatamente
      updateAuthState(null);
      
      // Navegar para a tela de login com hash router (compatível com HashRouter)
      const baseUrl = window.location.href.split('#')[0];
      window.location.href = `${baseUrl}#/login`;
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro completo durante logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive"
      });
      
      // Mesmo com erro, forçar redirecionamento para login
      const baseUrl = window.location.href.split('#')[0];
      setTimeout(() => {
        window.location.href = `${baseUrl}#/login`;
      }, 1000);
      
      return { success: false, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/reset-password',
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

  const signInWithGoogle = async () => {
    try {
      console.log("Iniciando login com Google...");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#/dashboard`,
        }
      });
      
      if (error) throw error;
      
      console.log("Redirecionando para autenticação Google...", data);
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao fazer login com Google:", error.message);
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message || "Não foi possível conectar com o Google. Tente novamente.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  return {
    checkPremiumStatus,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle
  };
};
