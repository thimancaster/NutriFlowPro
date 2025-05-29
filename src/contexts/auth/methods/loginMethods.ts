
import { supabase } from '@/integrations/supabase/client';
import { ToastProps } from '@/hooks/toast/toast-types';
import { Session } from '@supabase/supabase-js';

interface LoginResult {
  success: boolean;
  session?: Session | null;
  error?: Error;
}

/**
 * Simple rate limiting using localStorage for client-side protection
 */
const checkClientRateLimit = (email: string): boolean => {
  const key = `login_attempts_${email}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  try {
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { attempts: 0, resetTime: now + windowMs };
    
    if (now > data.resetTime) {
      data.attempts = 0;
      data.resetTime = now + windowMs;
    }
    
    if (data.attempts >= 5) {
      return false;
    }
    
    data.attempts += 1;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Rate limit check failed:', error);
    return true;
  }
};

/**
 * Log security event to console for now (until database types are updated)
 */
const logSecurityEvent = (eventType: string, eventData: any = {}) => {
  console.log(`Security Event: ${eventType}`, eventData);
  // TODO: Implement database logging once types are updated
};

/**
 * Handles user login with email and password
 */
export const login = async (
  email: string, 
  password: string, 
  remember: boolean = false,
  toast: (props: ToastProps) => any
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
    
    // Check client-side rate limit
    if (!checkClientRateLimit(email)) {
      logSecurityEvent('login_rate_limited', { email });
      throw new Error("Muitas tentativas de login. Tente novamente em alguns minutos.");
    }
    
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
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
    
    // Log successful login
    logSecurityEvent('login_success', { 
      email, 
      remember,
      user_id: data.user?.id 
    });
    
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
export const signInWithGoogle = async (toast: (props: ToastProps) => any): Promise<LoginResult> => {
  try {
    console.log("Iniciando login com Google...");
    
    // Log Google login attempt
    logSecurityEvent('google_login_attempt', {});
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
