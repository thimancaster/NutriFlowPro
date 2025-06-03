
import { supabase } from '@/integrations/supabase/client';
import { isValidEmail } from '@/utils/securityUtils';

interface PasswordResetResult {
  success: boolean;
  error?: Error;
}

export const resetPassword = async (
  email: string,
  toast: (props: any) => any
): Promise<PasswordResetResult> => {
  try {
    if (!email || !isValidEmail(email)) {
      throw new Error("Por favor, insira um email válido.");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      throw error;
    }

    toast({
      title: "Email enviado!",
      description: "Verifique sua caixa de entrada para redefinir sua senha.",
    });

    return { success: true };

  } catch (error: any) {
    console.error("Password reset error:", error);
    
    toast({
      title: "Erro ao enviar email",
      description: error.message || "Não foi possível enviar o email de recuperação.",
      variant: "destructive",
    });

    return {
      success: false,
      error: new Error(error.message)
    };
  }
};
