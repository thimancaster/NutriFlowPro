
import { supabase } from "@/integrations/supabase/client";
import { MealPlan } from "@/types/meal";

export interface MealPlanFilters {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const getMealPlans = async (
  userId: string, 
  filters: MealPlanFilters = {}
): Promise<{ success: boolean; data?: MealPlan[]; error?: string }> => {
  try {
    console.log('Fetching meal plans with filters:', filters);

    // Otimização: Selecionar apenas as colunas necessárias
    let query = supabase
      .from('meal_plans')
      .select(`
        id,
        user_id,
        patient_id,
        date,
        total_calories,
        total_protein,
        total_carbs,
        total_fats,
        created_at,
        updated_at
      `)
      .eq('user_id', userId) // Usar o índice idx_meal_plans_user_id
      .order('date', { ascending: false }); // Usar o índice idx_meal_plans_user_id_date

    // Aplicar filtro por paciente
    if (filters.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    // Aplicar filtros de data (usar índice composto)
    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    // Aplicar limite
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching meal plans:', error);
      return { success: false, error: error.message };
    }

    const mealPlans: MealPlan[] = (data || []).map(plan => ({
      ...plan,
      meals: [], // Será carregado separadamente se necessário
      total_calories: Number(plan.total_calories),
      total_protein: Number(plan.total_protein),
      total_carbs: Number(plan.total_carbs),
      total_fats: Number(plan.total_fats)
    }));

    return { success: true, data: mealPlans };
  } catch (error: any) {
    console.error('Error in getMealPlans:', error);
    return { success: false, error: error.message };
  }
};

export const getMealPlanById = async (
  id: string,
  userId: string
): Promise<{ success: boolean; data?: MealPlan; error?: string }> => {
  try {
    // Otimização: Buscar por ID com verificação de user_id usando índices
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId) // Usar o índice para verificação de segurança
      .single();

    if (error) {
      console.error('Error fetching meal plan:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Meal plan not found' };
    }

    const mealPlan: MealPlan = {
      ...data,
      meals: typeof data.meals === 'string' ? JSON.parse(data.meals) : data.meals || [],
      total_calories: Number(data.total_calories),
      total_protein: Number(data.total_protein),
      total_carbs: Number(data.total_carbs),
      total_fats: Number(data.total_fats)
    };

    return { success: true, data: mealPlan };
  } catch (error: any) {
    console.error('Error in getMealPlanById:', error);
    return { success: false, error: error.message };
  }
};

export const saveMealPlan = async (mealPlanData: Omit<MealPlan, 'id'>): Promise<{ success: boolean; data?: MealPlan; error?: string }> => {
  try {
    const dataToInsert = {
      patient_id: mealPlanData.patient_id,
      user_id: mealPlanData.user_id,
      calculation_id: mealPlanData.calculation_id,
      date: mealPlanData.date,
      meals: JSON.stringify(mealPlanData.meals),
      total_calories: mealPlanData.total_calories,
      total_protein: mealPlanData.total_protein,
      total_carbs: mealPlanData.total_carbs,
      total_fats: mealPlanData.total_fats
    };

    const { data, error } = await supabase
      .from('meal_plans')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error saving meal plan:', error);
      return { success: false, error: error.message };
    }

    const processedData: MealPlan = {
      ...data,
      meals: typeof data.meals === 'string' ? JSON.parse(data.meals) : data.meals || []
    };

    return { success: true, data: processedData };
  } catch (error: any) {
    console.error('Error in saveMealPlan:', error);
    return { success: false, error: error.message };
  }
};

export const getPatientMealPlans = async (
  userId: string,
  patientId: string,
  limit: number = 10
) => {
  return getMealPlans(userId, { patientId, limit });
};
