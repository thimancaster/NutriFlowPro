
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentType } from '@/types/appointments';

export const useAppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchAppointmentTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('appointment_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      
      setAppointmentTypes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointment types:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch appointment types'));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAppointmentTypes();
  }, []);
  
  const getAppointmentTypeById = (id: string | undefined): AppointmentType | undefined => {
    if (!id) return undefined;
    return appointmentTypes.find(type => type.id === id);
  };
  
  const getTypeInfo = (typeId: string | undefined): {name: string, color: string} => {
    const type = getAppointmentTypeById(typeId);
    return {
      name: type?.name || 'Outro',
      color: type?.color || '#9C27B0'
    };
  };
  
  return { 
    types: appointmentTypes,
    isLoading,
    error,
    getAppointmentTypeById,
    getTypeInfo,
    refetch: fetchAppointmentTypes
  };
};
