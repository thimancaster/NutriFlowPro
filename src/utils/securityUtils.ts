
import { supabase } from '@/integrations/supabase/client';

/**
 * Security utility functions
 */

/**
 * Check if current user is admin (simplified version until types are updated)
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Check for developer emails
    const developerEmails = ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'];
    if (developerEmails.includes(user.email || '')) {
      return true;
    }
    
    // Check subscriber role
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    return subscriber?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Log security events with standardized format (console logging for now)
 */
export const logSecurityEvent = async (
  eventType: string, 
  eventData: Record<string, any> = {},
  sensitive: boolean = false
): Promise<void> => {
  try {
    // Filter sensitive data if not in sensitive mode
    const sanitizedData = sensitive ? eventData : {
      ...eventData,
      // Remove potentially sensitive fields
      password: undefined,
      token: undefined,
      secret: undefined,
    };
    
    console.log(`Security Event: ${eventType}`, sanitizedData);
    // TODO: Implement database logging once types are updated
  } catch (error) {
    console.warn('Failed to log security event:', error);
  }
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format with enhanced security
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Enhanced email regex that prevents common injection attempts
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Additional security checks
  if (email.length > 320) return false; // RFC 5321 limit
  if (email.includes('..')) return false; // Consecutive dots
  if (email.startsWith('.') || email.endsWith('.')) return false; // Leading/trailing dots
  
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} => {
  const errors: string[] = [];
  let score = 0;
  
  if (!password) {
    return { isValid: false, errors: ['A senha é obrigatória'], score: 0 };
  }
  
  // Length check
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  } else {
    score += 1;
  }
  
  // Character variety checks
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  } else {
    score += 1;
  }
  
  if (!/\d/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  } else {
    score += 1;
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  } else {
    score += 1;
  }
  
  // Common patterns check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('A senha não deve conter caracteres repetidos consecutivos');
    score -= 1;
  }
  
  // Sequential patterns
  if (/123|abc|qwe/i.test(password)) {
    errors.push('A senha não deve conter sequências óbvias');
    score -= 1;
  }
  
  return {
    isValid: errors.length === 0 && score >= 3,
    errors,
    score: Math.max(0, score)
  };
};

/**
 * Rate limiting utility (client-side helper)
 */
export const checkClientRateLimit = (
  key: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000
): boolean => {
  const now = Date.now();
  const storageKey = `rate_limit_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    const data = stored ? JSON.parse(stored) : { attempts: 0, resetTime: now + windowMs };
    
    // Reset if window has passed
    if (now > data.resetTime) {
      data.attempts = 0;
      data.resetTime = now + windowMs;
    }
    
    // Check if rate limit exceeded
    if (data.attempts >= maxAttempts) {
      return false;
    }
    
    // Increment attempts
    data.attempts += 1;
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    return true;
  } catch (error) {
    console.warn('Client rate limit check failed:', error);
    return true; // Allow on error
  }
};

/**
 * Generate secure random string
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
