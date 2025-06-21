
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { useFetchAppointments } from '@/hooks/appointments/useFetchAppointments';

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  type: string;
  status: string;
  title?: string;
  notes?: string;
  recommendations?: string;
  created_at?: string;
  updated_at?: string;
}

export const useAppointments = () => {
  const { user } = useAuth();
  const { data: patientOptions } = usePatientOptions();
  const { 
    data: appointments = [], 
    isLoading, 
    error, 
    refetch 
  } = useFetchAppointments();

  const appointmentsWithPatientNames = appointments.map(appointment => ({
    ...appointment,
    patient_name: patientOptions?.find(p => p.id === appointment.patient_id)?.name || 'Paciente não encontrado'
  }));

  return {
    appointments: appointmentsWithPatientNames,
    loading: isLoading,
    error,
    refetch
  };
};
