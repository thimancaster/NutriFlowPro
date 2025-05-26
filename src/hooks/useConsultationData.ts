
import { useState, useEffect } from 'react';
import { ConsultationData } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { mapSupabaseConsultation } from '@/types/consultations';

export const useConsultationData = (consultationId?: string) => {
  const [consultation, setConsultation] = useState<ConsultationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!consultationId) {
      setIsLoading(false);
      return;
    }

    const fetchConsultation = async () => {
      try {
        setIsLoading(true);
        
        // Use calculations table instead of consultations
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .eq('id', consultationId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Safely transform the data to match our expected ConsultationData type
          try {
            const consultationData = mapSupabaseConsultation(data);
            setConsultation(consultationData);
          } catch (conversionError) {
            console.error('Data conversion error:', conversionError);
            setError(new Error('Invalid consultation data format'));
          }
        } else {
          setConsultation(null);
        }
      } catch (err) {
        console.error('Error fetching consultation:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch consultation'));
        
        toast({
          title: 'Error',
          description: 'Failed to load consultation data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultation();
  }, [consultationId, toast]);

  const setNutritionalConsultation = (data: Partial<ConsultationData>) => {
    if (!consultation) return;
    
    const updatedConsultation = {
      ...consultation,
      ...data
    };
    
    setConsultation(updatedConsultation);
  };

  const createNewConsultation = (patientId: string, patientName: string): ConsultationData => {
    const newConsultation: ConsultationData = {
      id: uuidv4(),
      patient_id: patientId,
      weight: 0,
      height: 0,
      bmr: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      totalCalories: 0, // ADDED
      gender: 'M',
      activity_level: 'moderado',
      patient: {
        name: patientName,
        id: patientId
      },
      results: {
        bmr: 0,
        get: 0,
        vet: 0,
        adjustment: 0,
        macros: {
          protein: 0,
          carbs: 0,
          fat: 0
        }
      }
    };
    
    setConsultation(newConsultation);
    return newConsultation;
  };

  return { 
    consultation, 
    setConsultation,
    isLoading, 
    error,
    setNutritionalConsultation,
    createNewConsultation
  };
};
