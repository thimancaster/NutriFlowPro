
export interface ValidationResult {
  isValid: boolean;
  sanitizedTerm?: string;
  sanitizedContent?: string;
  sanitizedData?: any;
  error?: string;
  errors?: Record<string, string>;
}
