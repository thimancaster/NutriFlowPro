import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';

/**
 * Enhanced security utility functions
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
 * Enhanced HTML sanitization with stricter rules
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'span', 'div'
    ],
    ALLOWED_ATTR: ['class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'style'],
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style',
      'onmouseout', 'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload'
    ],
    KEEP_CONTENT: false,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false
  };
  
  return DOMPurify.sanitize(html, config);
};

/**
 * Enhanced input sanitization for text content with XSS prevention
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#x60;')
    .trim();
};

/**
 * Enhanced email validation
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (email.length > 320) return false;
  if (email.includes('..')) return false;
  if (email.startsWith('.') || email.endsWith('.')) return false;
  
  return emailRegex.test(email);
};

/**
 * Enhanced password strength validation
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
  
  // Enhanced length check
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  } else if (password.length >= 12) {
    score += 2; // Bonus for longer passwords
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
  
  // Enhanced security checks
  if (/(.)\1{2,}/.test(password)) {
    errors.push('A senha não deve conter caracteres repetidos consecutivos');
    score -= 1;
  }
  
  if (/123|abc|qwe|password|senha/i.test(password)) {
    errors.push('A senha não deve conter sequências óbvias ou palavras comuns');
    score -= 1;
  }
  
  // Check against common passwords
  const commonPasswords = ['12345678', 'password', 'qwerty123', 'admin123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('A senha é muito comum e insegura');
    score -= 2;
  }
  
  return {
    isValid: errors.length === 0 && score >= 4,
    errors,
    score: Math.max(0, score)
  };
};

/**
 * Enhanced rate limiting with exponential backoff
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
    const data = stored ? JSON.parse(stored) : { 
      attempts: 0, 
      resetTime: now + windowMs,
      lastAttempt: 0
    };
    
    // Reset if window has passed
    if (now > data.resetTime) {
      data.attempts = 0;
      data.resetTime = now + windowMs;
    }
    
    // Exponential backoff - increase delay after each failed attempt
    const timeSinceLastAttempt = now - data.lastAttempt;
    const requiredDelay = Math.min(1000 * Math.pow(2, data.attempts), 60000); // Max 1 minute
    
    if (data.attempts > 0 && timeSinceLastAttempt < requiredDelay) {
      return false;
    }
    
    // Check if rate limit exceeded
    if (data.attempts >= maxAttempts) {
      return false;
    }
    
    // Increment attempts
    data.attempts += 1;
    data.lastAttempt = now;
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    return true;
  } catch (error) {
    console.warn('Client rate limit check failed:', error);
    return true; // Allow on error
  }
};

/**
 * Generate secure random string for CSRF tokens
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * CSRF Token Management
 */
export const csrfTokenManager = {
  generate: (): string => {
    const token = generateSecureToken(32);
    sessionStorage.setItem('csrf_token', token);
    return token;
  },
  
  get: (): string | null => {
    return sessionStorage.getItem('csrf_token');
  },
  
  validate: (token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token && token.length === 64;
  },
  
  clear: (): void => {
    sessionStorage.removeItem('csrf_token');
  }
};

/**
 * Enhanced Content Security Policy helper with stricter rules
 */
export const applyCSPHeaders = (): void => {
  if (typeof document !== 'undefined') {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://viacep.com.br",
      "frame-src 'self' https://js.stripe.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    document.head.appendChild(meta);
  }
};

/**
 * Session security enhancements
 */
export const sessionSecurity = {
  // Check if session is about to expire (within 5 minutes)
  isSessionExpiring: (session: any): boolean => {
    if (!session?.expires_at) return false;
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;
    return (expiresAt.getTime() - now.getTime()) < fiveMinutes;
  },
  
  // Generate session fingerprint for additional security
  generateFingerprint: (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('security-fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).slice(0, 32);
  }
};

/**
 * Enhanced input validation with additional security checks
 */
export const inputValidation = {
  cpf: (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    
    // Check for known invalid patterns
    if (/^(\d)\1{10}$/.test(cleaned)) return false;
    
    // Validate CPF algorithm
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cleaned[9]) !== digit1) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cleaned[10]) === digit2;
  },
  
  phone: (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },
  
  name: (name: string): boolean => {
    if (!name || name.trim().length < 2) return false;
    
    // Check for potential XSS patterns
    const xssPatterns = /<script|javascript:|onload=|onerror=/i;
    if (xssPatterns.test(name)) return false;
    
    // Allow only letters, spaces, and common name characters
    return /^[a-zA-ZÀ-ÿ\s\-'\.]+$/.test(name);
  },

  /**
   * Enhanced email validation with additional security checks
   */
  email: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    
    // Check for potential injection patterns
    const injectionPatterns = /[<>'"`;\\]/;
    if (injectionPatterns.test(email)) return false;
    
    return isValidEmail(email);
  },

  /**
   * SQL injection pattern detection
   */
  hasSQLInjection: (input: string): boolean => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /['"`;\\]/,
      /--/,
      /\/\*/,
      /\*\//,
      /xp_/i,
      /sp_/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }
};

/**
 * Apply security headers to requests
 */
export const securityHeaders = {
  /**
   * Get security headers for API requests
   */
  getHeaders: (): Record<string, string> => {
    const token = csrfTokenManager.get();
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      ...(token && { 'X-CSRF-Token': token })
    };
  }
};

/**
 * Security event logging with enhanced data
 */
export const logSecurityEvent = async (
  eventType: string, 
  eventData: Record<string, any> = {},
  sensitive: boolean = false
): Promise<void> => {
  try {
    const sanitizedData = sensitive ? eventData : {
      ...eventData,
      password: undefined,
      token: undefined,
      secret: undefined,
      email: eventData.email ? eventData.email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined
    };
    
    console.log(`Security Event: ${eventType}`, {
      ...sanitizedData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // TODO: Implement database logging once types are updated
  } catch (error) {
    console.warn('Failed to log security event:', error);
  }
};

/**
 * Enhanced security utilities for authentication
 */

// Rate limiting storage key
const RATE_LIMIT_PREFIX = 'rl_';

/**
 * Server-side rate limiting check (client-side implementation)
 * In production, this should be implemented on the server
 */
export const checkServerRateLimit = (action: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const key = `${RATE_LIMIT_PREFIX}${action}`;
  const now = Date.now();
  
  try {
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { attempts: [], lastReset: now };
    
    // Clean old attempts outside the window
    data.attempts = data.attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    // Check if we're over the limit
    if (data.attempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    data.attempts.push(now);
    localStorage.setItem(key, JSON.stringify(data));
    
    return true;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return true; // Allow on error to avoid blocking legitimate users
  }
};

/**
 * Validate professional registration number (CRN)
 */
export const validateCRN = (crn: string): { isValid: boolean; message?: string } => {
  if (!crn || crn.trim().length === 0) {
    return { isValid: true }; // Optional field
  }
  
  // Basic CRN format validation (CRN-X XXXXX)
  const crnRegex = /^CRN-\d+\s+\d{4,6}$/i;
  
  if (!crnRegex.test(crn.trim())) {
    return {
      isValid: false,
      message: "Formato de CRN inválido. Use o formato: CRN-1 12345"
    };
  }
  
  return { isValid: true };
};

/**
 * Validate phone number (Brazilian format)
 */
export const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: true }; // Optional field
  }
  
  // Remove non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Brazilian phone number (10 or 11 digits)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return {
      isValid: false,
      message: "Telefone deve ter 10 ou 11 dígitos"
    };
  }
  
  return { isValid: true };
};
