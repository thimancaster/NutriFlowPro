
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment } from '@/types';
import { format, parseISO, addDays } from 'date-fns';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAppointments = useCallback(async () => {
    if (!user) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Query the existing appointments table with the correct field names
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients:patient_id (name)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (!data) {
        setAppointments([]);
        return;
      }

      // Map the database fields to our Appointment type
      const formattedAppointments = data.map(appointment => ({
        id: appointment.id,
        user_id: appointment.user_id,
        patient_id: appointment.patient_id,
        patientName: appointment.patients?.name || 'Unknown Patient',
        title: appointment.type || '', // Using 'type' field as title
        start_time: appointment.date || '', // Using 'date' field as start_time
        end_time: appointment.date ? new Date(new Date(appointment.date).getTime() + 60*60*1000).toISOString() : '', // Estimate end_time as 1 hour after start
        duration_minutes: 60, // Default duration
        appointment_type_id: appointment.type,
        notes: appointment.notes,
        status: appointment.status,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at
      } as Appointment));
      
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Group appointments by date for easier display
  const appointmentsByDate = useCallback(() => {
    const grouped: { [key: string]: Appointment[] } = {};
    
    appointments.forEach(appointment => {
      const dateKey = format(parseISO(appointment.start_time), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });
    
    return grouped;
  }, [appointments]);

  // CRUD operations for appointments
  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    try {
      // Transform from our Appointment interface to the database schema
      const dbAppointment = {
        user_id: user.id,
        patient_id: appointmentData.patient_id,
        date: appointmentData.start_time, // Map start_time to date
        type: appointmentData.title, // Map title to type
        notes: appointmentData.notes,
        status: appointmentData.status || 'scheduled',
      };
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(dbAppointment)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchAppointments(); // Refresh the list
      return { success: true, data };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, error };
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    try {
      // Transform from our Appointment interface to the database schema
      const dbAppointment: any = {};
      
      if (appointmentData.patient_id) dbAppointment.patient_id = appointmentData.patient_id;
      if (appointmentData.title) dbAppointment.type = appointmentData.title;
      if (appointmentData.start_time) dbAppointment.date = appointmentData.start_time;
      if (appointmentData.notes) dbAppointment.notes = appointmentData.notes;
      if (appointmentData.status) dbAppointment.status = appointmentData.status;
      
      const { data, error } = await supabase
        .from('appointments')
        .update(dbAppointment)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchAppointments(); // Refresh the list
      return { success: true, data };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { success: false, error };
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await fetchAppointments(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, error };
    }
  };
  
  // Cancel an appointment (update status to 'canceled')
  const cancelAppointment = async (id: string) => {
    return await updateAppointment(id, { status: 'canceled' });
  };

  return {
    appointments,
    isLoading,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    appointmentsByDate
  };
};
