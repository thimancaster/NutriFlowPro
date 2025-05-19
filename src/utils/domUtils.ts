
/**
 * Utility functions for DOM manipulation and management
 */

/**
 * Safe initialization for jQuery plugins like FancyBox
 * @param selector CSS selector for elements to apply fancybox to
 * @param options FancyBox options
 */
export const initFancyBox = (selector: string, options = {}) => {
  // Skip if the fancybox object doesn't exist (script not loaded)
  if (typeof $.fancybox === 'undefined') {
    console.warn('FancyBox not found - script may not be loaded');
    return;
  }
  
  // Check if FancyBox was already initialized globally
  if (window.fancyBoxInitialized) {
    // Try to close any open instances first
    try {
      $.fancybox.close();
    } catch (e) {
      // Ignore errors when trying to close
    }
  }

  // Mark FancyBox as initialized
  window.fancyBoxInitialized = true;

  // Initialize FancyBox with the given options
  try {
    $(selector).fancybox(options);
  } catch (error) {
    console.error('Error initializing FancyBox:', error);
  }
};

/**
 * Safely destroy a FancyBox instance
 */
export const destroyFancyBox = () => {
  if (typeof $.fancybox !== 'undefined' && window.fancyBoxInitialized) {
    try {
      $.fancybox.close();
      window.fancyBoxInitialized = false;
    } catch (error) {
      console.error('Error closing FancyBox:', error);
    }
  }
};

/**
 * Type declaration to extend Window interface
 */
declare global {
  interface Window {
    fancyBoxInitialized: boolean;
  }
}
