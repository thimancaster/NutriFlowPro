
import { supabase } from '@/integrations/supabase/client';
import { Toast } from '@/hooks/use-toast';
import { QueryClient } from '@tanstack/react-query';

/**
 * Handles user logout and session cleanup
 */
export const logout = async (
  toast: Toast,
  queryClient: QueryClient,
  updateAuthState: (session: any) => Promise<void>
) => {
  try {
    console.log("Iniciando processo de logout...");
    
    // Clear React Query cache before logout
    queryClient.clear();
    
    // Execute logout in Supabase
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Force global scope to clear all sessions
    });
    
    if (error) {
      console.error("Erro Supabase durante logout:", error);
      throw error;
    }
    
    console.log("Supabase signOut concluído, limpando localStorage...");
    
    // Manually clear all Supabase-related items from localStorage
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
    
    // Additional check after a short delay to ensure the session was removed
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
    
    // Update local state immediately
    updateAuthState(null);
    
    // Navigate to the login screen with hash router (compatible with HashRouter)
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
    
    // Even with error, force redirection to login
    const baseUrl = window.location.href.split('#')[0];
    setTimeout(() => {
      window.location.href = `${baseUrl}#/login`;
    }, 1000);
    
    return { success: false, error };
  }
};
