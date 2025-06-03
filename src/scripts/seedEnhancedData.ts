
import { supabase } from '../integrations/supabase/client';
import { seedEnhancedFoodData } from '../utils/seedDataUtils';

/**
 * Script to seed enhanced food data with new nutritional information
 */
const seedEnhancedDatabase = async (): Promise<void> => {
  try {
    console.log('Starting enhanced database seeding...');
    
    // Seed enhanced food data
    await seedEnhancedFoodData();
    
    console.log('Enhanced database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding enhanced database:', error);
    process.exit(1);
  } finally {
    // Close the Supabase connection
    supabase.auth.signOut();
  }
};

// Execute if run directly
if (require.main === module) {
  seedEnhancedDatabase().then(() => {
    process.exit(0);
  });
}

export default seedEnhancedDatabase;
