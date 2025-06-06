export interface ValidationResult {
  isValid: boolean;
  sanitizedTerm?: string;
  sanitizedContent?: string;
  sanitizedData?: any;
  error?: string;
  errors?: Record<string, string>;
}

export const validateSecureForm = {
  foodSearch: (searchTerm: string): ValidationResult => {
    // Basic validation
    if (!searchTerm) {
      return { isValid: false, error: 'Termo de busca não pode estar vazio' };
    }

    if (searchTerm.length > 100) {
      return { isValid: false, error: 'Termo de busca muito longo' };
    }

    // Remove potentially dangerous characters
    const sanitized = searchTerm.replace(/[<>\"'%;()&+]/g, '');
    
    // Check for SQL injection patterns
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i;
    if (sqlPatterns.test(sanitized)) {
      return { isValid: false, error: 'Termo de busca contém caracteres não permitidos' };
    }

    return { isValid: true, sanitizedTerm: sanitized.trim() };
  },

  notes: (content: string): ValidationResult => {
    // Basic validation for notes content
    if (!content) {
      return { isValid: true, sanitizedContent: '' };
    }

    if (content.length > 10000) {
      return { isValid: false, error: 'Conteúdo muito longo (máximo 10.000 caracteres)' };
    }

    // Remove potentially dangerous HTML/script tags but keep line breaks
    const sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    return { isValid: true, sanitizedContent: sanitized };
  },

  patient: (patientData: any): ValidationResult => {
    const errors: Record<string, string> = {};
    const sanitizedData: any = {};

    // Validate and sanitize name
    if (!patientData.name || patientData.name.trim().length === 0) {
      errors.name = 'Nome é obrigatório';
    } else if (patientData.name.length > 100) {
      errors.name = 'Nome muito longo';
    } else {
      sanitizedData.name = patientData.name.trim().replace(/[<>\"'%;()&+]/g, '');
    }

    // Validate email if provided
    if (patientData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientData.email)) {
        errors.email = 'Email inválido';
      } else {
        sanitizedData.email = patientData.email.trim().toLowerCase();
      }
    }

    // Validate phone if provided
    if (patientData.phone) {
      const phoneRegex = /^[\d\s\-\(\)\+]+$/;
      if (!phoneRegex.test(patientData.phone)) {
        errors.phone = 'Telefone inválido';
      } else {
        sanitizedData.phone = patientData.phone.replace(/[^\d]/g, '');
      }
    }

    // Validate CPF if provided
    if (patientData.cpf) {
      const cpfRegex = /^\d{11}$/;
      const cleanCpf = patientData.cpf.replace(/[^\d]/g, '');
      if (!cpfRegex.test(cleanCpf)) {
        errors.cpf = 'CPF inválido';
      } else {
        sanitizedData.cpf = cleanCpf;
      }
    }

    // Validate gender
    if (patientData.sex) {
      if (!['M', 'F', 'O'].includes(patientData.sex)) {
        errors.sex = 'Sexo inválido';
      } else {
        sanitizedData.sex = patientData.sex;
      }
    }

    // Validate objectives
    if (patientData.objective) {
      const validObjectives = ['emagrecimento', 'manutenção', 'hipertrofia', 'saúde', 'desempenho'];
      if (!validObjectives.includes(patientData.objective)) {
        errors.objective = 'Objetivo inválido';
      } else {
        sanitizedData.objective = patientData.objective;
      }
    }

    // Validate profile
    if (patientData.profile) {
      const validProfiles = ['eutrofico', 'sobrepeso_obesidade', 'atleta'];
      if (!validProfiles.includes(patientData.profile)) {
        errors.profile = 'Perfil inválido';
      } else {
        sanitizedData.profile = patientData.profile;
      }
    }

    // Validate address
    if (patientData.address) {
      sanitizedData.address = {};
      for (const [key, value] of Object.entries(patientData.address)) {
        if (typeof value === 'string' && value.length > 0) {
          sanitizedData.address[key] = (value as string).trim().replace(/[<>\"'%;()&+]/g, '');
        }
      }
    }

    // Copy other safe fields
    if (patientData.secondaryPhone) {
      sanitizedData.secondaryPhone = patientData.secondaryPhone.replace(/[^\d]/g, '');
    }
    if (patientData.status) {
      sanitizedData.status = patientData.status;
    }
    if (patientData.birthDate) {
      sanitizedData.birthDate = patientData.birthDate;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }
};

class RateLimiter {
  private requests = new Map<string, number[]>();
  
  checkLimit(key: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return { allowed: false, retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000) };
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return { allowed: true };
  }
}

export const rateLimiter = new RateLimiter();

export const csrfProtection = {
  generateToken: (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },
  
  attachToken: <T extends object>(data: T): T & { _csrf: string } => {
    return {
      ...data,
      _csrf: csrfProtection.generateToken()
    };
  },
  
  validateToken: (token: string): boolean => {
    // Basic token validation - in production this would be more sophisticated
    return typeof token === 'string' && token.length > 10;
  }
};
