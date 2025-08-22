
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';

export interface PatientResponse {
  success: boolean;
  data?: Patient;
  error?: string;
}

export interface PatientsResponse {
  success: boolean;
  data?: Patient[];
  error?: string;
  total?: number;
}

export interface PatientsFilters {
  search?: string;
  status?: string;
}

export class PatientService {
  static async getPatient(patientId: string): Promise<PatientResponse> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;

      return { success: true, data: data as Patient };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getPatients(
    userId: string,
    filters?: PatientsFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PatientsResponse> {
    try {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { 
        success: true, 
        data: data as Patient[], 
        total: count || 0 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async savePatient(patient: Partial<Patient>): Promise<PatientResponse> {
    try {
      if (patient.id) {
        return await this.updatePatient(patient.id, patient);
      } else {
        return await this.createPatient(patient);
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async createPatient(patient: Partial<Patient>): Promise<PatientResponse> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patient])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as Patient };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async updatePatient(id: string, updates: Partial<Patient>): Promise<PatientResponse> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as Patient };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async deletePatient(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async updatePatientStatus(
    patientId: string, 
    status: 'active' | 'archived'
  ): Promise<PatientResponse> {
    return this.updatePatient(patientId, { status });
  }
}
