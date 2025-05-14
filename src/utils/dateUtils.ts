
/**
 * Converts all Date objects in an object or array to ISO strings
 * Used to prepare data for Supabase which expects string dates
 */
export function convertDatesToISOString(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToISOString(item));
  }
  
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = convertDatesToISOString(obj[key]);
    }
  }
  
  return newObj;
}

/**
 * Prepares an object for Supabase by:
 * 1. Converting Date objects to ISO strings
 * 2. Removing 'id' property if it's used in a condition (for update operations)
 * 3. Optionally filtering out specific properties
 */
export function prepareForSupabase(obj: any, removeId: boolean = false, excludeProps: string[] = []): any {
  // First convert dates
  const dateConverted = convertDatesToISOString(obj);
  
  // Then filter out unwanted properties
  if (removeId || excludeProps.length > 0) {
    const propsToRemove = removeId ? ['id', ...excludeProps] : excludeProps;
    
    if (Array.isArray(dateConverted)) {
      return dateConverted.map(item => {
        if (typeof item === 'object' && item !== null) {
          const filtered: { [key: string]: any } = { ...item };
          propsToRemove.forEach(prop => {
            delete filtered[prop];
          });
          return filtered;
        }
        return item;
      });
    } else if (typeof dateConverted === 'object' && dateConverted !== null) {
      const filtered: { [key: string]: any } = { ...dateConverted };
      propsToRemove.forEach(prop => {
        delete filtered[prop];
      });
      return filtered;
    }
  }
  
  return dateConverted;
}
