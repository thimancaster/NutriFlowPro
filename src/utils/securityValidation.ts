
import { supabase } from '@/integrations/supabase/client';
import { isValidEmail } from './securityUtils';
import { RateLimiter } from './security/rateLimiter';

const validationRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 validation attempts per minute
  message: 'Too many validation attempts'
});

export const validateUserInput = (input: string, type: 'email' | 'password' | 'name'): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  switch (type) {
    case 'email':
      return isValidEmail(input);
    case 'password':
      return input.length >= 6;
    case 'name':
      return input.trim().length >= 2;
    default:
      return false;
  }
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const checkValidationRateLimit = (identifier: string): boolean => {
  return validationRateLimiter.isAllowed(identifier);
};
