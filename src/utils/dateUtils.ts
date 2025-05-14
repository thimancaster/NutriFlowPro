
/**
 * Utility functions for date handling and conversion for Supabase
 */

/**
 * Converts Date objects to ISO strings in an object or array recursively
 * This is useful for Supabase which expects string dates
 */
export function convertDatesToISOString(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToISOString(item));
  }
  
  // Handle objects
  const result: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = convertDatesToISOString(obj[key]);
    }
  }
  
  return result;
}

/**
 * Safely parses ISO date strings back to Date objects
 */
export function parseISODate(dateString: string | null | undefined): Date | undefined {
  if (!dateString) return undefined;
  
  try {
    return new Date(dateString);
  } catch (error) {
    console.error("Invalid date string:", dateString);
    return undefined;
  }
}

/**
 * Properly formats a date or date string for Supabase queries
 */
export function formatDateForSupabase(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  
  if (typeof date === 'string') {
    try {
      return new Date(date).toISOString();
    } catch (error) {
      return undefined;
    }
  }
  
  return date.toISOString();
}
