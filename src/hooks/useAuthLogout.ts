
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { SUBSCRIPTION_QUERY_KEY } from './useUserSubscription';

export const useAuthLogout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    try {
      console.log("Iniciando processo de logout");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("Logout bem-sucedido, limpando cache");
      // Limpar o cache e estado
      queryClient.clear();
      
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso."
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [queryClient, toast]);

  return logout;
};
