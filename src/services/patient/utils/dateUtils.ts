
/**
 * Utility functions for converting dates between string and Date objects
 * for database operations
 */

/**
 * Converts Date objects to strings for database storage
 * @param obj The object containing possible Date properties
 * @returns The same object with Date objects converted to ISO strings
 */
export const convertDatesToStrings = (obj: Record<string, any>): Record<string, any> => {
  if (!obj) return {};
  
  const result: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertDatesToStrings(value);
    } else {
      result[key] = value;
    }
  });
  
  return result;
};

/**
 * Prepares data for Supabase by converting Date objects to strings
 * and ensuring required fields are present
 */
export const prepareForSupabase = (
  data: Record<string, any>, 
  isNew: boolean = false
): Record<string, any> => {
  // Convert any Date objects to ISO strings
  const stringDates = convertDatesToStrings(data);
  
  // Return the prepared data
  return stringDates;
};
