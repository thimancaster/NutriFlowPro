
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const consultationService = {
  // Save consultation data
  async saveConsultation(consultationData: any) {
    try {
      // Ensure required fields are present
      const requiredFields = ['weight', 'height', 'age', 'gender', 'activity_level', 'goal', 'status', 'tipo'];
      const missingFields = requiredFields.filter(field => !consultationData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Format the data for Supabase
      const formattedData = {
        id: consultationData.id || uuidv4(),
        weight: Number(consultationData.weight),
        height: Number(consultationData.height),
        age: Number(consultationData.age),
        gender: consultationData.gender,
        activity_level: consultationData.activity_level,
        goal: consultationData.goal,
        bmr: Number(consultationData.bmr || 0),
        tdee: Number(consultationData.tdee || 0),
        protein: Number(consultationData.protein || 0),
        carbs: Number(consultationData.carbs || 0),
        fats: Number(consultationData.fats || 0),
        user_id: consultationData.user_id,
        patient_id: consultationData.patient_id,
        tipo: consultationData.tipo,
        status: consultationData.status,
        notes: consultationData.notes || '',
        measurements: consultationData.measurements || {}
      };

      const { data, error } = await supabase
        .from('calculations')
        .insert([formattedData])
        .select();

      if (error) {
        throw new Error(`Error saving consultation: ${error.message}`);
      }

      return { 
        success: true, 
        data: data[0], 
        message: 'Consultation saved successfully' 
      };
    } catch (error: any) {
      console.error('Error in saveConsultation:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to save consultation' 
      };
    }
  },

  // Get a specific consultation
  async getConsultation(id: string) {
    try {
      const { data, error } = await supabase
        .from('calculations')
        .select(`
          *,
          patients(id, name, email, phone, gender)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching consultation: ${error.message}`);
      }

      return { 
        success: true, 
        data,
        message: 'Consultation retrieved successfully' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to retrieve consultation' 
      };
    }
  },

  // Get consultations for a specific patient
  async getPatientConsultations(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching patient consultations: ${error.message}`);
      }

      return { 
        success: true, 
        data, 
        message: 'Patient consultations retrieved successfully' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to retrieve patient consultations' 
      };
    }
  },

  // Update an existing consultation
  async updateConsultation(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('calculations')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(`Error updating consultation: ${error.message}`);
      }

      return { 
        success: true, 
        data: data[0], 
        message: 'Consultation updated successfully' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to update consultation' 
      };
    }
  }
};
