
import { supabase } from '@/integrations/supabase/client';
import { auditLogService } from '@/services/auditLogService';

export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  return query
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;\-]/g, '') // Remove SQL injection characters (fixed regex)
    .trim()
    .substring(0, 100); // Limit length
};

export const validatePremiumAccess = async (userId: string, feature: string): Promise<boolean> => {
  try {
    // Check if user exists first
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return false;
    }

    // For now, return true as we don't have user_subscriptions table
    // This would need to be implemented when the subscription system is ready
    
    // Log access attempt
    await auditLogService.logSecurityEvent({
      user_id: userId,
      event_type: 'premium_access_check',
      event_data: {
        feature,
        hasAccess: true,
        timestamp: new Date().toISOString()
      }
    });

    return true;
  } catch (error) {
    console.error('Error validating premium access:', error);
    return false;
  }
};

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
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).substring(0, 32);
};

export const validateSessionFingerprint = (storedFingerprint: string): boolean => {
  const currentFingerprint = generateSessionFingerprint();
  return storedFingerprint === currentFingerprint;
};

export const rateLimitCheck = (identifier: string, limit: number = 100, windowMs: number = 60000): boolean => {
  const key = `rate_limit_${identifier}`;
  const now = Date.now();
  
  try {
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };
    
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
    } else {
      data.count += 1;
    }
    
    localStorage.setItem(key, JSON.stringify(data));
    
    return data.count <= limit;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }
};

// Export additional functions that are expected by other modules
export const checkRateLimit = rateLimitCheck;

export const logSecurityEvent = async (event: any) => {
  return auditLogService.logSecurityEvent(event);
};
