
/**
 * Utility functions for interacting with browser storage
 */
export const storageUtils = {
  /**
   * Get an item from sessionStorage and parse it as JSON
   */
  getSessionItem: <T>(key: string): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from sessionStorage:`, error);
      return null;
    }
  },

  /**
   * Set an item in sessionStorage as JSON
   */
  setSessionItem: <T>(key: string, value: T): void => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in sessionStorage:`, error);
    }
  },

  /**
   * Remove an item from sessionStorage
   */
  removeSessionItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from sessionStorage:`, error);
    }
  },

  /**
   * Get an item from localStorage and parse it as JSON
   */
  getLocalItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return null;
    }
  },

  /**
   * Set an item in localStorage as JSON
   */
  setLocalItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
    }
  },

  /**
   * Remove an item from localStorage
   */
  removeLocalItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
    }
  },
};
