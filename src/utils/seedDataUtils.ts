
import { supabase } from "@/integrations/supabase/client";
import { getTestimonials } from "./seedTestimonials";

/**
 * Checks if testimonials already exist in the database
 * @returns boolean indicating if testimonials exist
 */
export const checkTestimonialsExist = async (): Promise<boolean> => {
  try {
    const { data: existingTestimonials, error } = await supabase
      .from('testimonials')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking testimonials:', error);
      return false;
    }
    
    return existingTestimonials && existingTestimonials.length > 0;
  } catch (err) {
    console.error('Error in checkTestimonialsExist:', err);
    return false;
  }
};

/**
 * Seeds testimonials only if they don't already exist
 * Should be called only in development or during initial setup
 */
export const initializeTestimonials = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    // Skip seeding in production
    console.log('Skipping testimonial seeding in production');
    return;
  }
  
  try {
    const testimonialsExist = await checkTestimonialsExist();
    
    if (!testimonialsExist) {
      console.log('No testimonials found, seeding the database...');
      const testimonials = getTestimonials();
      
      const { error } = await supabase
        .from('testimonials')
        .insert(testimonials);
      
      if (error) {
        console.error('Error seeding testimonials:', error);
      } else {
        console.log('Successfully seeded testimonials');
      }
    } else {
      console.log('Testimonials already exist in the database');
    }
  } catch (error) {
    console.error('Error in initializeTestimonials:', error);
  }
};
