
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

export const usePatient = (patientId: string | null | undefined) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setPatient(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();
        
        if (error) throw new Error(error.message);
        
        setPatient(data as Patient);
      } catch (err: any) {
        console.error('Error fetching patient:', err);
        setError(err);
        setPatient(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  return {
    patient,
    isLoading,
    error
  };
};
