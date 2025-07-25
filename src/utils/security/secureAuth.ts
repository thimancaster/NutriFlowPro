
import { supabase } from '@/integrations/supabase/client';
import { auditLogService } from '@/services/auditLogService';
import { isValidEmail } from '@/utils/securityUtils';
import { RateLimiter } from './rateLimiter';

interface AuthResult {
  success: boolean;
  error?: Error;
  data?: any;
}

const loginRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute
  message: 'Too many login attempts, please try again after 1 minute'
});

export const secureLogin = async (email: string, password: string): Promise<AuthResult> => {
  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      error: new Error('Invalid email address')
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: new Error('Password must be at least 6 characters')
    };
  }

  const checkResult = loginRateLimiter.isAllowed(email);

  if (!checkResult) {
    await auditLogService.logRateLimit(email, false);
    return {
      success: false,
      error: new Error('Rate limit exceeded')
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      await auditLogService.logLoginAttempt(email, false, {
        error: error.message
      });
      return {
        success: false,
        error: new Error(error.message)
      };
    }

    await auditLogService.logLoginAttempt(email, true);
    return { 
      success: true, 
      data: { session: data.session, user: data.user } 
    };

  } catch (err: any) {
    await auditLogService.logLoginAttempt(email, false, {
      error: err.message
    });
    return {
      success: false,
      error: new Error(err.message)
    };
  }
};

export const secureSignup = async (email: string, password: string, name: string): Promise<AuthResult> => {
  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      error: new Error('Invalid email address')
    };
  }

  if (!password || password.length < 6) {
    return {
      success: false,
      error: new Error('Password must be at least 6 characters')
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
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
      return {
        success: false,
        error: new Error(error.message)
      };
    }

    await auditLogService.logLoginAttempt(email, true);
    return { 
      success: true, 
      data: { session: data.session, user: data.user } 
    };

  } catch (err: any) {
    await auditLogService.logLoginAttempt(email, false, {
      error: err.message
    });
    return {
      success: false,
      error: new Error(err.message)
    };
  }
};

export const secureLogout = async (): Promise<AuthResult> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        error: new Error(error.message)
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: new Error(err.message)
    };
  }
};

export const secureOAuthLogin = async (provider: 'google'): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      }
    });

    if (error) {
      await auditLogService.logLoginAttempt(provider, false, {
        error: error.message
      });
      return {
        success: false,
        error: new Error(error.message)
      };
    }

    await auditLogService.logLoginAttempt(provider, true);
    return { success: true };

  } catch (err: any) {
    await auditLogService.logLoginAttempt(provider, false, {
      error: err.message
    });
    return {
      success: false,
      error: new Error(err.message)
    };
  }
};

export const validateSessionIntegrity = async (): Promise<boolean> => {
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

export const detectSuspiciousActivity = async (userId: string): Promise<boolean> => {
  try {
    // Check for multiple rapid login attempts
    const events = await auditLogService.getUserEvents(userId, 10);
    const failedAttempts = events.filter(e => e.event_type === 'login_failed');
    
    // If more than 3 failed attempts in last 5 minutes, consider suspicious
    const recentFailures = failedAttempts.filter(e => {
      const eventTime = new Date(e.created_at).getTime();
      const now = Date.now();
      return (now - eventTime) < 5 * 60 * 1000; // 5 minutes
    });

    return recentFailures.length > 3;
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return false;
  }
};
