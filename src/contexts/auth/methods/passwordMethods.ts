import { supabase } from '@/integrations/supabase/client';
import { toast as Toast } from '@/hooks/use-toast';

/**
 * Handles password reset request
 */
export const resetPassword = async (
  email: string, 
  toast: typeof Toast
) => {
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

/**
 * Updates user's password
 */
export const updatePassword = async (
  password: string,
  toast: typeof Toast
) => {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) throw error;
    
    toast({
      title: "Senha alterada com sucesso",
      description: "Sua nova senha foi definida.",
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Update password error:", error.message);
    toast({
      title: "Erro ao atualizar senha",
      description: error.message || "Ocorreu um problema ao tentar atualizar sua senha.",
      variant: "destructive"
    });
    return { success: false, error };
  }
};
