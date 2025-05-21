
/**
 * Utility functions for browser storage operations
 */
export const storageUtils = {
  /**
   * Set an item in local storage with JSON stringification
   */
  setLocalItem: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  },

  /**
   * Get an item from local storage with JSON parsing
   */
  getLocalItem: (key: string): any => {
    if (typeof window === 'undefined') return null;
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) return null;
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  },

  /**
   * Set an item in session storage with JSON stringification
   */
  setSessionItem: (key: string, value: any): void => {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
    }
  },

  /**
   * Get an item from session storage with JSON parsing
   */
  getSessionItem: (key: string): any => {
    if (typeof window === 'undefined') return null;
    try {
      const serialized = sessionStorage.getItem(key);
      if (serialized === null) return null;
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return null;
    }
  },

  /**
   * Remove an item from local storage
   */
  removeLocalItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  },

  /**
   * Remove an item from session storage
   */
  removeSessionItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
    }
  }
};
