
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { Json } from '@/integrations/supabase/types';

// Helper to convert database record to a Patient object
const convertDbToPatient = (dbRecord: any): Patient => {
  // Parse JSON strings back to objects
  let address = dbRecord.address;
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address);
    } catch (e) {
      address = null;
    }
  }
  
  let goals = dbRecord.goals;
  if (typeof goals === 'string') {
    try {
      goals = JSON.parse(goals);
    } catch (e) {
      goals = null;
    }
  }
  
  const patient: Patient = {
    ...dbRecord,
    address,
    goals
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
      
      // Format address for database - convert to string if it's an object
      let dbPatientData = { ...patientData };
      if (dbPatientData.address && typeof dbPatientData.address === 'object') {
        dbPatientData.address = JSON.stringify(dbPatientData.address);
      }
      
      // Format goals for database - convert to string if it's an object
      if (dbPatientData.goals && typeof dbPatientData.goals === 'object') {
        dbPatientData.goals = JSON.stringify(dbPatientData.goals);
      }
      
      if (patientData.id) {
        // Update existing patient
        const { data, error } = await supabase
          .from('patients')
          .update(dbPatientData)
          .eq('id', patientData.id);
          
        if (error) throw error;
        
        return {
          success: true,
          data: patientData.id
        };
      } else {
        // Create new patient
        dbPatientData.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('patients')
          .insert(dbPatientData)
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
