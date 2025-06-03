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

// New function to populate enhanced food data
export const seedEnhancedFoodData = async () => {
  const enhancedFoods = [
    // Enhanced cereals and grains
    {
      name: "Arroz integral cozido",
      food_group: "cereais_e_graos",
      calories: 112,
      protein: 2.6,
      carbs: 22.0,
      fats: 0.9,
      fiber: 1.8,
      sodium: 5,
      glycemic_index: 50,
      portion_size: 100,
      portion_unit: "g",
      meal_time: ["almoco", "jantar", "any"],
      is_organic: false,
      allergens: ["Glúten"],
      season: ["Ano todo"],
      preparation_time: 30,
      cost_level: "baixo",
      availability: "comum",
      sustainability_score: 7
    },
    {
      name: "Quinoa cozida",
      food_group: "cereais_e_graos",
      calories: 120,
      protein: 4.4,
      carbs: 21.3,
      fats: 1.9,
      fiber: 2.8,
      sodium: 7,
      glycemic_index: 35,
      portion_size: 100,
      portion_unit: "g",
      meal_time: ["almoco", "jantar", "cafe_da_manha", "any"],
      is_organic: true,
      allergens: [],
      season: ["Ano todo"],
      preparation_time: 20,
      cost_level: "alto",
      availability: "comum",
      sustainability_score: 9
    },
    // Enhanced fruits
    {
      name: "Banana nanica",
      food_group: "frutas",
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fats: 0.3,
      fiber: 2.6,
      sodium: 1,
      sugar: 12.2,
      glycemic_index: 62,
      portion_size: 100,
      portion_unit: "g",
      meal_time: ["cafe_da_manha", "lanche", "any"],
      is_organic: false,
      allergens: [],
      season: ["Ano todo"],
      preparation_time: 0,
      cost_level: "baixo",
      availability: "comum",
      sustainability_score: 8,
      serving_suggestion: "Ideal para pré-treino ou lanche da manhã"
    },
    {
      name: "Abacate",
      food_group: "frutas",
      calories: 160,
      protein: 2.0,
      carbs: 8.5,
      fats: 14.7,
      fiber: 6.7,
      sodium: 7,
      sugar: 0.7,
      glycemic_index: 15,
      portion_size: 100,
      portion_unit: "g",
      meal_time: ["cafe_da_manha", "lanche", "any"],
      is_organic: true,
      allergens: [],
      season: ["Março", "Abril", "Maio", "Junho"],
      preparation_time: 5,
      cost_level: "medio",
      availability: "comum",
      sustainability_score: 6,
      serving_suggestion: "Rico em gorduras boas, ideal para vitaminas"
    },
    // Enhanced proteins
    {
      name: "Peito de frango grelhado",
      food_group: "proteinas",
      calories: 165,
      protein: 31.0,
      carbs: 0.0,
      fats: 3.6,
      fiber: 0.0,
      sodium: 74,
      saturated_fat: 1.0,
      portion_size: 100,
      portion_unit: "g",
      meal_time: ["almoco", "jantar", "any"],
      is_organic: false,
      allergens: [],
      season: ["Ano todo"],
      preparation_time: 15,
      cost_level: "medio",
      availability: "comum",
      sustainability_score: 4,
      serving_suggestion: "Fonte magra de proteína, ideal para ganho muscular"
    },
    {
      name: "Salmão grelhado",
      food_group: "proteinas",
      calories: 208,
      protein: 25.4,
      carbs: 0.0,
      fats: 12.4,
      fiber: 0.0,
      sodium: 59,
      saturated_fat: 3.1,
      portion_size: 100,
      portion_unit: "g",
      meal_time: ["almoco", "jantar", "any"],
      is_organic: false,
      allergens: ["Peixes"],
      season: ["Ano todo"],
      preparation_time: 12,
      cost_level: "alto",
      availability: "comum",
      sustainability_score: 3,
      serving_suggestion: "Rico em ômega-3, excelente para saúde cardiovascular"
    },
    // Enhanced vegetables
    {
      name: "Brócolis cozido",
      food_group: "vegetais",
      calories: 34,
      protein: 2.8,
      carbs: 7.0,
      fats: 0.4,
      fiber: 2.6,
      sodium: 33,
      sugar: 1.3,
      glycemic_index: 10,
      portion_size: 100,
      portion_unit: "g",
      meal_time: ["almoco", "jantar", "any"],
      is_organic: true,
      allergens: [],
      season: ["Maio", "Junho", "Julho", "Agosto"],
      preparation_time: 8,
      cost_level: "medio",
      availability: "comum",
      sustainability_score: 9,
      serving_suggestion: "Rico em vitaminas C e K, antioxidantes naturais"
    }
  ];

  console.log('Seeding enhanced food data...');
  
  for (const food of enhancedFoods) {
    try {
      const { error } = await supabase
        .from('foods')
        .upsert(food, { 
          onConflict: 'name',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`Error seeding food ${food.name}:`, error);
      } else {
        console.log(`✓ Seeded: ${food.name}`);
      }
    } catch (err) {
      console.error(`Failed to seed ${food.name}:`, err);
    }
  }
  
  console.log('Enhanced food data seeding completed');
};
