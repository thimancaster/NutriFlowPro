
import { supabase } from '@/integrations/supabase/client';
import { ToastProps } from '@/hooks/toast/toast-types';

/**
 * Log security event
 */
const logSecurityEvent = async (eventType: string, eventData: any = {}) => {
  try {
    await supabase.rpc('log_security_event', {
      event_type: eventType,
      event_data: eventData
    });
  } catch (error) {
    console.warn('Failed to log security event:', error);
  }
};

/**
 * Check rate limit for authentication attempts
 */
const checkRateLimit = async (identifier: string, attemptType: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_attempt_type: attemptType,
      p_max_attempts: 3, // Lower limit for signups
      p_window_minutes: 30
    });
    
    if (error) {
      console.warn('Rate limit check failed:', error);
      return true; // Allow on error to prevent blocking legitimate users
    }
    
    return data === true;
  } catch (error) {
    console.warn('Rate limit check error:', error);
    return true; // Allow on error
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
    
    // Check rate limit
    const rateLimitOk = await checkRateLimit(email, 'signup');
    if (!rateLimitOk) {
      await logSecurityEvent('signup_rate_limited', { email });
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
      await logSecurityEvent('signup_failed', { 
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
        await logSecurityEvent('signup_profile_error', { 
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
        await logSecurityEvent('signup_success', { 
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
