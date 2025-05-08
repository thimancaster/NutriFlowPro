import { supabase } from '@/integrations/supabase/client';
import { toast as Toast } from '@/hooks/use-toast';

/**
 * Handles user login with email and password
 */
export const login = async (
  email: string, 
  password: string, 
  toast: typeof Toast
) => {
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

/**
 * Handles Google OAuth sign-in
 */
export const signInWithGoogle = async (toast: typeof Toast) => {
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
