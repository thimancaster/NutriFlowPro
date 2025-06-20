import { ValidationResult } from './types';

export const validateFoodSearch = (searchTerm: string): ValidationResult => {
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
};

export const validateNotes = (content: string): ValidationResult => {
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
};
