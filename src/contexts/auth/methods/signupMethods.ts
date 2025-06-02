
import { supabase } from '@/integrations/supabase/client';
import { ToastProps } from '@/hooks/toast/toast-types';
import { validatePasswordStrength, checkClientRateLimit } from '@/utils/securityUtils';

/**
 * Log security event to console for now (until database types are updated)
 */
const logSecurityEvent = (eventType: string, eventData: any = {}) => {
  console.log(`Security Event: ${eventType}`, eventData);
  // TODO: Implement database logging once types are updated
};

/**
 * Handles user registration with enhanced security validation
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
    
    // Enhanced password validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0]);
    }
    
    // Check client-side rate limit
    if (!checkClientRateLimit(`signup_${email}`, 3, 30 * 60 * 1000)) {
      logSecurityEvent('signup_rate_limited', { email });
      throw new Error("Muitas tentativas de cadastro. Tente novamente em alguns minutos.");
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
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
        logSecurityEvent('signup_success', { 
          email, 
          user_id: data.user.id 
        });
        
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo ao NutriFlow Pro! Verifique seu email para confirmar sua conta.",
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
