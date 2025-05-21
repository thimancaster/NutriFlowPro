
import { supabase } from './client';

// Function to get all food categories
export const getFoodCategories = async () => {
  const { data, error } = await supabase
    .from('foods')
    .select('category_id')
    .eq('category_id', 'is not null')
    .order('name');
  
  if (error) {
    console.error('Error fetching food categories:', error);
    return [];
  }
  
  return data || [];
};

// Function to get food details by ID
export const getFoodDetails = async (foodId: string) => {
  const { data, error } = await supabase
    .from('foods')
    .select(`
      id,
      name,
      description,
      category_id,
      subcategory_id
    `)
    .eq('id', foodId)
    .single();
  
  if (error) {
    console.error('Error fetching food details:', error);
    return null;
  }
  
  return data;
};

// Function to get food measures by food ID
export const getFoodMeasures = async (foodId: string) => {
  const { data, error } = await supabase
    .from('foods')
    .select(`
      portion_size,
      portion_unit
    `)
    .eq('id', foodId);
  
  if (error) {
    console.error('Error fetching food measures:', error);
    return [];
  }
  
  // Transform to expected format
  return data.map((item: any) => ({
    id: item.id || foodId,
    name: "Porção padrão",
    quantity: item.portion_size,
    unit: item.portion_unit,
    type: "default",
    is_default: true
  }));
};

// Function to get nutritional values by food ID and measure ID
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
    fat: data.fats,
    carbs: data.carbs
  };
};

// Function to get food restrictions by food ID
export const getFoodRestrictions = async (foodId: string) => {
  // Since we don't have actual restrictions yet, return empty array
  return [];
};
