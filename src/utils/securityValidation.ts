
import { z } from 'zod';

// Simple security validation utilities
export const validateSecureForm = {
  patient: (data: any) => {
    try {
      // Basic sanitization
      const sanitizedData = {
        name: typeof data.name === 'string' ? data.name.trim() : '',
        email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : '',
        phone: typeof data.phone === 'string' ? data.phone.trim() : '',
        secondaryPhone: typeof data.secondaryPhone === 'string' ? data.secondaryPhone.trim() : '',
        cpf: typeof data.cpf === 'string' ? data.cpf.trim() : '',
        sex: data.sex || '',
        objective: typeof data.objective === 'string' ? data.objective.trim() : '',
        profile: typeof data.profile === 'string' ? data.profile.trim() : '',
        address: data.address || {},
        notes: typeof data.notes === 'string' ? data.notes.trim() : '',
        status: data.status || 'active',
        birthDate: data.birthDate
      };

      // Basic validation
      const errors: Record<string, string> = {};

      if (!sanitizedData.name || sanitizedData.name.length < 3) {
        errors.name = 'Nome deve ter pelo menos 3 caracteres';
      }

      if (!sanitizedData.sex || !['M', 'F', 'O'].includes(sanitizedData.sex)) {
        errors.sex = 'Selecione o sexo';
      }

      if (!sanitizedData.objective) {
        errors.objective = 'Objetivo é obrigatório';
      }

      if (!sanitizedData.profile) {
        errors.profile = 'Perfil é obrigatório';
      }

      // Email validation (optional but if provided must be valid)
      if (sanitizedData.email && !sanitizedData.email.includes('@')) {
        errors.email = 'E-mail inválido';
      }

      // Phone validation (if provided)
      const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      if (sanitizedData.phone && !phoneRegex.test(sanitizedData.phone)) {
        errors.phone = 'Telefone inválido: Use o formato (XX) XXXXX-XXXX';
      }

      if (sanitizedData.secondaryPhone && !phoneRegex.test(sanitizedData.secondaryPhone)) {
        errors.secondaryPhone = 'Telefone secundário inválido: Use o formato (XX) XXXXX-XXXX';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData
      };
    } catch (error) {
      console.error('Security validation error:', error);
      return {
        isValid: false,
        errors: { general: 'Erro na validação dos dados' },
        sanitizedData: data
      };
    }
  },

  foodSearch: (searchTerm: string) => {
    try {
      // Basic sanitization for search term
      const sanitizedTerm = typeof searchTerm === 'string' ? searchTerm.trim() : '';
      
      // Basic validation
      if (sanitizedTerm.length === 0) {
        return {
          isValid: false,
          error: 'Termo de busca não pode estar vazio',
          sanitizedTerm: ''
        };
      }

      if (sanitizedTerm.length > 100) {
        return {
          isValid: false,
          error: 'Termo de busca muito longo (máximo 100 caracteres)',
          sanitizedTerm: sanitizedTerm.substring(0, 100)
        };
      }

      // Check for potential malicious content
      const dangerousPatterns = /<script|javascript:|data:|vbscript:|on\w+=/i;
      if (dangerousPatterns.test(sanitizedTerm)) {
        return {
          isValid: false,
          error: 'Termo de busca contém caracteres inválidos',
          sanitizedTerm: ''
        };
      }

      return {
        isValid: true,
        error: null,
        sanitizedTerm
      };
    } catch (error) {
      console.error('Food search validation error:', error);
      return {
        isValid: false,
        error: 'Erro na validação do termo de busca',
        sanitizedTerm: ''
      };
    }
  },

  notes: (content: string) => {
    try {
      // Basic sanitization for notes content
      const sanitizedContent = typeof content === 'string' ? content.trim() : '';
      
      // Basic validation
      if (sanitizedContent.length > 10000) {
        return {
          isValid: false,
          error: 'Conteúdo muito longo (máximo 10.000 caracteres)',
          sanitizedContent: sanitizedContent.substring(0, 10000)
        };
      }

      // Check for potential malicious content (basic XSS prevention)
      const dangerousPatterns = /<script|javascript:|data:|vbscript:|on\w+=/i;
      if (dangerousPatterns.test(sanitizedContent)) {
        return {
          isValid: false,
          error: 'Conteúdo contém caracteres inválidos',
          sanitizedContent: sanitizedContent.replace(dangerousPatterns, '')
        };
      }

      return {
        isValid: true,
        error: null,
        sanitizedContent
      };
    } catch (error) {
      console.error('Notes validation error:', error);
      return {
        isValid: false,
        error: 'Erro na validação do conteúdo',
        sanitizedContent: ''
      };
    }
  }
};

// CSRF and rate limiting utilities
export const csrfProtection = {
  attachToken: (data: any) => {
    // Simple token attachment for demonstration
    return {
      ...data,
      _token: Date.now().toString()
    };
  }
};

export const rateLimiter = {
  checkLimit: (key: string, limit: number, window: number) => {
    // Simple rate limiting check
    const now = Date.now();
    const stored = localStorage.getItem(`rate_limit_${key}`);
    
    if (!stored) {
      localStorage.setItem(`rate_limit_${key}`, JSON.stringify({ count: 1, timestamp: now }));
      return { allowed: true };
    }

    try {
      const { count, timestamp } = JSON.parse(stored);
      
      if (now - timestamp > window) {
        // Reset window
        localStorage.setItem(`rate_limit_${key}`, JSON.stringify({ count: 1, timestamp: now }));
        return { allowed: true };
      }

      if (count >= limit) {
        return { allowed: false };
      }

      localStorage.setItem(`rate_limit_${key}`, JSON.stringify({ count: count + 1, timestamp }));
      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  }
};
