
import { supabase } from '@/integrations/supabase/client';
import { toast as Toast } from '@/hooks/use-toast';
import { QueryClient } from '@tanstack/react-query';

/**
 * Handles user logout and state cleanup
 */
export const logout = async (
  toast: typeof Toast,
  queryClient: QueryClient,
  updateAuthState: (session: null) => Promise<void>
) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Clear any cached data
    queryClient.clear();
    
    // Update auth state to reflect logout
    await updateAuthState(null);
    
    toast({
      title: "Logout efetuado com sucesso",
      description: "Sua sessão foi encerrada.",
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error.message);
    toast({
      title: "Erro ao fazer logout",
      description: error.message || "Ocorreu um problema ao tentar encerrar sua sessão.",
      variant: "destructive"
    });
    return { success: false, error };
  }
};
