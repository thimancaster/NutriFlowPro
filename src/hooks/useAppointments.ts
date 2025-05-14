
import { useAppointments as useAppointmentQuery } from './appointments/useAppointmentQuery';
import { useAppointmentActions } from './appointments/useAppointmentActions';

// Update the hook to accept a patientId parameter
export const useAppointments = (patientId?: string) => {
  const {
    appointments,
    isLoading,
    isError,
    error,
    appointmentsByDate
  } = useAppointmentQuery();
  
  const {
    selectedAppointment,
    formDialogOpen,
    handleNewAppointment,
    handleEditAppointment,
    handleCloseDialog,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleCancelAppointment,
    isSubmitting,
    isCanceling
  } = useAppointmentActions();

  // Create aliases for expected method names
  const createAppointment = handleSaveAppointment;
  const updateAppointment = handleSaveAppointment;
  const deleteAppointment = handleDeleteAppointment;
  const cancelAppointment = handleCancelAppointment;
  const fetchAppointments = () => {}; // Placeholder, should be implemented if needed

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
    appointmentsByDate,
    // Original properties from useAppointmentActions
    selectedAppointment,
    formDialogOpen,
    handleNewAppointment,
    handleEditAppointment,
    handleCloseDialog,
    handleSaveAppointment,
    handleDeleteAppointment,
    handleCancelAppointment,
    isSubmitting,
    isCanceling
  };
};
