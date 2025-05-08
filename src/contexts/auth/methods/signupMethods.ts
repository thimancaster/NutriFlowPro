
import { supabase } from '@/integrations/supabase/client';
import { Toast } from '@/hooks/use-toast';

/**
 * Handles user registration with email, password and name
 */
export const signup = async (
  email: string, 
  password: string, 
  name: string, 
  toast: Toast
) => {
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
