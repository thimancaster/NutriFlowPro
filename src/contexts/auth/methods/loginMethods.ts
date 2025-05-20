
import { supabase } from '@/integrations/supabase/client';
import { toast as Toast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';

interface LoginResult {
  success: boolean;
  session?: Session | null;
  error?: Error;
}

/**
 * Handles user login with email and password
 */
export const login = async (
  email: string, 
  password: string, 
  remember: boolean = false,
  toast: typeof Toast
): Promise<LoginResult> => {
  try {
    console.log("Attempting login for:", email);
    
    // Validate inputs
    if (!email.trim()) {
      throw new Error("O email é obrigatório");
    }
    
    if (!password) {
      throw new Error("A senha é obrigatória");
    }
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      // Handle common errors with user-friendly messages
      const errorMessage = getLoginErrorMessage(error);
      throw new Error(errorMessage);
    }
    
    console.log("Login successful:", !!data.session);
    
    return { 
      success: true,
      session: data.session
    };
  } catch (error: any) {
    console.error("Login error:", error.message);
    
    toast({
      title: "Erro ao fazer login",
      description: error.message || "Verifique seu email e senha e tente novamente.",
      variant: "destructive"
    });
    
    return { 
      success: false, 
      error,
      session: null
    };
  }
};

/**
 * Handles Google OAuth sign-in
 */
export const signInWithGoogle = async (toast: typeof Toast): Promise<LoginResult> => {
  try {
    console.log("Iniciando login com Google...");
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log("Redirecionando para autenticação Google...", data);
    
    return { 
      success: true 
    };
  } catch (error: any) {
    console.error("Erro ao fazer login com Google:", error.message);
    
    toast({
      title: "Erro ao fazer login com Google",
      description: error.message || "Não foi possível conectar com o Google. Tente novamente.",
      variant: "destructive"
    });
    
    return { 
      success: false, 
      error 
    };
  }
};

/**
 * Get user-friendly error message for login errors
 */
function getLoginErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();
  
  if (message.includes("invalid login credentials")) {
    return "Email ou senha incorretos. Por favor, verifique suas credenciais.";
  } 
  
  if (message.includes("invalid email")) {
    return "O formato do email é inválido. Por favor, verifique o email informado.";
  }
  
  if (message.includes("email not confirmed")) {
    return "O email ainda não foi confirmado. Por favor, verifique sua caixa de entrada para o link de confirmação.";
  }
  
  if (message.includes("too many requests")) {
    return "Muitas tentativas de login. Por favor, aguarde alguns minutos antes de tentar novamente.";
  }
  
  if (message.includes("network") || message.includes("connection")) {
    return "Erro de conexão. Por favor, verifique sua internet e tente novamente.";
  }
  
  // Return original message if no specific match
  return error.message;
}
