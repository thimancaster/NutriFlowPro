
import { supabase } from '@/integrations/supabase/client';
import { ToastProps } from '@/hooks/toast/toast-types';

/**
 * Log security event to console for now (until database types are updated)
 */
const logSecurityEvent = (eventType: string, eventData: any = {}) => {
  console.log(`Security Event: ${eventType}`, eventData);
  // TODO: Implement database logging once types are updated
};

/**
 * Simple rate limiting using localStorage for client-side protection
 */
const checkClientRateLimit = (email: string, attemptType: string): boolean => {
  const key = `${attemptType}_attempts_${email}`;
  const now = Date.now();
  const windowMs = 30 * 60 * 1000; // 30 minutes
  
  try {
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { attempts: 0, resetTime: now + windowMs };
    
    if (now > data.resetTime) {
      data.attempts = 0;
      data.resetTime = now + windowMs;
    }
    
    if (data.attempts >= 3) { // Lower limit for signups
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
 * Handles user registration with email, password and name
 */
export const signup = async (
  email: string, 
  password: string, 
  name: string, 
  toast: (props: ToastProps) => any
) => {
  try {
    console.log("Attempting signup for:", email);
    
    // Validate inputs
    if (!email.trim()) {
      throw new Error("O email é obrigatório");
    }
    
    if (!password) {
      throw new Error("A senha é obrigatória");
    }
    
    if (!name.trim()) {
      throw new Error("O nome é obrigatório");
    }
    
    // Check password strength
    if (password.length < 8) {
      throw new Error("A senha deve ter pelo menos 8 caracteres");
    }
    
    // Check client-side rate limit
    if (!checkClientRateLimit(email, 'signup')) {
      logSecurityEvent('signup_rate_limited', { email });
      throw new Error("Muitas tentativas de cadastro. Tente novamente em alguns minutos.");
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) {
      // Log failed signup attempt
      logSecurityEvent('signup_failed', { 
        email, 
        error: error.message 
      });
      throw error;
    }

    if (data.user) {
      // Create profile for the new user
      const { error: profileError } = await supabase
        .from('users')
        .insert([{ 
          id: data.user.id,
          name,
          email
        }]);

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // We don't throw here because the auth user was created successfully
        // and we'll rely on the database trigger as a fallback
        logSecurityEvent('signup_profile_error', { 
          email, 
          user_id: data.user.id,
          error: profileError.message 
        });
        
        toast({
          title: "Conta criada com avisos",
          description: "Sua conta foi criada, mas houve um problema ao configurar seu perfil. Entre em contato com o suporte se necessário.",
          variant: "warning"
        });
      } else {
        // Log successful signup
        logSecurityEvent('signup_success', { 
          email, 
          user_id: data.user.id 
        });
        
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo ao NutriFlow Pro!",
        });
      }
      
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
