
// Re-export utilities from specialized files
export * from './utils/initialState';

// Import from validation file but don't re-export everything to avoid duplicates
import { 
  validateMacroPercentages as validateMacros, 
  validateRequiredFields as validateFields 
} from './utils/validation';

// Export with different names to avoid conflicts
export { validateMacros, validateFields };

// Re-export other utilities that aren't causing conflicts
export * from './utils/calculations';

// This file serves as a central export point for all calculator utilities
