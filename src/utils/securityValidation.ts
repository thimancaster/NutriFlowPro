
export interface ValidationResult {
  isValid: boolean;
  sanitizedTerm?: string;
  error?: string;
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
  }
};

export const rateLimiter = {
  requests: new Map<string, number[]>(),
  
  checkLimit: (key: string, maxRequests: number, windowMs: number) => {
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
};
