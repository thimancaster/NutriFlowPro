
/**
 * Utility functions for DOM manipulation and management
 */

// Track initialization state
let fancyBoxInitialized = false;
let initializationInProgress = false;

/**
 * Safe initialization for jQuery plugins like FancyBox
 * @param selector CSS selector for elements to apply fancybox to
 * @param options FancyBox options
 */
export const initFancyBox = (selector: string, options = {}) => {
  // Prevent concurrent initialization
  if (initializationInProgress) {
    console.log("FancyBox initialization already in progress, skipping");
    return;
  }
  
  initializationInProgress = true;
  
  try {
    // Ensure jQuery is loaded
    if (typeof window.jQuery === 'undefined') {
      console.warn('jQuery not found - script may not be loaded');
      initializationInProgress = false;
      return;
    }
    
    const $ = window.jQuery;
    
    // Skip if the fancybox object doesn't exist (script not loaded)
    if (typeof $.fancybox === 'undefined') {
      console.warn('FancyBox not found - script may not be loaded');
      initializationInProgress = false;
      return;
    }
    
    // Check if FancyBox was already initialized globally
    if (fancyBoxInitialized) {
      // Try to close any open instances first
      try {
        $.fancybox.close();
      } catch (e) {
        console.log("Error closing previous FancyBox instance, ignoring:", e);
        // Ignore errors when trying to close
      }
    }
  
    // Initialize FancyBox with the given options
    try {
      $(selector).fancybox(options);
      fancyBoxInitialized = true;
      console.log("FancyBox initialized successfully");
    } catch (error) {
      console.error('Error initializing FancyBox:', error);
    }
  } finally {
    // Always reset initialization flag
    initializationInProgress = false;
  }
};

/**
 * Safely destroy a FancyBox instance
 */
export const destroyFancyBox = () => {
  if (typeof window.jQuery !== 'undefined') {
    const $ = window.jQuery;
    if (typeof $.fancybox !== 'undefined' && fancyBoxInitialized) {
      try {
        $.fancybox.close();
        fancyBoxInitialized = false;
        console.log("FancyBox instance destroyed");
      } catch (error) {
        console.error('Error closing FancyBox:', error);
      }
    }
  }
};

/**
 * Check if FancyBox is already initialized
 */
export const isFancyBoxInitialized = (): boolean => {
  return fancyBoxInitialized;
};

/**
 * Type declaration to extend Window interface
 */
declare global {
  interface Window {
    fancyBoxInitialized: boolean;
    jQuery: any;
  }
}
