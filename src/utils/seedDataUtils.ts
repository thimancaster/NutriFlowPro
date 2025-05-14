
import { supabase } from '@/integrations/supabase/client';
import { seedTestimonials as seedTestimonialsData } from './seedTestimonials';
import { logger } from './logger';

// Flag to track if testimonials have been initialized in the current session
let testimonialsInitialized = false;

/**
 * Check if testimonials already exist in the database
 */
const checkTestimonialsExist = async (): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      throw error;
    }
    
    return (count || 0) > 0;
  } catch (error) {
    logger.error('Error checking testimonials:', error);
    return false;
  }
}

/**
 * Initialize testimonials in development mode if they don't exist
 * This function is optimized to:
 * 1. Only run in development mode
 * 2. Check if testimonials already exist before trying to create them
 * 3. Only try to initialize testimonials once per session
 */
export const initializeTestimonials = async (): Promise<void> => {
  // Skip if not in development or already initialized in this session
  if (process.env.NODE_ENV !== 'development' || testimonialsInitialized) {
    return;
  }
  
  try {
    // Mark as initialized to prevent multiple attempts in the same session
    testimonialsInitialized = true;
    
    // Check if testimonials already exist
    const testimonialsExist = await checkTestimonialsExist();
    
    if (testimonialsExist) {
      logger.info('Testimonials already exist, skipping initialization');
      return;
    }
    
    // If no testimonials exist, seed them
    logger.info('No testimonials found, seeding initial data');
    await seedTestimonialsData();
    logger.info('Testimonials seeded successfully');
  } catch (error) {
    logger.error('Error initializing testimonials:', error);
  }
};

/**
 * Reset testimonials (for development/testing use only)
 * This will delete all testimonials and re-seed them
 */
export const resetTestimonials = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    logger.warn('resetTestimonials called in production - operation not allowed');
    return;
  }
  
  try {
    // Delete all existing testimonials
    const { error: deleteError } = await supabase
      .from('testimonials')
      .delete()
      .not('id', 'is', null);
      
    if (deleteError) {
      throw deleteError;
    }
    
    // Reset the initialized flag
    testimonialsInitialized = false;
    
    // Re-seed testimonials
    await seedTestimonialsData();
    logger.info('Testimonials reset successfully');
  } catch (error) {
    logger.error('Error resetting testimonials:', error);
  }
};
