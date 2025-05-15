
import { useAppointments as useAppointmentQuery } from './appointments/useAppointmentQuery';
import { useAppointmentActions } from './appointments/useAppointmentActions';
import { useAppointmentMutations } from './appointments/useAppointmentMutations';

// Update the hook to accept an optional patientId parameter
export const useAppointments = (patientId?: string) => {
  // Pass the patientId to the query hook
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
    const dateField = appointment.start_time || appointment.date || '';
    let dateKey = '';
    
    if (typeof dateField === 'string') {
      dateKey = dateField.split('T')[0];
    } else if (dateField instanceof Date) {
      dateKey = dateField.toISOString().split('T')[0];
    }
    
    if (dateKey && !acc[dateKey]) {
      acc[dateKey] = [];
    }
    
    if (dateKey) {
      acc[dateKey].push(appointment);
    }
    
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
        const result = await updateAppointment.mutateAsync({
          id: appointmentData.id,
          data: appointmentData
        });
        return { success: true, data: result };
      } else {
        const result = await createAppointment.mutateAsync(appointmentData);
        return { success: true, data: result };
      }
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const handleDeleteAppointment = async (id: string) => {
    try {
      const result = await deleteAppointment.mutateAsync(id);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error };
    }
  };
  
  const handleCancelAppointment = async (id: string) => {
    try {
      const result = await cancelAppointment.mutateAsync(id);
      return { success: true, data: result };
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
