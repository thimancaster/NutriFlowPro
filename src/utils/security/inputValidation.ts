
import DOMPurify from 'dompurify';

/**
 * Comprehensive input validation and sanitization utilities
 */

// Email validation with strict RFC compliance
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone validation (Brazilian format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
};

// CPF validation with checksum
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Validate checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;
  
  if (digit1 !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;
  
  return digit2 === parseInt(cleanCPF.charAt(10));
};

// Sanitize HTML content to prevent XSS
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  });
};

// Sanitize text input (remove dangerous characters)
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
};

// Validate numeric input with range
export const validateNumeric = (value: any, min = 0, max = Number.MAX_SAFE_INTEGER): boolean => {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) && num >= min && num <= max;
};

// Validate patient data comprehensively
export const validatePatientData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.push('Nome deve ter entre 2 e 100 caracteres');
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.push('Email inválido');
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Telefone inválido (use formato: (XX) XXXXX-XXXX)');
  }
  
  if (data.cpf && !validateCPF(data.cpf)) {
    errors.push('CPF inválido');
  }
  
  if (data.birth_date) {
    const birthDate = new Date(data.birth_date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 0 || age > 120) {
      errors.push('Data de nascimento inválida');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate calculation data
export const validateCalculationData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateNumeric(data.weight, 1, 1000)) {
    errors.push('Peso deve estar entre 1 e 1000 kg');
  }
  
  if (!validateNumeric(data.height, 50, 300)) {
    errors.push('Altura deve estar entre 50 and 300 cm');
  }
  
  if (!validateNumeric(data.age, 0, 120)) {
    errors.push('Idade deve estar entre 0 e 120 anos');
  }
  
  if (!['M', 'F'].includes(data.gender)) {
    errors.push('Gênero inválido');
  }
  
  const validActivityLevels = ['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'];
  if (!validActivityLevels.includes(data.activity_level)) {
    errors.push('Nível de atividade inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting for client-side (backup to server-side)
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

export const checkClientRateLimit = (identifier: string, maxRequests = 10, windowMs = 300000): boolean => {
  const now = Date.now();
  const stored = rateLimitStore.get(identifier);
  
  if (!stored || now - stored.lastReset > windowMs) {
    rateLimitStore.set(identifier, { count: 1, lastReset: now });
    return true;
  }
  
  if (stored.count >= maxRequests) {
    return false;
  }
  
  stored.count++;
  return true;
};
