
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PatientOption } from '@/types/patient';

export const usePatientOptions = () => {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) {
        setPatients([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, name, email, birth_date, gender, measurements')
          .eq('user_id', user.id)
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        // Process data to add computed fields
        const processedPatients = data?.map(patient => {
          // Calculate age if birth_date exists
          let age;
          if (patient.birth_date) {
            const birthDate = new Date(patient.birth_date);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          
          return {
            ...patient,
            age
          };
        }) || [];
        
        setPatients(processedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  return { patients, isLoading };
};
