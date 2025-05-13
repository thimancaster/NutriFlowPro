
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { Json } from '@/integrations/supabase/types';

// Helper to convert a Patient object to a database-friendly format
const convertPatientForDb = (patient: Partial<Patient>) => {
  // Convert complex objects like address and goals to JSON strings for Supabase
  const dbPatient: any = {
    ...patient,
    // Convert address object to string JSON for storage if it exists
    address: patient.address ? JSON.stringify(patient.address) : null,
    // Convert goals object to string JSON for storage if it exists
    goals: patient.goals ? JSON.stringify(patient.goals) : null
  };

  return dbPatient;
};

// Helper to convert database record to a Patient object
const convertDbToPatient = (dbRecord: any): Patient => {
  // Parse JSON strings back to objects
  const patient: Patient = {
    ...dbRecord,
    // Parse address JSON string back to object
    address: dbRecord.address ? JSON.parse(dbRecord.address) : undefined,
    // Parse goals JSON string back to object
    goals: dbRecord.goals ? JSON.parse(dbRecord.goals) : undefined
  };

  return patient;
};

export class PatientService {
  static async savePatient(patientData: Partial<Patient>, userId: string) {
    try {
      // Ensure user_id is set
      patientData.user_id = userId;
      
      // Set updated_at timestamp
      patientData.updated_at = new Date().toISOString();
      
      // Format data for database
      const dbPatient = convertPatientForDb(patientData);
      
      if (patientData.id) {
        // Update existing patient
        const { data, error } = await supabase
          .from('patients')
          .update(dbPatient)
          .eq('id', patientData.id);
          
        if (error) throw error;
        
        return {
          success: true,
          data: patientData.id
        };
      } else {
        // Create new patient
        patientData.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('patients')
          .insert(dbPatient)
          .select('id')
          .single();
          
        if (error) throw error;
        
        return {
          success: true,
          data: data.id
        };
      }
    } catch (error: any) {
      console.error('Error saving patient:', error);
      return {
        success: false,
        error: error.message || 'Failed to save patient'
      };
    }
  }
  
  static async getPatient(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
        
      if (error) throw error;
      
      const patient = convertDbToPatient(data);
      
      return {
        success: true,
        data: patient
      };
    } catch (error: any) {
      console.error('Error getting patient:', error);
      return {
        success: false,
        error: error.message || 'Failed to get patient'
      };
    }
  }
  
  static async updatePatientStatus(patientId: string, status: 'active' | 'archived') {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', patientId);
        
      if (error) throw error;
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error updating patient status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update patient status'
      };
    }
  }
  
  static async getPatients(userId: string, filters: any = {}) {
    try {
      const {
        search = '',
        status = 'active',
        startDate,
        endDate,
        sortBy = 'name',
        sortOrder = 'asc',
        page = 1,
        pageSize = 10
      } = filters;
      
      // Calculate offset based on page and pageSize
      const offset = (page - 1) * pageSize;
      
      // Start building query
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });
      
      // Apply filters
      // Filter by user_id
      query = query.eq('user_id', userId);
      
      // Filter by status if not 'all'
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      
      // Filter by search term
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
      }
      
      // Filter by date range
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      
      if (endDate) {
        // Add a day to endDate to include the entire day
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      query = query.range(offset, offset + pageSize - 1);
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Convert DB records to Patient objects
      const patients = data.map(record => convertDbToPatient(record));
      
      return {
        success: true,
        data: patients,
        count
      };
    } catch (error: any) {
      console.error('Error getting patients:', error);
      return {
        success: false,
        error: error.message || 'Failed to get patients'
      };
    }
  }
}
