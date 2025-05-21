
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface MealPlanData {
  patient_id: string;
  date: string;
  meals: Array<{
    name: string;
    percentage: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    foods: Array<any>;
  }>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  calculation_id?: string;
}

export async function saveMealPlan(data: MealPlanData) {
  try {
    // Generate ID if not provided
    const mealPlanId = uuidv4();
    
    // Create meal plan record
    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .insert({
        id: mealPlanId,
        patient_id: data.patient_id,
        date: data.date,
        meals: data.meals,
        total_calories: data.total_calories,
        total_protein: data.total_protein,
        total_carbs: data.total_carbs,
        total_fats: data.total_fats,
        calculation_id: data.calculation_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return { success: true, data: mealPlan };
  } catch (error: any) {
    console.error('Error saving meal plan:', error);
    return { success: false, error: error.message };
  }
}

export async function getPatientMealPlans(patientId: string) {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching patient meal plans:', error);
    return { success: false, error: error.message };
  }
}

export async function getMealPlanById(mealPlanId: string) {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', mealPlanId)
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching meal plan:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteMealPlan(mealPlanId: string) {
  try {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', mealPlanId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting meal plan:', error);
    return { success: false, error: error.message };
  }
}
