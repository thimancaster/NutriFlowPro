
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ConsultationData } from '@/types';

export const useConsultationData = (id: string | undefined) => {
  const { toast } = useToast();
  const [consultation, setConsultation] = useState<ConsultationData>(createEmptyConsultation());
  const [isLoading, setIsLoading] = useState(false);
  
  // Create empty consultation structure
  function createEmptyConsultation(): ConsultationData {
    return {
      patient: {
        name: '',
      },
      weight: 0,
      height: 0,
      age: 0,
      gender: 'female',
      activity_level: 'sedentario',
      goal: 'maintenance',
      bmr: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      results: {
        bmr: 0,
        get: 0,
        vet: 0,
        adjustment: 0,
        macros: {
          protein: 0,
          carbs: 0,
          fat: 0,
        }
      },
    };
  }
  
  const fetchConsultation = async () => {
    if (!id || id === 'new') return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Transform data to match ConsultationData type
      const consultationData: ConsultationData = {
        patient: {
          name: '',
        },
        patient_id: data.patient_id,
        weight: data.weight || 0,
        height: data.height || 0,
        age: data.age || 0,
        gender: data.gender === 'male' ? 'male' : 'female',
        activity_level: data.activity_level || 'sedentario',
        goal: data.goal || 'maintenance',
        bmr: data.bmr || 0,
        tdee: data.tdee || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fats: data.fats || 0,
        notes: data.notes || '',
        objective: data.goal || 'maintenance',
        results: {
          bmr: data.bmr || 0,
          get: data.tdee || 0,
          vet: parseActivityFactor(data.activity_level),
          adjustment: 0,
          macros: {
            protein: data.protein || 0,
            carbs: data.carbs || 0,
            fat: data.fats || 0,
          }
        },
      };
      
      setConsultation(consultationData);
    } catch (err) {
      console.error('Error loading consultation:', err);
      toast({
        title: 'Error',
        description: `Failed to load consultation: ${(err as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to parse activity level to activity factor
  const parseActivityFactor = (activityLevel: string | null): number => {
    switch (activityLevel) {
      case 'sedentario': return 1.2;
      case 'leve': return 1.375;
      case 'moderado': return 1.55;
      case 'intenso': return 1.725;
      case 'muito_intenso': return 1.9;
      default: return 1.2;
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchConsultation();
    }
  }, [id]);
  
  return {
    consultation,
    setConsultation,
    isLoading,
    fetchConsultation
  };
};
