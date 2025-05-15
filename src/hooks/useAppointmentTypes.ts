
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentType } from '@/types';

export const useAppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      try {
        // Fetch from database or use hard-coded values for now
        // In a real app, you'd fetch from your appointment_types table
        
        // Temporary hard-coded types
        const types: AppointmentType[] = [
          { id: '1', name: 'Primeira Consulta', duration_minutes: 60, value: 'first', label: 'Primeira Consulta' },
          { id: '2', name: 'Retorno', duration_minutes: 45, value: 'followup', label: 'Retorno' },
          { id: '3', name: 'Avaliação', duration_minutes: 30, value: 'evaluation', label: 'Avaliação' },
          { id: '4', name: 'Outro', duration_minutes: 60, value: 'other', label: 'Outro' }
        ];
        
        setAppointmentTypes(types);
      } catch (err) {
        console.error('Error fetching appointment types:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentTypes();
  }, []);

  return {
    appointmentTypes,
    isLoading,
    error
  };
};
