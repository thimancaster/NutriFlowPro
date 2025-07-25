import { supabase } from '@/integrations/supabase/client';
import { auditLogService } from '@/services/auditLogService';
import { isValidEmail } from '@/utils/securityUtils';

export const login = async (email: string, password: string, toast: any) => {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await auditLogService.logLoginAttempt(email, false, {
        error: error.message
      });
      
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas.",
        variant: "destructive",
      });
      
      return { success: false, error: new Error(error.message) };
    }

    await auditLogService.logLoginAttempt(email, true);
    
    toast({
      title: "Login realizado com sucesso",
      description: "Bem-vindo de volta!",
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
      title: "Erro no login",
      description: err.message || "Erro interno do servidor.",
      variant: "destructive",
    });
    
    return { success: false, error: new Error(err.message) };
  }
};

export const signup = async (email: string, password: string, name: string, toast: any) => {
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
          name: name,
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

export const logout = async (toast: any, queryClient: any, updateAuthState: any) => {
  const result = await supabase.auth.signOut();
  
  if (result.error) {
    toast({
      title: "Erro ao fazer logout",
      description: result.error.message || "Não foi possível desconectar.",
      variant: "destructive",
    });
    return { success: false, error: new Error(result.error.message) };
  }
  
  // Clear query cache
  queryClient.clear();
  
  // Update auth state
  await updateAuthState(null, false);
  
  toast({
    title: "Logout realizado com sucesso",
    description: "Você foi desconectado com segurança.",
  });
  
  return { success: true };
};

export const resetPassword = async (email: string, toast: any) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível redefinir a senha.",
        variant: "destructive",
      });
      return { success: false, error: new Error(error.message) };
    }

    toast({
      title: "Redefinição de senha solicitada",
      description: "Enviamos um link para o seu email para redefinir sua senha.",
    });
    return { success: true };
  } catch (err: any) {
    toast({
      title: "Erro ao redefinir senha",
      description: err.message || "Erro interno do servidor.",
      variant: "destructive",
    });
    return { success: false, error: new Error(err.message) };
  }
};

export const signInWithGoogle = async (toast: any) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    });

    if (error) {
      toast({
        title: "Erro no login com Google",
        description: error.message || "Não foi possível fazer login com Google.",
        variant: "destructive",
      });
      return { success: false, error: new Error(error.message) };
    }

    return { success: true };
  } catch (error: any) {
    toast({
      title: "Erro no login com Google",
      description: error.message || "Não foi possível fazer login com Google.",
      variant: "destructive",
    });

    return {
      success: false,
      error: new Error(error.message)
    };
  }
};
