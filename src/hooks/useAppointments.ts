
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Appointment } from '@/types';

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

      // Map the data to include patientName directly in the appointment object
      const formattedAppointments = data.map(appointment => ({
        ...appointment,
        patientName: appointment.patients?.name || 'Unknown Patient'
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

  return {
    appointments,
    isLoading,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};
