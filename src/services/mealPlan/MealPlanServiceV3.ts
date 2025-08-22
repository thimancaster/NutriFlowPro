
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
        name: `Plano - ${new Date(plan.date).toLocaleDateString('pt-BR')}`,
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

  static async generateMealPlan(params: {
    patientId: string;
    calculationId: string;
    targets: any;
  }): Promise<string> {
    // Implementation would use the generate_meal_plan function
    const { data, error } = await supabase.rpc('generate_meal_plan', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_patient_id: params.patientId,
      p_target_calories: params.targets.calories,
      p_target_protein: params.targets.protein,
      p_target_carbs: params.targets.carbs,
      p_target_fats: params.targets.fats
    });

    if (error) throw error;
    return data;
  }

  static async updateMealPlan(id: string, updates: any): Promise<boolean> {
    const { error } = await supabase
      .from('meal_plans')
      .update(updates)
      .eq('id', id);

    return !error;
  }

  static async getMealPlanById(id: string): Promise<ConsolidatedMealPlan | null> {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: `Plano - ${new Date(data.date).toLocaleDateString('pt-BR')}`,
      user_id: data.user_id,
      patient_id: data.patient_id,
      date: data.date,
      total_calories: data.total_calories,
      total_protein: data.total_protein,
      total_carbs: data.total_carbs,
      total_fats: data.total_fats,
      meals: [],
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}
