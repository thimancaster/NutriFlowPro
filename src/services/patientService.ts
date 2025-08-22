
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientResponse } from '@/types/patient';

export const PatientService = {
  async getPatients(userId: string, filters?: any): Promise<PatientResponse[]> {
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  async getPatient(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return null;
    }
  },

  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  async deletePatient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }
};
