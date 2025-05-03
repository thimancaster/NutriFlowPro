
/**
 * Utility functions for working with browser storage
 */

// Helper for type-safe storage operations
export const storageUtils = {
  // Local Storage
  setLocalItem: <T>(key: string, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  },

  getLocalItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  },

  removeLocalItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  },

  // Session Storage
  setSessionItem: <T>(key: string, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
    }
  },

  getSessionItem: <T>(key: string): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return null;
    }
  },

  removeSessionItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
    }
  },
  
  // Clear all storage
  clearAll: (): void => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};
