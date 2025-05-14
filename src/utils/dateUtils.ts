
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

/**
 * Prepares data for Supabase by converting dates to ISO strings and optionally removing ID
 * @param data Object with data to prepare
 * @param removeId Whether to remove the id property (useful for inserts)
 */
export function prepareForSupabase<T extends Record<string, any>>(data: T, removeId: boolean = false): Omit<T, 'id'> | T {
  // First convert all dates to ISO strings
  const processed = convertDatesToISOString(data);
  
  // Then remove ID if requested (typically for insert operations)
  if (removeId && 'id' in processed) {
    const { id, ...rest } = processed;
    return rest as Omit<T, 'id'>;
  }
  
  return processed;
}
