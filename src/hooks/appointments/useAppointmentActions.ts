
import { useQueryClient } from '@tanstack/react-query';
import { Appointment } from '@/types';
import { useAppointmentMutations } from './useAppointmentMutations';

export const useAppointmentActions = () => {
  const queryClient = useQueryClient();
  const {
    createAppointmentMutation,
    updateAppointmentMutation,
    deleteAppointmentMutation,
    cancelAppointmentMutation
  } = useAppointmentMutations();

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
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    fetchAppointments
  };
};
