
import { supabase } from '@/integrations/supabase/client';
import { isValidEmail, validatePasswordStrength } from '@/utils/securityUtils';

interface SignupResult {
  success: boolean;
  error?: Error;
  user?: any;
}

export const signup = async (
  email: string,
  password: string,
  name: string,
  toast: (props: any) => any
): Promise<SignupResult> => {
  try {
    // Validate email
    if (!email || !isValidEmail(email)) {
      throw new Error("Por favor, insira um email válido.");
    }

    // Validate password
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0]);
    }

    // Validate name
    if (!name || name.trim().length < 2) {
      throw new Error("Por favor, insira um nome válido.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw error;
    }

    toast({
      title: "Conta criada com sucesso!",
      description: "Verifique seu email para confirmar sua conta.",
    });

    return {
      success: true,
      user: data.user
    };

  } catch (error: any) {
    console.error("Signup error:", error);
    
    let errorMessage = "Erro ao criar conta. Tente novamente.";
    
    if (error.message.includes("User already registered")) {
      errorMessage = "Este email já está registrado. Tente fazer login.";
    } else if (error.message.includes("Password should be")) {
      errorMessage = "A senha deve ter pelo menos 6 caracteres.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast({
      title: "Erro ao criar conta",
      description: errorMessage,
      variant: "destructive",
    });

    return {
      success: false,
      error: new Error(errorMessage)
    };
  }
};
