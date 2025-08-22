
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';

export interface PatientServiceResponse {
  success: boolean;
  data?: Patient | Patient[];
  error?: string;
}

export const PatientService = {
  async getPatients(userId: string, filters?: any): Promise<PatientServiceResponse> {
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      return { success: false, error: error.message };
    }
  },

  async getPatient(id: string): Promise<PatientServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      return { success: false, error: error.message };
    }
  },

  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<PatientServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating patient:', error);
      return { success: false, error: error.message };
    }
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<PatientServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating patient:', error);
      return { success: false, error: error.message };
    }
  },

  async deletePatient(id: string): Promise<PatientServiceResponse> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      return { success: false, error: error.message };
    }
  }
};
