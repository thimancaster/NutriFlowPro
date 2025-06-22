
import { supabase } from "@/integrations/supabase/client";

// Advanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    });
};

// SQL injection protection for search queries
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') return '';
  
  // Remove potentially dangerous SQL patterns
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
    /['";\\]/g
  ];
  
  let sanitized = query.trim();
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.slice(0, 100); // Limit length
};

// Session fingerprinting for additional security
export const generateSessionFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('security-check', 10, 10);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  return btoa(fingerprint).slice(0, 32);
};

// Enhanced premium validation with server-side check
export const validatePremiumAccess = async (feature: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return false;

    // Use existing premium check function
    const { data, error } = await supabase.rpc('check_user_premium_status', {
      user_id: user.user.id
    });

    if (error) {
      console.error('Premium validation error:', error);
      return false;
    }

    // Log the premium access attempt
    console.log(`Premium access check for feature: ${feature}`, { granted: !!data });
    
    return !!data;
  } catch (error) {
    console.error('Premium access validation failed:', error);
    return false;
  }
};

// Rate limiting helper
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now - record.lastReset > windowMs) {
    rateLimitStore.set(identifier, { count: 1, lastReset: now });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

// Security event logging - simplified version using console for now
export const logSecurityEvent = async (
  event: string, 
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    // For now, log to console until security_audit_log table is created
    console.log('Security Event:', {
      user_id: user.user?.id || null,
      event_type: event,
      details: details,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Get client IP (simplified)
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
};
