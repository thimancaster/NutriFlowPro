import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';

export class MealPlanServiceV3 {
  static async getMealPlansByPatient(patientId: string): Promise<ConsolidatedMealPlan[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(plan => ({
        id: plan.id,
        name: plan.name || 'Plano Alimentar',
        user_id: plan.user_id,
        patient_id: plan.patient_id,
        date: plan.date,
        total_calories: plan.total_calories,
        total_protein: plan.total_protein,
        total_carbs: plan.total_carbs,
        total_fats: plan.total_fats,
        meals: [],
        notes: plan.notes,
        created_at: plan.created_at,
        updated_at: plan.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      return [];
    }
  }
}
