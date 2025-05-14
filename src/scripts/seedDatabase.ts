
import { supabase } from '../integrations/supabase/client';
import { seedTestimonials } from '../utils/seedTestimonials';

/**
 * Script to manually seed the database with initial data
 * This can be run as a standalone script or during initial deployment
 */
const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Starting database seeding process...');
    
    // 1. Seed testimonials
    console.log('Seeding testimonials...');
    await seedTestimonials();
    console.log('Testimonials seeded successfully');
    
    // 2. Add other seeding operations here as needed
    // await seedOtherDataType();
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close the Supabase connection
    supabase.auth.signOut();
  }
};

// Execute the seeding function if this script is run directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}

export default seedDatabase;
