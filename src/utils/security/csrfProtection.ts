
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
