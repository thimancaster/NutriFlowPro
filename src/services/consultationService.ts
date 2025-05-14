
import { supabase } from '@/integrations/supabase/client';
import { ConsultationData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const ConsultationService = {
  /**
   * Save the consultation data to the database
   */
  async saveConsultation(consultationData: Partial<ConsultationData>) {
    try {
      // Format the data to match the database schema
      const formattedData = {
        id: consultationData.id || uuidv4(),
        user_id: consultationData.user_id,
        patient_id: consultationData.patient_id,
        weight: consultationData.weight,
        height: consultationData.height,
        age: typeof consultationData.age === 'string' ? parseInt(consultationData.age) : consultationData.age,
        gender: consultationData.gender,
        objective: consultationData.objective,
        activityLevel: consultationData.activityLevel,
        tipo: consultationData.tipo || 'primeira_consulta',
        results: {
          bmr: consultationData.results?.bmr || 0,
          get: consultationData.results?.get || 0,
          adjustment: consultationData.results?.adjustment || 0,
          vet: consultationData.results?.vet || 0,
          macros: {
            carbs: consultationData.results?.macros?.carbs || 0,
            protein: consultationData.results?.macros?.protein || 0,
            fat: consultationData.results?.macros?.fat || 0,
            proteinPerKg: consultationData.results?.macros?.proteinPerKg || 0
          }
        }
      };
      
      const { data, error } = await supabase
        .from('calculations')
        .upsert(formattedData)
        .select('*')
        .single();
      
      if (error) throw error;
      
      return { 
        success: true, 
        data,
        message: 'Consultation saved successfully'
      };
    } catch (error: any) {
      console.error('Error saving consultation:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Error saving consultation'
      };
    }
  },
  
  /**
   * Get consultation by ID
   */
  async getConsultation(id: string) {
    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*, patients(id, name, gender, birth_date)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Calculate age based on birth date if available
      let age = data.age;
      if (data.patients?.birth_date) {
        const birthDate = new Date(data.patients.birth_date);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      // Format the data to match the expected structure
      const formattedData = {
        ...data,
        patient: {
          id: data.patients?.id,
          name: data.patients?.name,
          gender: data.patients?.gender,
          age: age
        }
      };
      
      return { success: true, data: formattedData };
    } catch (error: any) {
      console.error('Error fetching consultation:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Get consultations for a patient
   */
  async getPatientConsultations(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching patient consultations:', error);
      return { success: false, error: error.message };
    }
  }
};
