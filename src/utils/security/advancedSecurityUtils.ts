
import { supabase } from '@/integrations/supabase/client';
import { auditLogService } from '@/services/auditLogService';

export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  return query
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;--]/g, '') // Remove SQL injection characters
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

    // Check user subscription status
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error checking subscription:', error);
      return false;
    }

    // Log access attempt
    await auditLogService.logSecurityEvent({
      user_id: userId,
      event_type: 'premium_access_check',
      event_data: {
        feature,
        hasAccess: !!subscription,
        timestamp: new Date().toISOString()
      }
    });

    return !!subscription;
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
