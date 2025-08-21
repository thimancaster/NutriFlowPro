
import { supabase } from '@/integrations/supabase/client';

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
}

export interface PatientsResponse {
  success: boolean;
  data?: Patient[];
  error?: string;
}

export class PatientService {
  static async getPatients(userId: string): Promise<PatientsResponse> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      // Map the data to ensure proper typing
      const mappedData: Patient[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email || undefined,
        phone: item.phone || undefined,
        birth_date: item.birth_date || undefined,
        gender: (item.gender === 'male' || item.gender === 'female' || item.gender === 'other') 
          ? item.gender 
          : undefined,
        address: typeof item.address === 'string' ? item.address : undefined,
        notes: item.notes || undefined,
        created_at: item.created_at || undefined,
        updated_at: item.updated_at || undefined,
        user_id: item.user_id
      }));

      return { success: true, data: mappedData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    // Prepare data for database insertion
    const dbData = {
      name: patientData.name,
      email: patientData.email || null,
      phone: patientData.phone || null,
      birth_date: patientData.birth_date || null,
      gender: patientData.gender || null,
      address: typeof patientData.address === 'string' ? patientData.address : null,
      notes: patientData.notes || null,
      user_id: patientData.user_id
    };

    const { data, error } = await supabase
      .from('patients')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Map response back to Patient type
    return {
      id: data.id,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      birth_date: data.birth_date || undefined,
      gender: (data.gender === 'male' || data.gender === 'female' || data.gender === 'other') 
        ? data.gender 
        : undefined,
      address: typeof data.address === 'string' ? data.address : undefined,
      notes: data.notes || undefined,
      created_at: data.created_at || undefined,
      updated_at: data.updated_at || undefined,
      user_id: data.user_id
    };
  }

  static async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    // Prepare data for database update
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email || null;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null;
    if (updates.birth_date !== undefined) dbUpdates.birth_date = updates.birth_date || null;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender || null;
    if (updates.address !== undefined) {
      dbUpdates.address = typeof updates.address === 'string' ? updates.address : null;
    }
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

    const { data, error } = await supabase
      .from('patients')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Map response back to Patient type
    return {
      id: data.id,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      birth_date: data.birth_date || undefined,
      gender: (data.gender === 'male' || data.gender === 'female' || data.gender === 'other') 
        ? data.gender 
        : undefined,
      address: typeof data.address === 'string' ? data.address : undefined,
      notes: data.notes || undefined,
      created_at: data.created_at || undefined,
      updated_at: data.updated_at || undefined,
      user_id: data.user_id
    };
  }
}
