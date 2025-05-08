
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

interface PatientOption {
  id: string;
  name: string;
}

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
          .select('id, name')
          .eq('user_id', user.id)
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        setPatients(data || []);
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
