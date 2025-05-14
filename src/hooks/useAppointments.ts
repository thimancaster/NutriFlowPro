
import { useAppointmentQuery } from './appointments/useAppointmentQuery';
import { useAppointmentActions } from './appointments/useAppointmentActions';

// Update the hook to accept a patientId parameter
export const useAppointments = (patientId?: string) => {
  const {
    appointments,
    isLoading,
    isError,
    error,
    appointmentsByDate
  } = useAppointmentQuery(patientId);
  
  const {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    fetchAppointments
  } = useAppointmentActions();

  return {
    appointments,
    isLoading,
    isError,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    appointmentsByDate
  };
};
