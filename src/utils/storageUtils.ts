
/**
 * Utils for handling local and session storage
 * with proper error handling and type safety
 */
export const storageUtils = {
  /**
   * Set item to localStorage with error handling
   */
  setLocalItem: (key: string, value: any) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (err) {
      console.error(`Error setting localStorage item "${key}":`, err);
    }
  },
  
  /**
   * Get item from localStorage with error handling
   */
  getLocalItem: (key: string) => {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue);
    } catch (err) {
      console.error(`Error getting localStorage item "${key}":`, err);
      return null;
    }
  },
  
  /**
   * Set item to sessionStorage with error handling
   */
  setSessionItem: (key: string, value: any) => {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (err) {
      console.error(`Error setting sessionStorage item "${key}":`, err);
    }
  },
  
  /**
   * Get item from sessionStorage with error handling
   */
  getSessionItem: (key: string) => {
    try {
      const serializedValue = sessionStorage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue);
    } catch (err) {
      console.error(`Error getting sessionStorage item "${key}":`, err);
      return null;
    }
  },
  
  /**
   * Remove item from localStorage
   */
  removeLocalItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Error removing localStorage item "${key}":`, err);
    }
  },
  
  /**
   * Remove item from sessionStorage
   */
  removeSessionItem: (key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch (err) {
      console.error(`Error removing sessionStorage item "${key}":`, err);
    }
  },

  /**
   * Get all localStorage keys
   */
  getAllLocalStorageKeys: (): string[] => {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
    } catch (err) {
      console.error(`Error getting all localStorage keys:`, err);
    }
    return keys;
  }
};
