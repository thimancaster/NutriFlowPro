
import { supabase } from '@/integrations/supabase/client';
import { ToastProps } from '@/hooks/toast/toast-types';
import { validatePasswordStrength, checkClientRateLimit } from '@/utils/securityUtils';

/**
 * Enhanced signup with email verification enforcement
 */
export const enhancedSignup = async (
  email: string, 
  password: string, 
  name: string, 
  toast: (props: ToastProps) => any,
  phone?: string,
  crn?: string
) => {
  try {
    console.log("Enhanced signup attempt for:", email);
    
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
      throw new Error("Muitas tentativas de cadastro. Tente novamente em alguns minutos.");
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name,
          phone: phone || null,
          crn: crn || null
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error("Signup error:", error.message);
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        throw new Error("Este email já está cadastrado. Tente fazer login ou use outro email.");
      }
      
      throw error;
    }

    if (data.user) {
      // Don't auto-login - require email verification
      if (!data.user.email_confirmed_at) {
        toast({
          title: "Verificação de email necessária",
          description: `Enviamos um link de verificação para ${email}. Verifique seu email antes de fazer login.`,
        });
      }

      // Create extended user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{ 
          id: data.user.id,
          name,
          email,
          phone: phone || null,
          crn: crn || null,
          email_verified: false
        }]);

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        toast({
          title: "Aviso",
          description: "Conta criada, mas houve um problema ao salvar informações adicionais.",
          variant: "warning"
        });
      }
      
      return { 
        success: true, 
        user: data.user,
        emailVerificationRequired: !data.user.email_confirmed_at 
      };
    }
    
    return { success: false, error: new Error("Falha ao criar usuário") };
  } catch (error: any) {
    console.error("Enhanced signup error:", error.message);
    toast({
      title: "Erro ao criar conta",
      description: error.message || "Ocorreu um problema ao tentar criar sua conta.",
      variant: "destructive"
    });
    return { success: false, error };
  }
};
