
/**
 * Utility functions for handling dates and preparing data for Supabase
 */

/**
 * Converts Date objects to ISO strings for Supabase
 * @param obj The object containing date fields
 * @param removeId Whether to remove the id field (for inserts)
 * @returns A new object with dates converted to strings
 */
export const prepareForSupabase = (obj: Record<string, any>, removeId: boolean = false): Record<string, any> => {
  if (!obj) return {};
  
  const result: Record<string, any> = { ...obj };
  
  // Convert Date objects to ISO strings
  Object.entries(result).forEach(([key, value]) => {
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      result[key] = value.toISOString();
    }
    
    // Handle nested objects (except arrays that might cause infinite recursion)
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = prepareForSupabase(value, false);
    }
  });
  
  // Remove ID for insert operations if requested
  if (removeId && 'id' in result) {
    delete result.id;
  }
  
  return result;
};

/**
 * Converts dates from strings to Date objects
 * @param obj The object containing date fields as strings
 * @returns A new object with dates as Date objects
 */
export const convertDatesToISOString = (obj: Record<string, any>): Record<string, any> => {
  if (!obj) return {};
  
  const result: Record<string, any> = { ...obj };
  
  // Convert Date objects to ISO strings
  Object.entries(result).forEach(([key, value]) => {
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      result[key] = value.toISOString();
    }
    
    // Handle nested objects (except arrays)
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = convertDatesToISOString(value);
    }
  });
  
  return result;
};
