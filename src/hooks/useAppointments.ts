
import { useAppointments as useAppointmentQuery } from './appointments/useAppointmentQuery';
import { useAppointmentActions } from './appointments/useAppointmentActions';
import { useAppointmentMutations } from './appointments/useAppointmentMutations';

// Update the hook to accept a patientId parameter
export const useAppointments = (patientId?: string) => {
  const query = useAppointmentQuery();
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
    const dateString = appointment.start_time || '';
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
    saveAppointment,
    cancelAppointment,
    deleteAppointment
  } = useAppointmentMutations();

  // Create aliases for expected method names
  const createAppointment = async (appointmentData: any) => {
    try {
      const result = await saveAppointment.mutateAsync(appointmentData);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const updateAppointment = async (id: string, appointmentData: any) => {
    try {
      const result = await saveAppointment.mutateAsync({...appointmentData, id});
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const handleDeleteAppointment = async (id: string) => {
    try {
      await deleteAppointment.mutateAsync(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const handleCancelAppointment = async (id: string) => {
    try {
      await cancelAppointment.mutateAsync(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const fetchAppointments = () => {
    refetch();
    return { success: true };
  };
  
  const isSubmitting = saveAppointment.isPending;

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
