import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { AppointmentStatus, AppointmentType } from '@/types/appointment';

// Function to format dates for Supabase
const formatDateForSupabase = (date: Date): string => {
  return date.toISOString();
};

// Fix the problematic parts where AppointmentType and AppointmentStatus are used as values
export const AppointmentTypeOptions = ['Primeira Consulta', 'Retorno', 'Avaliação'] as const;
export const AppointmentStatusOptions = ['scheduled', 'completed', 'canceled', 'no-show'] as const;

const getAppointmentTypes = () => {
  return [
    { value: 'first', label: 'Primeira Consulta' },
    { value: 'followup', label: 'Retorno' },
    { value: 'evaluation', label: 'Avaliação' },
    { value: 'other', label: 'Outro' },
  ];
};

const getAppointmentStatuses = () => {
  return [
    { value: 'scheduled', label: 'Agendado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'completed', label: 'Realizado' },
    { value: 'canceled', label: 'Cancelado' },
  ];
};

export const appointmentService = {
  // Get all appointments for a user
  async getAppointments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(id, name, email, phone)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) {
        throw new Error(`Error fetching appointments: ${error.message}`);
      }

      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to retrieve appointments' 
      };
    }
  },

  // Get a single appointment by ID
  async getAppointment(id: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(id, name, email, phone, gender, birth_date)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching appointment: ${error.message}`);
      }

      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to retrieve appointment' 
      };
    }
  },

  // Create a new appointment
  async createAppointment(appointmentData: any) {
    try {
      // Format the date for Supabase
      const formattedData = {
        ...appointmentData,
        id: uuidv4(),
        date: formatDateForSupabase(new Date(appointmentData.date || appointmentData.start_time))
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(formattedData)
        .select();

      if (error) {
        throw new Error(`Error creating appointment: ${error.message}`);
      }

      return { 
        success: true, 
        data: data[0], 
        message: 'Appointment created successfully',
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to create appointment',
        error: error.message || 'Unknown error',
      };
    }
  },

  // Create multiple appointments at once
  async createBulkAppointments(appointmentsData: any[]) {
    try {
      // Format each appointment's date for Supabase
      const formattedData = appointmentsData.map(appointment => ({
        ...appointment,
        id: appointment.id || uuidv4(),
        date: formatDateForSupabase(appointment.date),
        type: appointment.type || 'first',
        status: appointment.status || 'scheduled'
      }));

      const { data, error } = await supabase
        .from('appointments')
        .insert(formattedData)
        .select();

      if (error) {
        throw new Error(`Error creating appointments: ${error.message}`);
      }

      return { 
        success: true, 
        data, 
        message: 'Appointments created successfully' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to create appointments' 
      };
    }
  },

  // Update an existing appointment
  async updateAppointment(id: string, appointmentData: any) {
    try {
      // Format the date for Supabase if it exists
      const formattedData = {
        ...appointmentData,
        ...(appointmentData.date && { date: formatDateForSupabase(new Date(appointmentData.date)) }),
        ...(appointmentData.start_time && { date: formatDateForSupabase(new Date(appointmentData.start_time)) })
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(formattedData)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(`Error updating appointment: ${error.message}`);
      }

      return { 
        success: true, 
        data: data[0], 
        message: 'Appointment updated successfully',
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to update appointment',
        error: error.message || 'Unknown error',
      };
    }
  },

  // Delete an appointment
  async deleteAppointment(id: string) {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting appointment: ${error.message}`);
      }

      return { 
        success: true, 
        message: 'Appointment deleted successfully',
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to delete appointment',
        error: error.message || 'Unknown error',
      };
    }
  }
};
