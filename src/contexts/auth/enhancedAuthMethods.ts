
import { supabase } from "@/integrations/supabase/client";
import { generateSessionFingerprint, logSecurityEvent, checkRateLimit } from "@/utils/security/advancedSecurityUtils";

// Enhanced login with security features
export const enhancedLogin = async (email: string, password: string) => {
  const fingerprint = generateSessionFingerprint();
  const clientIP = await getClientIP();
  
  // Rate limiting for login attempts
  if (!checkRateLimit(`login_${email}`, 5, 300000)) { // 5 attempts per 5 minutes
    await logSecurityEvent('login_rate_limit', { email, ip: clientIP });
    throw new Error('Muitas tentativas de login. Tente novamente em 5 minutos.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      await logSecurityEvent('login_failed', { 
        email, 
        error: error.message,
        ip: clientIP,
        fingerprint 
      });
      
      // Check for suspicious activity
      if (error.message.includes('Invalid login credentials')) {
        await checkSuspiciousActivity(email);
      }
      
      throw error;
    }

    // Store session fingerprint
    localStorage.setItem('session_fingerprint', fingerprint);
    localStorage.setItem('login_timestamp', Date.now().toString());

    await logSecurityEvent('login_success', { 
      email,
      ip: clientIP,
      fingerprint 
    });

    return data;
  } catch (error) {
    await logSecurityEvent('login_exception', { 
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIP 
    });
    throw error;
  }
};

// Enhanced session validation
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      await logSecurityEvent('session_validation_error', { error: error.message });
      return null;
    }

    if (!session) {
      return null;
    }

    // Check session fingerprint
    const storedFingerprint = localStorage.getItem('session_fingerprint');
    const currentFingerprint = generateSessionFingerprint();
    
    if (storedFingerprint && storedFingerprint !== currentFingerprint) {
      await logSecurityEvent('session_fingerprint_mismatch', { 
        user_id: session.user.id 
      });
      
      // Force logout on fingerprint mismatch
      await supabase.auth.signOut();
      localStorage.removeItem('session_fingerprint');
      localStorage.removeItem('login_timestamp');
      
      throw new Error('Sessão inválida detectada. Faça login novamente.');
    }

    // Check session age (24 hours max)
    const loginTimestamp = localStorage.getItem('login_timestamp');
    if (loginTimestamp) {
      const sessionAge = Date.now() - parseInt(loginTimestamp);
      if (sessionAge > 24 * 60 * 60 * 1000) { // 24 hours
        await logSecurityEvent('session_expired', { user_id: session.user.id });
        await supabase.auth.signOut();
        localStorage.removeItem('session_fingerprint');
        localStorage.removeItem('login_timestamp');
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    return session;
  } catch (error) {
    await logSecurityEvent('session_validation_exception', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
};

// Check for suspicious login activity
const checkSuspiciousActivity = async (email: string) => {
  try {
    // This would typically query a database of failed login attempts
    // For now, we'll just log the suspicious activity
    await logSecurityEvent('suspicious_login_activity', { 
      email,
      action: 'multiple_failed_attempts' 
    });
  } catch (error) {
    console.error('Failed to check suspicious activity:', error);
  }
};

// Get client IP helper
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
};

// Enhanced logout with cleanup
export const enhancedLogout = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    await logSecurityEvent('logout', { 
      user_id: user.user?.id 
    });

    // Clear security-related data
    localStorage.removeItem('session_fingerprint');
    localStorage.removeItem('login_timestamp');
    
    // Clear any sensitive cached data
    localStorage.removeItem('premium_status');
    localStorage.removeItem('user_preferences');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

  } catch (error) {
    await logSecurityEvent('logout_error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
};
