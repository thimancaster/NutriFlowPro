
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentKeys } from './queryKeys';
import { AppointmentService } from '@/services/appointmentService';
import { Appointment } from '@/types';

export const useAppointmentActions = () => {
  const queryClient = useQueryClient();

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: (appointmentData: Partial<Appointment>) => 
      AppointmentService.createAppointment(appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    }
  });

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Appointment> }) => 
      AppointmentService.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    }
  });

  // Cancel appointment mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => 
      AppointmentService.updateAppointment(id, { status: 'canceled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    }
  });

  // Delete appointment mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      AppointmentService.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    }
  });

  // Function to create a new appointment
  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    return createMutation.mutateAsync(appointmentData);
  };

  // Function to update an appointment
  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    return updateMutation.mutateAsync({ id, data });
  };

  // Function to cancel an appointment
  const cancelAppointment = async (id: string) => {
    return cancelMutation.mutateAsync(id);
  };

  // Function to delete an appointment
  const deleteAppointment = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  // Function to refetch appointments
  const fetchAppointments = () => {
    queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
  };

  return {
    createAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    fetchAppointments,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCanceling: cancelMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
