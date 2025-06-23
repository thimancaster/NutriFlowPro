
import { supabase } from "@/integrations/supabase/client";
import { generateSessionFingerprint, logSecurityEvent, checkRateLimit } from "@/utils/security/advancedSecurityUtils";
import { auditLogService } from "@/services/auditLogService";

// Enhanced login with security features
export const enhancedLogin = async (email: string, password: string) => {
  const fingerprint = generateSessionFingerprint();
  const clientIP = await getClientIP();
  
  // Rate limiting for login attempts
  if (!checkRateLimit(`login_${email}`, 5, 300000)) { // 5 attempts per 5 minutes
    await auditLogService.logEvent({
      user_id: 'anonymous',
      event_type: 'login_rate_limit',
      event_data: { email, ip: clientIP }
    });
    throw new Error('Muitas tentativas de login. Tente novamente em 5 minutos.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      await auditLogService.logLoginAttempt('anonymous', email, false, error.message);
      
      // Check for suspicious activity
      if (error.message.includes('Invalid login credentials')) {
        await checkSuspiciousActivity(email);
      }
      
      throw error;
    }

    if (data.user) {
      // Store session fingerprint
      localStorage.setItem('session_fingerprint', fingerprint);
      localStorage.setItem('login_timestamp', Date.now().toString());

      await auditLogService.logLoginAttempt(data.user.id, email, true);
    }

    return data;
  } catch (error) {
    await auditLogService.logEvent({
      user_id: 'anonymous',
      event_type: 'login_exception',
      event_data: {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: clientIP
      }
    });
    throw error;
  }
};

// Enhanced session validation
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      await auditLogService.logEvent({
        user_id: 'anonymous',
        event_type: 'session_validation_error',
        event_data: { error: error.message }
      });
      return null;
    }

    if (!session) {
      return null;
    }

    // Check session fingerprint
    const storedFingerprint = localStorage.getItem('session_fingerprint');
    const currentFingerprint = generateSessionFingerprint();
    
    if (storedFingerprint && storedFingerprint !== currentFingerprint) {
      await auditLogService.logEvent({
        user_id: session.user.id,
        event_type: 'session_fingerprint_mismatch',
        event_data: {}
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
        await auditLogService.logEvent({
          user_id: session.user.id,
          event_type: 'session_expired',
          event_data: {}
        });
        await supabase.auth.signOut();
        localStorage.removeItem('session_fingerprint');
        localStorage.removeItem('login_timestamp');
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    return session;
  } catch (error) {
    await auditLogService.logEvent({
      user_id: 'anonymous',
      event_type: 'session_validation_exception',
      event_data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    throw error;
  }
};

// Check for suspicious login activity
const checkSuspiciousActivity = async (email: string) => {
  try {
    await auditLogService.logEvent({
      user_id: 'anonymous',
      event_type: 'suspicious_login_activity',
      event_data: {
        email,
        action: 'multiple_failed_attempts'
      }
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
    
    if (user.user) {
      await auditLogService.logEvent({
        user_id: user.user.id,
        event_type: 'logout',
        event_data: {}
      });
    }

    // Clear security-related data
    localStorage.removeItem('session_fingerprint');
    localStorage.removeItem('login_timestamp');
    
    // Clear any sensitive cached data
    localStorage.removeItem('premium_status');
    localStorage.removeItem('user_preferences');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

  } catch (error) {
    await auditLogService.logEvent({
      user_id: 'anonymous',
      event_type: 'logout_error',
      event_data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    throw error;
  }
};
