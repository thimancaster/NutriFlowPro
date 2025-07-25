
import { supabase } from '@/integrations/supabase/client';
import { auditLogService } from '@/services/auditLogService';
import { checkRateLimit, logSecurityEvent } from '@/utils/security/advancedSecurityUtils';
import { isValidEmail } from '@/utils/securityUtils';

export const enhancedLogin = async (email: string, password: string, toast: any) => {
  // Rate limiting check
  if (!checkRateLimit(email)) {
    toast({
      title: "Muitas tentativas",
      description: "Aguarde antes de tentar novamente.",
      variant: "destructive",
    });
    return { success: false, error: new Error('Rate limit exceeded') };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await auditLogService.logLoginAttempt(email, false, {
        error: error.message
      });
      return { success: false, error: new Error(error.message) };
    }

    await auditLogService.logLoginAttempt(email, true);
    
    // Log security event
    await logSecurityEvent({
      user_id: data.user.id,
      event_type: 'successful_login',
      event_data: {
        email,
        timestamp: new Date().toISOString()
      }
    });

    return { 
      success: true, 
      data: { session: data.session, user: data.user } 
    };

  } catch (err: any) {
    await auditLogService.logLoginAttempt(email, false, {
      error: err.message
    });
    return { success: false, error: new Error(err.message) };
  }
};

export const enhancedSignup = async (email: string, password: string, name: string, toast: any) => {
  if (!email || !isValidEmail(email)) {
    toast({
      title: "Erro de validação",
      description: "Por favor, insira um email válido.",
      variant: "destructive",
    });
    return { success: false, error: new Error('Invalid email') };
  }

  if (!password || password.length < 6) {
    toast({
      title: "Erro de validação",
      description: "A senha deve ter pelo menos 6 caracteres.",
      variant: "destructive",
    });
    return { success: false, error: new Error('Password too short') };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });

    if (error) {
      await auditLogService.logLoginAttempt(email, false, {
        error: error.message
      });
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível criar a conta.",
        variant: "destructive",
      });
      return { success: false, error: new Error(error.message) };
    }

    await auditLogService.logLoginAttempt(email, true);
    toast({
      title: "Conta criada com sucesso",
      description: "Bem-vindo!",
    });
    return { 
      success: true, 
      data: { session: data.session, user: data.user } 
    };

  } catch (err: any) {
    await auditLogService.logLoginAttempt(email, false, {
      error: err.message
    });
    toast({
      title: "Erro ao criar conta",
      description: err.message || "Erro interno do servidor.",
      variant: "destructive",
    });
    return { success: false, error: new Error(err.message) };
  }
};

export const enhancedLogout = async (toast: any) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: new Error(error.message) };
    }

    return { success: true };
  } catch (err: any) {
    toast({
      title: "Erro ao sair",
      description: err.message,
      variant: "destructive",
    });
    return { success: false, error: new Error(err.message) };
  }
};

export const validateSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }

    return !!data.session;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};
