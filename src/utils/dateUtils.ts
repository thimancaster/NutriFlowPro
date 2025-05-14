
import { Json } from '@/integrations/supabase/types';

/**
 * Prepares data for Supabase by converting Date objects to strings
 * and ensuring required fields are present
 */
export const prepareForSupabase = (
  data: Record<string, any>, 
  isInsert: boolean = false
): Record<string, any> => {
  if (!data) return {};
  
  // Create a copy to avoid modifying the original
  const result: Record<string, any> = { ...data };
  
  // Remove id for insert operations (let Supabase generate it)
  if (isInsert && result.id) {
    delete result.id;
  }
  
  // Convert Date objects to ISO strings
  Object.keys(result).forEach(key => {
    const value = result[key];
    
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (
      value && 
      typeof value === 'object' && 
      !Array.isArray(value) && 
      !(value instanceof Date) &&
      !(value as Json)
    ) {
      // Recursively handle nested objects
      result[key] = prepareForSupabase(value, false);
    }
  });
  
  return result;
};

/**
 * Converts string dates to Date objects for consistent client-side handling
 */
export const convertStringsToDates = (obj: Record<string, any>): Record<string, any> => {
  if (!obj) return {};
  
  const result: Record<string, any> = { ...obj };
  
  // Date fields that should be converted
  const dateFields = ['created_at', 'updated_at', 'date', 'start_time', 'end_time', 'birth_date', 'subscription_start', 'subscription_end'];
  
  Object.keys(result).forEach(key => {
    const value = result[key];
    
    // Check if this is a date field with a string value that looks like a date
    if (dateFields.includes(key) && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
      result[key] = new Date(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively handle nested objects
      result[key] = convertStringsToDates(value);
    }
  });
  
  return result;
};
