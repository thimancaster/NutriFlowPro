
import { supabase } from '@/integrations/supabase/client';
import { ConsultationService } from './consultationService';
import { PatientService } from './patient';

export const DatabaseService = {
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      return { success: true, message: 'Database connection healthy' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  async seedData() {
    // Implementation for seeding initial data
    console.log('Seeding data...');
  },

  // Re-export services for convenience
  consultation: ConsultationService,
  patient: PatientService
};
