
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { convertDatesToISOString, prepareForSupabase } from '@/utils/dateUtils';

export const AppointmentService = {
  /**
   * Fetch appointments for a user or specific patient
   */
  async getAppointments(patientId?: string) {
    try {
      let query = supabase
        .from('appointments')
        .select('*, patients(name)')
        .order('date', { ascending: true });
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format the data to include patient name
      const formattedData = data.map((appointment) => ({
        ...appointment,
        patientName: appointment.patients?.name || 'Unknown',
      }));
      
      return { success: true, data: formattedData };
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: Partial<Appointment>) {
    try {
      // Convert Date objects to ISO strings and ensure required fields
      if (!appointmentData.date && appointmentData.start_time) {
        // If date is missing but start_time exists, use start_time as date
        appointmentData.date = appointmentData.start_time instanceof Date 
          ? appointmentData.start_time.toISOString()
          : appointmentData.start_time;
      }

      // Ensure type field
      if (!appointmentData.type && appointmentData.appointment_type_id) {
        appointmentData.type = appointmentData.appointment_type_id;
      } else if (!appointmentData.type) {
        appointmentData.type = 'default';
      }
      
      const preparedData = prepareForSupabase(appointmentData, true);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([preparedData])
        .select('*')
        .single();
        
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Update an existing appointment
   */
  async updateAppointment(id: string, appointmentData: Partial<Appointment>) {
    try {
      // Ensure date field exists
      if (!appointmentData.date && appointmentData.start_time) {
        // If date is missing but start_time exists, use start_time as date
        appointmentData.date = appointmentData.start_time instanceof Date 
          ? appointmentData.start_time.toISOString()
          : appointmentData.start_time;
      }
      
      // Convert all Date objects to ISO strings and remove id
      const preparedData = prepareForSupabase({ ...appointmentData }, false);
      delete preparedData.id; // Remove ID from update data
      
      const { data, error } = await supabase
        .from('appointments')
        .update(preparedData)
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string) {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      return { success: false, error: error.message };
    }
  }
};
