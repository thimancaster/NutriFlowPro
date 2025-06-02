
import { sanitizeHtml, sanitizeInput, isValidEmail, inputValidation } from './securityUtils';

/**
 * Enhanced form validation with security focus
 */
export const validateSecureForm = {
  /**
   * Validate and sanitize patient form data
   */
  patient: (data: any) => {
    const errors: Record<string, string> = {};
    const sanitizedData: any = {};

    // Sanitize and validate name
    if (!data.name?.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (!inputValidation.name(data.name)) {
      errors.name = 'Nome deve conter apenas letras e ter pelo menos 2 caracteres';
    } else {
      sanitizedData.name = sanitizeInput(data.name);
    }

    // Validate and sanitize email
    if (data.email && !isValidEmail(data.email)) {
      errors.email = 'Email inválido';
    } else if (data.email) {
      sanitizedData.email = sanitizeInput(data.email);
    }

    // Validate and sanitize phone
    if (data.phone && !inputValidation.phone(data.phone)) {
      errors.phone = 'Telefone inválido';
    } else if (data.phone) {
      sanitizedData.phone = sanitizeInput(data.phone);
    }

    // Validate and sanitize CPF
    if (data.cpf && !inputValidation.cpf(data.cpf)) {
      errors.cpf = 'CPF inválido';
    } else if (data.cpf) {
      sanitizedData.cpf = sanitizeInput(data.cpf);
    }

    // Sanitize notes and other text fields
    if (data.notes) {
      sanitizedData.notes = sanitizeHtml(data.notes);
    }

    // Sanitize address fields
    if (data.address) {
      sanitizedData.address = {
        street: data.address.street ? sanitizeInput(data.address.street) : '',
        number: data.address.number ? sanitizeInput(data.address.number) : '',
        complement: data.address.complement ? sanitizeInput(data.address.complement) : '',
        neighborhood: data.address.neighborhood ? sanitizeInput(data.address.neighborhood) : '',
        city: data.address.city ? sanitizeInput(data.address.city) : '',
        state: data.address.state ? sanitizeInput(data.address.state) : '',
        cep: data.address.cep ? sanitizeInput(data.address.cep) : ''
      };
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData: { ...data, ...sanitizedData }
    };
  },

  /**
   * Validate and sanitize food search input
   */
  foodSearch: (searchTerm: string) => {
    if (!searchTerm?.trim()) {
      return {
        isValid: false,
        error: 'Termo de busca é obrigatório',
        sanitizedTerm: ''
      };
    }

    // Prevent SQL injection patterns
    const dangerousPatterns = /['"`;\\]/g;
    if (dangerousPatterns.test(searchTerm)) {
      return {
        isValid: false,
        error: 'Termo de busca contém caracteres inválidos',
        sanitizedTerm: ''
      };
    }

    // Limit length to prevent DoS
    if (searchTerm.length > 100) {
      return {
        isValid: false,
        error: 'Termo de busca muito longo',
        sanitizedTerm: ''
      };
    }

    return {
      isValid: true,
      error: null,
      sanitizedTerm: sanitizeInput(searchTerm.trim())
    };
  },

  /**
   * Validate and sanitize notes/textarea content
   */
  notes: (content: string) => {
    if (!content) {
      return {
        isValid: true,
        sanitizedContent: ''
      };
    }

    // Limit length
    if (content.length > 10000) {
      return {
        isValid: false,
        error: 'Conteúdo muito longo (máximo 10.000 caracteres)',
        sanitizedContent: ''
      };
    }

    return {
      isValid: true,
      error: null,
      sanitizedContent: sanitizeHtml(content)
    };
  }
};

/**
 * CSRF Token management for forms
 */
export const csrfProtection = {
  /**
   * Generate and attach CSRF token to form data
   */
  attachToken: (formData: any) => {
    const token = sessionStorage.getItem('csrf_token') || generateSecureToken();
    sessionStorage.setItem('csrf_token', token);
    
    return {
      ...formData,
      _csrf: token
    };
  },

  /**
   * Validate CSRF token
   */
  validateToken: (token: string) => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token && token.length >= 32;
  }
};

/**
 * Generate secure random token
 */
function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Rate limiting for sensitive operations
 */
export const rateLimiter = {
  /**
   * Check if operation is rate limited
   */
  checkLimit: (key: string, maxAttempts: number = 5, windowMs: number = 60000) => {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    
    try {
      const stored = localStorage.getItem(storageKey);
      const data = stored ? JSON.parse(stored) : { attempts: 0, resetTime: now + windowMs };
      
      // Reset if window expired
      if (now > data.resetTime) {
        data.attempts = 0;
        data.resetTime = now + windowMs;
      }
      
      // Check limit
      if (data.attempts >= maxAttempts) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: data.resetTime
        };
      }
      
      // Increment attempts
      data.attempts += 1;
      localStorage.setItem(storageKey, JSON.stringify(data));
      
      return {
        allowed: true,
        remaining: maxAttempts - data.attempts,
        resetTime: data.resetTime
      };
    } catch (error) {
      console.warn('Rate limiter error:', error);
      return { allowed: true, remaining: maxAttempts, resetTime: now + windowMs };
    }
  }
};
