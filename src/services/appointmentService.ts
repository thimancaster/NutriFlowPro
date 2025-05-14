
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { prepareForSupabase } from '@/utils/dateUtils';

/**
 * Get all appointments for the current user
 */
export const getAppointments = async (
  userId: string,
  options: { 
    patientId?: string,
    status?: string, 
    startDate?: Date, 
    endDate?: Date,
    limit?: number
  } = {}
) => {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients (
          name
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: true });
      
    // Add filters if provided
    if (options.patientId) {
      query = query.eq('patient_id', options.patientId);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    if (options.startDate) {
      query = query.gte('date', options.startDate.toISOString());
    }
    
    if (options.endDate) {
      query = query.lte('date', options.endDate.toISOString());
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { 
      success: true, 
      data: data || [] 
    };
  } catch (error: any) {
    console.error('Error getting appointments:', error.message);
    return { 
      success: false, 
      error: error.message,
      data: [] 
    };
  }
};

/**
 * Create multiple appointments at once (bulk create)
 */
export const createAppointments = async (appointments: Partial<Appointment>[]) => {
  try {
    if (!appointments || appointments.length === 0) {
      throw new Error('No appointments provided');
    }
    
    // Prepare each appointment for database insertion
    const preparedAppointments = appointments.map(appointment => prepareForSupabase(appointment, true));
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(preparedAppointments)
      .select();
      
    if (error) throw error;
    
    return { 
      success: true, 
      data
    };
  } catch (error: any) {
    console.error('Error creating appointments:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Export all functions
export const AppointmentService = {
  getAppointments,
  createAppointments
};
