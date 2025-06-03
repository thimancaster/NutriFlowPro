
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { checkClientRateLimit, isValidEmail } from '@/utils/securityUtils';

interface LoginResult {
  success: boolean;
  session?: Session | null;
  error?: Error;
}

/**
 * Log security event to console for now (until database types are updated)
 */
const logSecurityEvent = (eventType: string, eventData: any = {}) => {
  console.log(`Security Event: ${eventType}`, eventData);
};

/**
 * Handles user login with enhanced security validation and better error handling
 */
export const login = async (
  email: string, 
  password: string, 
  remember: boolean = false,
  toast: (props: any) => any
): Promise<LoginResult> => {
  try {
    console.log("Attempting login for:", email);
    
    // Enhanced input validation
    if (!email?.trim()) {
      throw new Error("O email é obrigatório");
    }
    
    if (!isValidEmail(email)) {
      throw new Error("Formato de email inválido");
    }
    
    if (!password) {
      throw new Error("A senha é obrigatória");
    }
    
    // Enhanced rate limiting with exponential backoff
    if (!checkClientRateLimit(`login_${email}`, 5, 15 * 60 * 1000)) {
      logSecurityEvent('login_rate_limited', { email });
      throw new Error("Muitas tentativas de login. Tente novamente em 15 minutos.");
    }
    
    // Clear any existing session first to avoid conflicts
    try {
      await supabase.auth.signOut();
      console.log("Previous session cleared successfully");
    } catch (signOutError) {
      console.warn('Warning: Could not sign out existing session:', signOutError);
    }

    // Add a small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("Attempting signInWithPassword...");
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    
    console.log("SignIn response:", { 
      hasData: !!data, 
      hasSession: !!data?.session, 
      hasUser: !!data?.user,
      error: error?.message 
    });
    
    if (error) {
      // Log failed login attempt
      logSecurityEvent('login_failed', { 
        email, 
        error: error.message,
        remember 
      });
      
      // Handle common errors with user-friendly messages
      const errorMessage = getLoginErrorMessage(error);
      throw new Error(errorMessage);
    }
    
    if (!data.session) {
      throw new Error("Falha na autenticação. Sessão não foi criada.");
    }

    if (!data.user) {
      throw new Error("Falha na autenticação. Dados do usuário não encontrados.");
    }
    
    // Log successful login
    logSecurityEvent('login_success', { 
      email, 
      remember,
      user_id: data.user?.id 
    });
    
    // Clear rate limit on successful login
    localStorage.removeItem(`rate_limit_login_${email}`);
    
    console.log("Login successful:", {
      sessionExists: !!data.session,
      userId: data.user.id,
      userEmail: data.user.email
    });
    
    return { 
      success: true,
      session: data.session
    };
  } catch (error: any) {
    console.error("Login error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
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
 * Handles Google OAuth sign-in with enhanced security
 */
export const signInWithGoogle = async (toast: (props: any) => any): Promise<LoginResult> => {
  try {
    console.log("Iniciando login com Google...");
    
    // Log Google login attempt
    logSecurityEvent('google_login_attempt', {});
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      logSecurityEvent('google_login_failed', { error: error.message });
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
  
  if (message.includes("invalid login credentials") || message.includes("invalid_credentials")) {
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

  if (message.includes("database error") || message.includes("unexpected_failure")) {
    return "Erro temporário no servidor. Por favor, tente novamente em alguns instantes.";
  }

  if (message.includes("user not found")) {
    return "Usuário não encontrado. Verifique o email ou registre-se.";
  }

  if (message.includes("email_change_token")) {
    return "Erro de configuração no servidor. Tente novamente em alguns instantes.";
  }
  
  // Return original message if no specific match
  return error.message;
}
