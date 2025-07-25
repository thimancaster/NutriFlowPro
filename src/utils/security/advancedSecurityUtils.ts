
import { auditLogService } from '@/services/auditLogService';
import { validatePremiumAccess as validatePremiumAccessUtil } from './premiumSecurityUtils';

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

/**
 * Sanitize search query to prevent injection attacks
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') return '';
  
  // Remove SQL injection patterns
  const sanitized = query
    .replace(/['"`;\\]/g, '') // Remove quotes, semicolons, backslashes
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '') // Remove SQL keywords
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim();
  
  return sanitized.substring(0, 100); // Limit length
};

/**
 * Validate premium access wrapper
 */
export const validatePremiumAccess = async (feature: string): Promise<boolean> => {
  try {
    const result = await validatePremiumAccessUtil('current_user', feature as any);
    return result.canAccess;
  } catch (error) {
    console.error('Premium access validation failed:', error);
    return false;
  }
};

/**
 * Generate session fingerprint for security
 */
export const generateSessionFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Session fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).slice(0, 32);
};

/**
 * Check client-side rate limiting
 */
export const checkRateLimit = (
  identifier: string,
  maxRequests: number,
  windowMs: number
): boolean => {
  const now = Date.now();
  const existing = rateLimitMap.get(identifier);
  
  if (!existing || now - existing.timestamp > windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return true;
  }
  
  if (existing.count >= maxRequests) {
    return false;
  }
  
  existing.count++;
  return true;
};

/**
 * Log security event with enhanced data
 */
export const logSecurityEvent = async (
  eventType: string,
  eventData: any = {}
): Promise<void> => {
  try {
    const enhancedData = {
      ...eventData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      fingerprint: generateSessionFingerprint()
    };

    await auditLogService.logEvent({
      user_id: 'current_user', // This will be replaced with actual user ID
      event_type: eventType,
      event_data: enhancedData
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

/**
 * Validate session integrity
 */
export const validateSessionIntegrity = async (): Promise<boolean> => {
  try {
    const storedFingerprint = localStorage.getItem('session_fingerprint');
    const currentFingerprint = generateSessionFingerprint();
    
    if (!storedFingerprint) {
      localStorage.setItem('session_fingerprint', currentFingerprint);
      return true;
    }
    
    if (storedFingerprint !== currentFingerprint) {
      await logSecurityEvent('session_integrity_failure', {
        stored: storedFingerprint,
        current: currentFingerprint
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating session integrity:', error);
    return false;
  }
};

/**
 * Detect suspicious activity
 */
export const detectSuspiciousActivity = async (userId: string): Promise<boolean> => {
  try {
    // Check for rapid login attempts
    const recentEvents = await auditLogService.getUserEvents(userId, 20);
    const loginAttempts = recentEvents.filter(e => 
      e.event_type === 'login_failed' && 
      new Date(e.created_at).getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (loginAttempts.length > 3) {
      await logSecurityEvent('suspicious_activity_detected', {
        userId,
        reason: 'Multiple failed login attempts',
        count: loginAttempts.length
      });
      return true;
    }
    
    // Check for unusual session patterns
    const sessionFingerprint = localStorage.getItem('session_fingerprint');
    const loginTimestamp = localStorage.getItem('login_timestamp');
    
    if (sessionFingerprint && loginTimestamp) {
      const sessionAge = Date.now() - parseInt(loginTimestamp);
      if (sessionAge > 24 * 60 * 60 * 1000) { // 24 hours
        await logSecurityEvent('suspicious_activity_detected', {
          userId,
          reason: 'Session too old',
          age: sessionAge
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

/**
 * Clear security data on logout
 */
export const clearSecurityData = (): void => {
  localStorage.removeItem('session_fingerprint');
  localStorage.removeItem('login_timestamp');
  localStorage.removeItem('rate_limit_data');
  rateLimitMap.clear();
};
