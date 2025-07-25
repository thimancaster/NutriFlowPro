
import { supabase } from '@/integrations/supabase/client';
import { login as secureLogin, signup as secureSignup, secureLogout } from '@/utils/security/secureAuth';
import { resetPassword } from './methods/passwordMethods';
import { signup } from './methods/signupMethods';

export const login = async (email: string, password: string, remember: boolean = false, toast: any) => {
  return await secureLogin(email, password);
};

export const logout = async (toast: any, queryClient: any, updateAuthState: any) => {
  const result = await secureLogout();
  
  if (result.success) {
    // Clear query cache
    queryClient.clear();
    
    // Update auth state
    await updateAuthState(null, false);
    
    toast({
      title: "Logout realizado com sucesso",
      description: "Você foi desconectado com segurança.",
    });
  }
  
  return result;
};

export const signInWithGoogle = async (toast: any) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    toast({
      title: "Erro no login com Google",
      description: error.message || "Não foi possível fazer login com Google.",
      variant: "destructive",
    });

    return {
      success: false,
      error: new Error(error.message)
    };
  }
};

export { resetPassword, signup };
