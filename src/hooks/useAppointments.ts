
import { useAppointments as useAppointmentQuery } from './appointments/useAppointmentQuery';
import { useAppointmentActions } from './appointments/useAppointmentActions';
import { useAppointmentMutations } from './appointments/useAppointmentMutations';

// Update the hook to accept a patientId parameter
export const useAppointments = (patientId?: string) => {
  const query = useAppointmentQuery(patientId);
  const {
    data: appointments = [],
    isLoading,
    isError,
    error,
    refetch
  } = query;
  
  // Create a structured wrapper for appointments by date for calendar view
  const appointmentsByDate = appointments.reduce((acc: Record<string, any[]>, appointment) => {
    // Use start_time as fallback when date is not available
    const dateField = appointment.start_time || appointment.date || '';
    const dateString = dateField;
    const dateKey = typeof dateString === 'string' 
      ? dateString.split('T')[0] 
      : dateString instanceof Date 
        ? dateString.toISOString().split('T')[0] 
        : '';
        
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(appointment);
    return acc;
  }, {});
  
  const {
    selectedAppointment,
    formDialogOpen,
    handleNewAppointment,
    handleEditAppointment,
    handleCloseDialog,
    handleSaveAppointment,
    isCanceling
  } = useAppointmentActions();
  
  const {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment
  } = useAppointmentMutations();

  // Create aliases for expected method names to maintain compatibility
  const saveAppointment = async (appointmentData: any) => {
    try {
      if (appointmentData.id) {
        await updateAppointment.mutate({
          id: appointmentData.id,
          data: appointmentData
        });
        return { success: true };
      } else {
        await createAppointment.mutate(appointmentData);
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment.mutate(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const handleCancelAppointment = async (id: string) => {
    try {
      await cancelAppointment.mutate(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const fetchAppointments = () => {
    refetch();
    return { success: true };
  };
  
  const isSubmitting = createAppointment.isPending || updateAppointment.isPending;

  return {
    appointments,
    isLoading,
    isError,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment: handleDeleteAppointment,
    cancelAppointment: handleCancelAppointment,
    saveAppointment,
    appointmentsByDate,
    // Original properties from useAppointmentActions
    selectedAppointment,
    formDialogOpen,
    handleNewAppointment,
    handleEditAppointment,
    handleCloseDialog,
    handleSaveAppointment,
    isSubmitting,
    isCanceling
  };
};
