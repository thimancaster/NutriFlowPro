
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentType } from '@/types';

export const useAppointmentTypes = () => {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      setIsLoading(true);
      try {
        // Use "appointment_types" table that we created in our SQL migration
        const { data, error } = await supabase
          .from('appointment_types')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        // Ensure we're setting the correct types
        setAppointmentTypes(data as AppointmentType[] || []);
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
