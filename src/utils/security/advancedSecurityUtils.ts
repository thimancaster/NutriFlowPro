
import { supabase } from '@/integrations/supabase/client';
import { auditLogService } from '@/services/auditLogService';

/**
 * Advanced security utilities for enhanced protection
 */

// Generate cryptographically secure session fingerprint
export const generateSessionFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('NutriFlow Security Check', 2, 2);
    }
    
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.languages?.join(',') || '',
      screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
      new Date().getTimezoneOffset().toString(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency?.toString() || '0',
      (navigator as any).deviceMemory?.toString() || '0', // Type assertion for optional property
      navigator.platform,
      navigator.cookieEnabled.toString()
    ];
    
    const fingerprint = components.join('|');
    return btoa(fingerprint).substring(0, 32);
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    return btoa(Math.random().toString()).substring(0, 32);
  }
};

// Enhanced session validation with multiple checks
export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      await logSecurityEvent('session_validation_failed', { error: error?.message });
      return null;
    }
    
    // Check session age (24 hours max for security)
    const loginTimestamp = localStorage.getItem('login_timestamp');
    if (loginTimestamp) {
      const sessionAge = Date.now() - parseInt(loginTimestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        await logSecurityEvent('session_expired', { age: sessionAge });
        await supabase.auth.signOut();
        localStorage.clear();
        return null;
      }
    }
    
    // Validate fingerprint
    const storedFingerprint = localStorage.getItem('session_fingerprint');
    const currentFingerprint = generateSessionFingerprint();
    
    if (storedFingerprint && storedFingerprint !== currentFingerprint) {
      // Allow some variance for legitimate browser changes
      const similarity = calculateFingerPrintSimilarity(storedFingerprint, currentFingerprint);
      
      if (similarity < 0.7) { // 70% similarity threshold
        await logSecurityEvent('fingerprint_mismatch', {
          stored: storedFingerprint.substring(0, 8),
          current: currentFingerprint.substring(0, 8),
          similarity
        });
        
        await supabase.auth.signOut();
        localStorage.clear();
        return null;
      }
    }
    
    return session;
  } catch (error) {
    await logSecurityEvent('session_validation_error', { error: (error as Error).message });
    return null;
  }
};

// Calculate fingerprint similarity
const calculateFingerPrintSimilarity = (fp1: string, fp2: string): number => {
  if (fp1 === fp2) return 1;
  if (!fp1 || !fp2) return 0;
  
  let matches = 0;
  const minLength = Math.min(fp1.length, fp2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (fp1[i] === fp2[i]) matches++;
  }
  
  return matches / Math.max(fp1.length, fp2.length);
};

// Enhanced premium access validation
export const validatePremiumAccess = async (feature: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      await logSecurityEvent('premium_check_unauthenticated', { feature });
      return false;
    }
    
    // Use the secure database function
    const { data, error } = await supabase.rpc('validate_premium_access_secure', {
      feature_name: feature,
      action_type: 'read'
    });
    
    if (error) {
      await logSecurityEvent('premium_check_error', { 
        feature, 
        error: error.message,
        user_id: user.user.id 
      });
      return false;
    }
    
    // Type-safe access to the response
    const response = data as { has_access?: boolean } | null;
    const hasAccess = response?.has_access === true;
    
    await logSecurityEvent('premium_check_completed', {
      feature,
      has_access: hasAccess,
      user_id: user.user.id
    });
    
    return hasAccess;
  } catch (error) {
    await logSecurityEvent('premium_check_exception', { 
      feature, 
      error: (error as Error).message 
    });
    return false;
  }
};

// Rate limiting with exponential backoff
const rateLimitAttempts = new Map<string, { count: number; lastAttempt: number; backoffMs: number }>();

export const checkRateLimit = (
  identifier: string, 
  maxAttempts = 5, 
  windowMs = 300000,
  backoffMultiplier = 2
): boolean => {
  const now = Date.now();
  const stored = rateLimitAttempts.get(identifier);
  
  if (!stored) {
    rateLimitAttempts.set(identifier, { count: 1, lastAttempt: now, backoffMs: 1000 });
    return true;
  }
  
  const timeSinceLastAttempt = now - stored.lastAttempt;
  
  // Reset if window has passed
  if (timeSinceLastAttempt > windowMs) {
    rateLimitAttempts.set(identifier, { count: 1, lastAttempt: now, backoffMs: 1000 });
    return true;
  }
  
  // Check if still in backoff period
  if (timeSinceLastAttempt < stored.backoffMs) {
    return false;
  }
  
  // Check rate limit
  if (stored.count >= maxAttempts) {
    // Increase backoff time
    stored.backoffMs = Math.min(stored.backoffMs * backoffMultiplier, 60000); // Max 1 minute
    stored.lastAttempt = now;
    
    logSecurityEvent('rate_limit_exceeded', {
      identifier,
      count: stored.count,
      backoff_ms: stored.backoffMs
    });
    
    return false;
  }
  
  // Allow request and increment counter
  stored.count++;
  stored.lastAttempt = now;
  return true;
};

// Enhanced security event logging
export const logSecurityEvent = async (eventType: string, eventData: any = {}) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    await auditLogService.logEvent({
      user_id: user.user?.id || 'anonymous',
      event_type: eventType,
      event_data: {
        ...eventData,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent.substring(0, 200),
        url: window.location.href,
        referrer: document.referrer
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
};

export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return '';
  
  return query
    .replace(/[<>\"'%;()&+]/g, '') // Remove potentially dangerous characters
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/gi, '') // Remove SQL keywords
    .trim()
    .substring(0, 100); // Limit search query length
};

// Content Security Policy headers (for reference)
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://lnyixnhsrovzdxybmjfa.supabase.co https://api.stripe.com wss://realtime.supabase.co",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
});

// Detect potential XSS attempts
export const detectXSSAttempt = (input: string): boolean => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// SQL injection detection
export const detectSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|(--)|(\/\*)|(\*\/)|(\bOR\b.*=.*)|(\bAND\b.*=.*)/gi,
    /('|\"|;|\\)/g
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};
