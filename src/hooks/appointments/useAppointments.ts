
import { useEffect } from 'react';
import { AppointmentType, Appointment } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useFetchAppointments } from './useFetchAppointments';
import { useAppointmentOperations } from './useAppointmentOperations';
import { useAppointmentTypes } from './useAppointmentTypes';

/**
 * Main hook for appointment management
 * Combines fetching, CRUD operations and appointment types
 */
export const useAppointments = () => {
  const { user } = useAuth();
  const { 
    appointments, 
    loading: fetchLoading, 
    error: fetchError, 
    fetchAppointments,
    getPatientName
  } = useFetchAppointments();
  
  const { 
    loading: operationsLoading, 
    error: operationsError,
    addAppointment,
    updateAppointment,
    deleteAppointment
  } = useAppointmentOperations(fetchAppointments);
  
  const { 
    types: appointmentTypes, 
    loading: typesLoading
  } = useAppointmentTypes();

  // Combined loading state
  const loading = fetchLoading || operationsLoading || typesLoading;
  
  // Combined error state
  const error = fetchError || operationsError;

  // Add refetch function
  const refetch = () => {
    if (user) {
      fetchAppointments();
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  return {
    appointments,
    appointmentTypes,
    loading,
    isLoading: loading, // Add alias for isLoading
    error,
    fetchAppointments,
    refetch, // Add the refetch function
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getPatientName,
  };
};
