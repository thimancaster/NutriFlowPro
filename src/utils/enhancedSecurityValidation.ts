import { validateSecureForm, rateLimiter } from './securityValidation';

// Enhanced security validation with server-side integration
export const enhancedValidateSecureForm = {
  patient: async (data: any, userId?: string) => {
    try {
      // Client-side validation first (fast check)
      const clientValidation = validateSecureForm.patient(data);
      
      if (!clientValidation.isValid) {
        return clientValidation;
      }

      // Server-side validation for critical data
      if (userId) {
        const { validatePatientDataServer } = await import('./serverValidation');
        const serverValidation = await validatePatientDataServer(
          data.name,
          data.email,
          data.phone,
          data.cpf
        );

        if (!serverValidation.isValid) {
          return {
            isValid: false,
            errors: serverValidation.errors,
            sanitizedData: clientValidation.sanitizedData
          };
        }
      }

      return clientValidation;
    } catch (error) {
      console.error('Enhanced validation error:', error);
      return {
        isValid: false,
        errors: { general: 'Erro na validação dos dados' },
        sanitizedData: data
      };
    }
  }
};

// Enhanced rate limiting with server-side tracking
export const enhancedRateLimiter = {
  checkLimit: async (userId: string, action: string, limit: number = 5) => {
    try {
      // Client-side check first
      const clientCheck = rateLimiter.checkLimit(`${userId}_${action}`, limit, 60000);
      
      if (!clientCheck.allowed) {
        // Log security event for rate limiting
        const { logSecurityEvent, SecurityEvents } = await import('./auditLogger');
        await logSecurityEvent(userId, {
          eventType: 'rate_limit_exceeded',
          eventData: { action, limit }
        });
      }
      
      return clientCheck;
    } catch (error) {
      console.error('Enhanced rate limiting error:', error);
      return { allowed: true }; // Allow on error to avoid blocking users
    }
  }
};

// Enhanced CSRF protection with stronger tokens
export const enhancedCsrfProtection = {
  generateToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  attachToken: (data: any) => {
    const token = enhancedCsrfProtection.generateToken();
    sessionStorage.setItem('csrf_token', token);
    
    return {
      ...data,
      _token: token,
      _timestamp: Date.now()
    };
  },

  validateToken: (token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token && token.length === 64;
  }
};
