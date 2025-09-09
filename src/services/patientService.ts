
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
      
      const transformedData = (data || []).map((patient: any) => ({
        ...patient,
        gender: (patient.gender === 'male' || patient.gender === 'female' || patient.gender === 'other') 
          ? patient.gender as 'male' | 'female' | 'other'
          : 'other' as const,
        status: (patient.status === 'active' || patient.status === 'archived')
          ? patient.status as 'active' | 'archived'
          : 'active' as const
      }));
      
      return { success: true, data: transformedData };
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
      
      const transformedData = {
        ...data,
        gender: (data.gender === 'male' || data.gender === 'female' || data.gender === 'other') 
          ? data.gender as 'male' | 'female' | 'other'
          : 'other' as const,
        status: (data.status === 'active' || data.status === 'archived')
          ? data.status as 'active' | 'archived'
          : 'active' as const
      };
      
      return { success: true, data: transformedData };
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      return { success: false, error: error.message };
    }
  },

  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<PatientServiceResponse> {
    try {
      const dbData = {
        ...patientData,
        address: typeof patientData.address === 'string' ? patientData.address : JSON.stringify(patientData.address),
        gender: patientData.gender || 'other'
      };
      
      const { data, error } = await supabase
        .from('patients')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }
      
      const transformedData = {
        ...data,
        gender: (data.gender === 'male' || data.gender === 'female' || data.gender === 'other') 
          ? data.gender as 'male' | 'female' | 'other'
          : 'other' as const,
        status: (data.status === 'active' || data.status === 'archived')
          ? data.status as 'active' | 'archived'
          : 'active' as const
      };
      
      return { success: true, data: transformedData };
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
      
      const transformedData = {
        ...data,
        gender: (data.gender === 'male' || data.gender === 'female' || data.gender === 'other') 
          ? data.gender as 'male' | 'female' | 'other'
          : 'other' as const,
        status: (data.status === 'active' || data.status === 'archived')
          ? data.status as 'active' | 'archived'
          : 'active' as const
      };
      
      return { success: true, data: transformedData };
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
