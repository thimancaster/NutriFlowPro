
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

export const usePatient = (patientId?: string | null) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
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
        
        // Convert the database response to the Patient type
        const patientData: Patient = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          birth_date: data.birth_date, // Keep as string, handle display conversion when needed
          age: data.age || undefined,
          weight: data.weight || undefined,
          height: data.height || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at,
          address: data.address,
          notes: data.notes,
          user_id: data.user_id,
          status: data.status || 'active',
          // Safely convert goals from JSON to object
          goals: data.goals ? 
            (typeof data.goals === 'string' ? 
              JSON.parse(data.goals) : data.goals) : 
            {},
          secondaryPhone: data.secondaryPhone,
          cpf: data.cpf
        };
        
        setPatient(patientData);
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
    error,
    activePatient,
    setActivePatient
  };
};
