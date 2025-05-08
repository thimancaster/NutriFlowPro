
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
      // Fetch appointments and join with patients table to get patient name
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

      // Map the data to include patientName directly in the appointment object
      const formattedAppointments = data.map(appointment => ({
        id: appointment.id,
        user_id: appointment.user_id,
        patient_id: appointment.patient_id,
        patientName: appointment.patients?.name || 'Unknown Patient',
        title: appointment.title || '',
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        duration_minutes: appointment.duration_minutes,
        appointment_type_id: appointment.appointment_type_id,
        notes: appointment.notes,
        status: appointment.status,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at
      }));
      
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
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          user_id: user.id
        })
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
      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
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
