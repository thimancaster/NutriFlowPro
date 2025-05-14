
import { initializeTestimonials } from '../utils/seedDataUtils';
import { forceSeedTestimonials } from '../utils/seedTestimonials';

/**
 * This script can be run manually to seed the database with testimonials.
 * It can be executed via:
 * - A command line tool such as node or bun
 * - During deployment process
 * - From development utilities
 */
const seedDatabaseWithTestimonials = async (force = false) => {
  console.log('Starting database seed process...');
  
  if (force) {
    console.log('Force seeding testimonials...');
    await forceSeedTestimonials();
  } else {
    console.log('Initializing testimonials if needed...');
    await initializeTestimonials();
  }
  
  console.log('Seed process completed');
};

// Allow script to be run directly or imported
if (require.main === module) {
  // Script is being run directly
  seedDatabaseWithTestimonials()
    .then(() => console.log('Database seeding completed'))
    .catch(err => console.error('Error during database seeding:', err));
}

export default seedDatabaseWithTestimonials;
