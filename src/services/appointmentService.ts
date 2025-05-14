
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';

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
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
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
      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
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
