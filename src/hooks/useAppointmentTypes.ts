
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentType {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  duration_minutes: number;
}

export const useAppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointment_types')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        setAppointmentTypes(data || []);
      } catch (error) {
        console.error('Error fetching appointment types:', error);
        setAppointmentTypes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentTypes();
  }, []);

  return { appointmentTypes, isLoading };
};
