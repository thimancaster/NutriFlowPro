
import { supabase } from './client';

// Function to get all food categories
export const getFoodCategories = async () => {
  // Get distinct food groups from the foods table
  const { data, error } = await supabase
    .from('foods')
    .select('category, food_group')
    .not('food_group', 'is', null);
  
  if (error) {
    console.error('Error fetching food categories:', error);
    return [];
  }
  
  // Transform the data into the expected format and deduplicate
  const uniqueCategories = Array.from(
    new Map(data.map((item: any) => [
      item.category, 
      { id: item.category, name: item.food_group }
    ])).values()
  );
  
  return uniqueCategories || [];
};

// Function to get food details by ID
export const getFoodDetails = async (foodId: string) => {
  const { data, error } = await supabase
    .from('foods')
    .select(`
      id,
      name,
      food_group
    `)
    .eq('id', foodId)
    .single();
  
  if (error) {
    console.error('Error fetching food details:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    category: data.food_group
  };
};

// Function to get nutritional values by food ID
export const getNutritionalValues = async (foodId: string) => {
  const { data, error } = await supabase
    .from('foods')
    .select(`
      calories,
      protein,
      carbs,
      fats
    `)
    .eq('id', foodId)
    .single();
  
  if (error) {
    console.error('Error fetching nutritional values:', error);
    return null;
  }
  
  // Transform to expected format
  return {
    id: foodId,
    measure_id: foodId,
    calories: data.calories,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fats
  };
};

// Function to get food restrictions by food ID
export const getFoodRestrictions = async (foodId: string) => {
  // Since we don't have actual restrictions yet, return empty array
  return [];
};
