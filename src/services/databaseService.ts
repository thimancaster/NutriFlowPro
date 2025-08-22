
import { supabase } from '@/integrations/supabase/client';
import { ConsultationService } from './consultationService';
import { PatientService } from './patient/PatientService';
import { MealPlanService } from './mealPlanService';

export class DatabaseService {
  static async healthCheck() {
    try {
      const { data, error } = await supabase.from('patients').select('count').limit(1);
      return { success: !error, error: error?.message };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static consultation = ConsultationService;
  static patient = PatientService;
  static mealPlan = MealPlanService;
}
