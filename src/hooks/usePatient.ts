
import { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { differenceInYears } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

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

// Helper function to safely parse JSON fields
const safeParseJson = (jsonField: Json | null, defaultValue: any = {}) => {
  if (!jsonField) return defaultValue;
  if (typeof jsonField === 'object') return jsonField;
  try {
    return JSON.parse(jsonField as string) || defaultValue;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return defaultValue;
  }
};

// Helper function to safely cast gender
const safeGender = (gender: any): 'male' | 'female' | 'other' | undefined => {
  if (gender === 'male' || gender === 'female' || gender === 'other') {
    return gender;
  }
  return undefined;
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

        // Transform the data
        const measurementsData = safeParseJson(data.measurements, {}) as any;
        const goalsData = safeParseJson(data.goals, {}) as any;
        
        const enhancedPatient: Patient = {
          ...data,
          age: calculateAge(data.birth_date),
          gender: safeGender(data.gender),
          measurements: {
            weight: measurementsData.weight || 0,
            height: measurementsData.height || 0,
          },
          status: 'active', // Default value if not in database
          goals: {
            objective: goalsData.objective || '',
            profile: goalsData.profile || '',
          },
          // Add optional fields with default values
          secondaryPhone: '',
          cpf: ''
        };

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
