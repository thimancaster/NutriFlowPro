
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { format, parseISO, isEqual } from 'date-fns';

// Update the hook to accept a patientId parameter
export const useAppointments = (patientId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['appointments', patientId],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      let query = supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          title,
          start_time,
          end_time,
          duration_minutes,
          notes,
          status,
          created_at,
          updated_at,
          patients(name)
        `)
        .eq('user_id', user.id);

      // Filter by patient if a patientId is provided
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      // Format the appointments with patient name included
      const formattedAppointments: Appointment[] = data.map((appointment: any) => ({
        id: appointment.id,
        patient_id: appointment.patient_id,
        patientName: appointment.patients?.name,
        title: appointment.title,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        duration_minutes: appointment.duration_minutes,
        notes: appointment.notes,
        status: appointment.status,
        created_at: appointment.created_at,
        updated_at: appointment.updated_at
      }));

      return formattedAppointments;
    },
    enabled: !!user?.id
  });

  // Group appointments by date for calendar view
  const appointmentsByDate = () => {
    const grouped: Record<string, Appointment[]> = {};
    if (query.data) {
      query.data.forEach((appointment) => {
        const date = format(parseISO(appointment.start_time), 'yyyy-MM-dd');
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(appointment);
      });
    }
    return grouped;
  };

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: Partial<Appointment>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          user_id: user.id,
          status: appointmentData.status || 'scheduled'
        })
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

      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
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
        .update({ status: 'cancelled' })
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

  // Helper methods that will be used in components
  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      await createAppointmentMutation.mutateAsync(appointmentData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      await updateAppointmentMutation.mutateAsync({ id, ...appointmentData });
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await deleteAppointmentMutation.mutateAsync(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await cancelAppointmentMutation.mutateAsync(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const fetchAppointments = () => {
    return queryClient.invalidateQueries({ queryKey: ['appointments'] });
  };

  return {
    appointments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    appointmentsByDate: appointmentsByDate()
  };
};
