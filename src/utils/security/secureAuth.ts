
import { supabase } from '@/integrations/supabase/client';
import { auditLogService } from '@/services/auditLogService';

/**
 * Enhanced authentication security utilities
 */

// Generate secure session fingerprint
export const generateSecureFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Security fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || 'unknown',
    (navigator as any).deviceMemory || 'unknown' // Type assertion for optional property
  ].join('|');
  
  return btoa(fingerprint).substring(0, 32);
};

// Validate session integrity
export const validateSessionIntegrity = async (): Promise<boolean> => {
  try {
    const storedFingerprint = localStorage.getItem('session_fingerprint');
    const currentFingerprint = generateSecureFingerprint();
    
    if (!storedFingerprint) {
      localStorage.setItem('session_fingerprint', currentFingerprint);
      return true;
    }
    
    // Allow for minor fingerprint variations
    const similarity = calculateSimilarity(storedFingerprint, currentFingerprint);
    const isValid = similarity > 0.8; // 80% similarity threshold
    
    if (!isValid) {
      await auditLogService.logEvent({
        user_id: 'anonymous',
        event_type: 'session_fingerprint_mismatch',
        event_data: {
          stored: storedFingerprint.substring(0, 8),
          current: currentFingerprint.substring(0, 8),
          similarity
        }
      });
    }
    
    return isValid;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

// Calculate similarity between fingerprints
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

// Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Enhanced login with security checks
export const secureLogin = async (email: string, password: string, remember = false) => {
  try {
    // Validate session fingerprint before login
    const sessionValid = await validateSessionIntegrity();
    if (!sessionValid) {
      throw new Error('Sessão comprometida detectada. Limpe o cache do navegador e tente novamente.');
    }
    
    // Rate limiting check
    const loginAttemptKey = `login_${email}`;
    const rateLimitPassed = await checkRateLimit(loginAttemptKey);
    if (!rateLimitPassed) {
      throw new Error('Muitas tentativas de login. Tente novamente em alguns minutos.');
    }
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      await auditLogService.logLoginAttempt('unknown', email, false, error.message);
      throw error;
    }
    
    if (data.user) {
      // Store session fingerprint and settings
      const fingerprint = generateSecureFingerprint();
      localStorage.setItem('session_fingerprint', fingerprint);
      localStorage.setItem('login_timestamp', Date.now().toString());
      
      if (remember) {
        localStorage.setItem('remember_me', 'true');
      }
      
      await auditLogService.logLoginAttempt(data.user.id, email, true);
    }
    
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error };
  }
};

// Rate limiting implementation
const rateLimitChecks = new Map<string, { count: number; lastCheck: number }>();

const checkRateLimit = async (identifier: string, maxAttempts = 5, windowMs = 300000): Promise<boolean> => {
  const now = Date.now();
  const stored = rateLimitChecks.get(identifier);
  
  if (!stored || now - stored.lastCheck > windowMs) {
    rateLimitChecks.set(identifier, { count: 1, lastCheck: now });
    return true;
  }
  
  if (stored.count >= maxAttempts) {
    await auditLogService.logRateLimit('unknown', identifier, stored.count);
    return false;
  }
  
  stored.count++;
  return true;
};

// Secure logout with cleanup
export const secureLogout = async () => {
  try {
    // Get current user for logging
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      await auditLogService.logEvent({
        user_id: user.user.id,
        event_type: 'secure_logout',
        event_data: { timestamp: new Date().toISOString() }
      });
    }
    
    // Clear all security-related data
    localStorage.removeItem('session_fingerprint');
    localStorage.removeItem('login_timestamp');
    localStorage.removeItem('remember_me');
    localStorage.removeItem('premium_status');
    
    // Clear any cached sensitive data
    sessionStorage.clear();
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error };
  }
};

// Check for suspicious activity patterns
export const detectSuspiciousActivity = async (userId: string): Promise<boolean> => {
  try {
    // Check for rapid successive logins from different IPs
    // Check for unusual access patterns
    // This is a placeholder for more sophisticated detection
    
    const recentEvents = await supabase
      .from('security_audit_log')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(20);
    
    if (recentEvents.data) {
      // Simple heuristic: too many failed login attempts
      const failedLogins = recentEvents.data.filter(
        event => event.event_type === 'login_failed'
      ).length;
      
      if (failedLogins > 10) {
        await auditLogService.logEvent({
          user_id: userId,
          event_type: 'suspicious_activity_detected',
          event_data: {
            reason: 'excessive_failed_logins',
            count: failedLogins
          }
        });
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return false;
  }
};
