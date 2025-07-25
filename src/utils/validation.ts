
interface FoodSearchValidation {
  isValid: boolean;
  error?: string;
  sanitizedTerm?: string;
}

export const validateFoodSearch = (searchTerm: string): FoodSearchValidation => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return {
      isValid: false,
      error: 'Search term is required'
    };
  }

  const trimmed = searchTerm.trim();
  
  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Search term must be at least 2 characters long'
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: 'Search term must be less than 100 characters'
    };
  }

  // Basic sanitization
  const sanitizedTerm = trimmed.replace(/[<>]/g, '');

  return {
    isValid: true,
    sanitizedTerm
  };
};
