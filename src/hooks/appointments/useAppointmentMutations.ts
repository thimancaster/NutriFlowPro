
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { parseISO, addMinutes } from 'date-fns';
import { AppointmentType, Appointment } from '@/types';

export const useAppointmentMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Create or update appointment
  const saveAppointment = useMutation({
    mutationFn: async (appointment: Partial<Appointment>) => {
      if (!user) throw new Error('User not authenticated');
      
      // Calculate end_time if it doesn't exist and we have appointment_type_id and start_time
      if (appointment.appointment_type_id && appointment.start_time && !appointment.end_time) {
        // Find the appointment type in the client-side cache
        const appointmentTypes = (window.appointmentTypes || []) as AppointmentType[];
        const appointmentType = appointmentTypes.find(type => type.id === appointment.appointment_type_id);
        
        if (appointmentType) {
          const startTime = typeof appointment.start_time === 'string' 
            ? parseISO(appointment.start_time) 
            : appointment.start_time;
            
          appointment.end_time = addMinutes(startTime, appointmentType.duration_minutes);
        }
      }
      
      // Set the user_id for the appointment
      appointment.user_id = user.id;
      
      if (appointment.id) {
        // Update existing appointment
        const { data, error } = await supabase
          .from('appointments')
          .update(appointment)
          .eq('id', appointment.id)
          .eq('user_id', user.id)
          .select();
          
        if (error) throw error;
        return data[0];
      } else {
        // Create new appointment
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            ...appointment,
            user_id: user.id
          })
          .select();
          
        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
  
  // Cancel appointment
  const cancelAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', appointmentId)
        .eq('user_id', user.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
  
  // Delete appointment
  const deleteAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      return { id: appointmentId };
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
  
  return {
    saveAppointment,
    cancelAppointment,
    deleteAppointment
  };
};
