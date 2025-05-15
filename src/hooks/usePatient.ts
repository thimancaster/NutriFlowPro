
import { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { differenceInYears } from 'date-fns';

// Function to calculate age from birth_date
const calculateAge = (birthDate: string | undefined): number => {
  if (!birthDate) return 0;
  try {
    return differenceInYears(new Date(), new Date(birthDate));
  } catch (e) {
    console.error("Error calculating age:", e);
    return 0;
  }
};

export const usePatient = (patientId?: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (error) throw error;

        // Transform the data to include derived fields
        const enhancedPatient: Patient = {
          ...data,
          age: calculateAge(data.birth_date),
          // Access weight and height safely from measurements object
          weight: data.measurements && typeof data.measurements === 'object' ? 
            (data.measurements as any).weight || 0 : 0,
          height: data.measurements && typeof data.measurements === 'object' ? 
            (data.measurements as any).height || 0 : 0,
          status: data.status || 'active',
          // Add other derived fields here as needed
        };

        // Add any other properties that might be optional
        if (data.secondaryPhone) enhancedPatient.secondaryPhone = data.secondaryPhone;
        if (data.cpf) enhancedPatient.cpf = data.cpf;
        
        // Set the transformed patient data
        setPatient(enhancedPatient);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(err as Error);
        toast({
          title: 'Error',
          description: `Failed to load patient: ${(err as Error).message}`,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, toast]);

  return { patient, loading, error };
};
