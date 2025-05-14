
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { format } from 'date-fns';

export const useAppointmentMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: Partial<Appointment>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Format dates to ISO string if they are Date objects
      const startTime = typeof appointmentData.start_time === 'object' 
        ? format(appointmentData.start_time as Date, "yyyy-MM-dd'T'HH:mm:ssXXX") 
        : appointmentData.start_time;
        
      const endTime = typeof appointmentData.end_time === 'object'
        ? format(appointmentData.end_time as Date, "yyyy-MM-dd'T'HH:mm:ssXXX")
        : appointmentData.end_time;

      // Get the date from the start_time for the date field
      const date = typeof startTime === 'string' ? startTime.split('T')[0] : '';

      // Map the appointment data to match the database structure
      const dbAppointmentData = {
        user_id: user.id,
        patient_id: appointmentData.patient_id,
        title: appointmentData.title,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: appointmentData.duration_minutes,
        notes: appointmentData.notes,
        status: appointmentData.status || 'scheduled',
        type: appointmentData.title || 'consultation', // Use title as type if not provided
        date: date // Use start_time date part for the date field
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(dbAppointmentData)
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, ...appointmentData }: { id: string; [key: string]: any }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Format dates to ISO string if they are Date objects
      const startTime = typeof appointmentData.start_time === 'object' 
        ? format(appointmentData.start_time as Date, "yyyy-MM-dd'T'HH:mm:ssXXX") 
        : appointmentData.start_time;
        
      const endTime = typeof appointmentData.end_time === 'object'
        ? format(appointmentData.end_time as Date, "yyyy-MM-dd'T'HH:mm:ssXXX")
        : appointmentData.end_time;
      
      // Get the date from the start_time for the date field
      const date = typeof startTime === 'string' ? startTime.split('T')[0] : '';

      // Map the appointment data to match the database structure
      const dbAppointmentData = {
        patient_id: appointmentData.patient_id,
        title: appointmentData.title,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: appointmentData.duration_minutes,
        notes: appointmentData.notes,
        status: appointmentData.status,
        type: appointmentData.title || 'consultation', // Use title as type if not provided
        date: date // Use start_time date part for the date field
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(dbAppointmentData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });

  // Cancel appointment mutation (update status to cancelled)
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
  
  return {
    createAppointmentMutation,
    updateAppointmentMutation,
    deleteAppointmentMutation,
    cancelAppointmentMutation
  };
};
