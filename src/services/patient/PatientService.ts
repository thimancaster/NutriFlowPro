
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientGoals, AddressDetails } from '@/types/patient';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface PatientServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface DatabasePatient {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
  notes?: string | null;
  status?: string | null;
  goals?: Json | null;
  secondaryphone?: string | null;
  user_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  cpf?: string | null;
}

export class PatientService {
  static async createPatient(patientData: Partial<Patient>): Promise<PatientServiceResult<Patient>> {
    try {
      // Convert Patient data to database format
      const dbPatient: DatabasePatient = {
        name: patientData.name || '',
        email: patientData.email || null,
        phone: patientData.phone || null,
        birth_date: patientData.birth_date || null,
        gender: patientData.gender || null,
        address: typeof patientData.address === 'object' 
          ? JSON.stringify(patientData.address) 
          : (patientData.address || null),
        notes: patientData.notes || null,
        status: patientData.status || 'active',
        goals: patientData.goals ? JSON.stringify(patientData.goals) : null,
        secondaryphone: patientData.secondaryPhone || null,
        cpf: patientData.cpf || null,
        user_id: patientData.user_id || ''
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([dbPatient])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Transform back to Patient type
      const transformedPatient = this.transformFromDatabase(data);
      return { success: true, data: transformedPatient };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async updatePatient(id: string, updates: Partial<Patient>): Promise<PatientServiceResult<Patient>> {
    try {
      // Convert updates to database format
      const dbUpdates: Partial<DatabasePatient> = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email || null;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null;
      if (updates.birth_date !== undefined) dbUpdates.birth_date = updates.birth_date || null;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender || null;
      if (updates.address !== undefined) {
        dbUpdates.address = typeof updates.address === 'object' 
          ? JSON.stringify(updates.address) 
          : (updates.address || null);
      }
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
      if (updates.status !== undefined) dbUpdates.status = updates.status || null;
      if (updates.goals !== undefined) dbUpdates.goals = updates.goals ? JSON.stringify(updates.goals) : null;
      if (updates.secondaryPhone !== undefined) dbUpdates.secondaryphone = updates.secondaryPhone || null;
      if (updates.cpf !== undefined) dbUpdates.cpf = updates.cpf || null;

      const { data, error } = await supabase
        .from('patients')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const transformedPatient = this.transformFromDatabase(data);
      return { success: true, data: transformedPatient };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getPatient(id: string): Promise<PatientServiceResult<Patient>> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const transformedPatient = this.transformFromDatabase(data);
      return { success: true, data: transformedPatient };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async deletePatient(id: string): Promise<PatientServiceResult<void>> {
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
      return { success: false, error: error.message };
    }
  }

  private static transformFromDatabase(data: any): Patient {
    // Parse goals from JSON
    let goals: PatientGoals = {};
    if (data.goals) {
      try {
        goals = typeof data.goals === 'string' 
          ? JSON.parse(data.goals) 
          : data.goals as PatientGoals;
      } catch (e) {
        console.warn('Failed to parse patient goals:', e);
        goals = {};
      }
    }

    // Calculate age if birth_date exists
    let age = undefined;
    if (data.birth_date) {
      const birthDate = new Date(data.birth_date);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      birth_date: data.birth_date || '',
      gender: (data.gender === 'male' || data.gender === 'female' || data.gender === 'other') 
        ? data.gender as 'male' | 'female' | 'other'
        : 'other',
      address: data.address || '',
      notes: data.notes || '',
      status: (data.status === 'active' || data.status === 'archived') 
        ? data.status as 'active' | 'archived'
        : 'active',
      goals,
      secondaryPhone: data.secondaryphone || '',
      cpf: data.cpf || '',
      user_id: data.user_id,
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
      age,
      last_appointment: undefined
    };
  }
}
