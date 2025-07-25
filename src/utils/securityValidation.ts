
import { supabase } from '@/integrations/supabase/client';
import { isValidEmail } from './securityUtils';
import { RateLimiter } from './security/rateLimiter';
import { csrfProtection } from './security/csrfProtection';

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

// Export the rate limiter instance
export const rateLimiter = validationRateLimiter;

// Export CSRF protection
export { csrfProtection };

// Secure form validation functions
export const validateSecureForm = {
  patient: (data: any) => {
    const errors: Record<string, string> = {};
    
    if (!data.name || data.name.length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (data.email && !isValidEmail(data.email)) {
      errors.email = 'Email inválido';
    }
    
    if (data.phone && data.phone.length < 10) {
      errors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData: {
        ...data,
        name: sanitizeInput(data.name || ''),
        email: sanitizeInput(data.email || ''),
        phone: sanitizeInput(data.phone || '')
      }
    };
  },
  
  calculation: (data: any) => {
    const errors: Record<string, string> = {};
    
    if (!data.weight || data.weight <= 0) {
      errors.weight = 'Peso deve ser maior que zero';
    }
    
    if (!data.height || data.height <= 0) {
      errors.height = 'Altura deve ser maior que zero';
    }
    
    if (!data.age || data.age <= 0) {
      errors.age = 'Idade deve ser maior que zero';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData: data
    };
  },
  
  mealPlan: (data: any) => {
    const errors: Record<string, string> = {};
    
    if (!data.title || data.title.length < 3) {
      errors.title = 'Título deve ter pelo menos 3 caracteres';
    }
    
    if (!data.meals || !Array.isArray(data.meals) || data.meals.length === 0) {
      errors.meals = 'Deve conter pelo menos uma refeição';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData: {
        ...data,
        title: sanitizeInput(data.title || '')
      }
    };
  },

  notes: (content: string) => {
    const errors: Record<string, string> = {};
    
    if (!content || typeof content !== 'string') {
      errors.content = 'Conteúdo das notas é obrigatório';
    }
    
    if (content && content.length > 10000) {
      errors.content = 'Notas devem ter no máximo 10.000 caracteres';
    }
    
    // Check for potentially dangerous content
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        errors.content = 'Conteúdo contém elementos não permitidos';
        break;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      error: errors.content,
      sanitizedContent: content ? sanitizeInput(content) : ''
    };
  }
};
