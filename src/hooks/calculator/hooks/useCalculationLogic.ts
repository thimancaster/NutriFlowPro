
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { CalculatorState } from '@/components/calculator/types';
import { User } from '@supabase/supabase-js';
import { ConsultationData, ToastApi } from '@/types';

export interface UseCalculationLogicProps {
  setBmr: (value: number | null) => void;
  setTee: (value: number | null) => void;
  setMacros: (value: any | null) => void;
  setConsultationData?: (data: ConsultationData) => void;
  toast: ToastApi;
  user: User | null;
  tempPatientId: string | null;
  setTempPatientId: (value: string | null) => void;
}

export const useCalculationLogic = ({
  setBmr,
  setTee,
  setMacros,
  setConsultationData,
  toast,
  user,
  tempPatientId,
  setTempPatientId
}: UseCalculationLogicProps) => {
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateResults = async (state: CalculatorState) => {
    setIsCalculating(true);
    
    try {
      // Parse numerical inputs
      const age = parseInt(state.age);
      const weight = parseFloat(state.weight);
      const height = parseFloat(state.height);
      const carbsPercentage = parseInt(state.carbsPercentage) / 100;
      const proteinPercentage = parseInt(state.proteinPercentage) / 100;
      const fatPercentage = parseInt(state.fatPercentage) / 100;
      
      // Validate inputs
      if (isNaN(age) || isNaN(weight) || isNaN(height)) {
        toast.toast({
          title: "Dados inválidos",
          description: "Por favor, insira valores numéricos válidos para idade, peso e altura.",
          variant: "destructive"
        });
        setIsCalculating(false);
        return;
      }
      
      // Calculate BMR using Mifflin-St Jeor equation
      let bmrValue: number;
      if (state.gender === 'male') {
        bmrValue = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmrValue = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Apply activity multiplier
      let activityMultiplier: number;
      switch (state.activityLevel) {
        case 'sedentary':
          activityMultiplier = 1.2;
          break;
        case 'light':
          activityMultiplier = 1.375;
          break;
        case 'moderate':
          activityMultiplier = 1.55;
          break;
        case 'active':
          activityMultiplier = 1.725;
          break;
        case 'very_active':
          activityMultiplier = 1.9;
          break;
        default:
          activityMultiplier = 1.55; // Default to moderate
      }
      
      const teeValue = bmrValue * activityMultiplier;
      
      // Apply goal adjustment
      let goalAdjustment: number = 0;
      switch (state.objective) {
        case 'loss':
          goalAdjustment = -500;
          break;
        case 'gain':
          goalAdjustment = 500;
          break;
        default:
          goalAdjustment = 0; // Maintenance
      }
      
      const adjustedCalories = teeValue + goalAdjustment;
      
      // Calculate macros
      const carbsCalories = adjustedCalories * carbsPercentage;
      const proteinCalories = adjustedCalories * proteinPercentage;
      const fatCalories = adjustedCalories * fatPercentage;
      
      const carbsGrams = carbsCalories / 4;
      const proteinGrams = proteinCalories / 4;
      const fatGrams = fatCalories / 9;
      
      // Calculate protein per kg
      const proteinPerKg = proteinGrams / weight;
      
      // Set state
      setBmr(Math.round(bmrValue));
      setTee(Math.round(teeValue));
      setMacros({
        carbs: Math.round(carbsGrams),
        protein: Math.round(proteinGrams),
        fat: Math.round(fatGrams),
        proteinPerKg: parseFloat(proteinPerKg.toFixed(1))
      });
      
      // Save calculation to database if user is authenticated
      if (user) {
        const calculationData = {
          id: uuidv4(),
          user_id: user.id,
          patient_id: tempPatientId,
          patient_name: state.patientName,
          age,
          weight,
          height,
          gender: state.gender,
          activity_level: state.activityLevel,
          goal: state.objective,
          bmr: Math.round(bmrValue),
          tdee: Math.round(teeValue),
          carbs: Math.round(carbsGrams),
          protein: Math.round(proteinGrams),
          fats: Math.round(fatGrams),
          protein_per_kg: parseFloat(proteinPerKg.toFixed(1)),
          type: state.consultationType,
          profile: state.profile
        };
        
        try {
          const { error } = await supabase
            .from('calculations')
            .insert(calculationData);
            
          if (error) {
            throw error;
          }
          
          // Prepare consultation data for context
          if (setConsultationData) {
            const consultationData: ConsultationData = {
              id: calculationData.id,
              user_id: user.id,
              patient_id: tempPatientId || '',
              patient: {
                id: tempPatientId || '',
                name: state.patientName,
                gender: state.gender === 'male' ? 'M' : 'F', 
                age: age
              },
              weight,
              height,
              objective: state.objective,
              activityLevel: state.activityLevel,
              gender: state.gender,
              created_at: new Date().toISOString(),
              tipo: state.consultationType,
              results: {
                bmr: Math.round(bmrValue),
                get: Math.round(teeValue),
                adjustment: goalAdjustment,
                vet: Math.round(adjustedCalories),
                macros: {
                  carbs: Math.round(carbsGrams),
                  protein: Math.round(proteinGrams),
                  fat: Math.round(fatGrams),
                  proteinPerKg: parseFloat(proteinPerKg.toFixed(1))
                }
              }
            };
            
            setConsultationData(consultationData);
          }
        } catch (error) {
          console.error('Error saving calculation:', error);
          toast.toast({
            title: "Erro ao salvar cálculo",
            description: "Ocorreu um erro ao salvar os dados do cálculo.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast.toast({
        title: "Erro ao calcular",
        description: "Ocorreu um erro ao processar o cálculo.",
        variant: "destructive"
      });
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return { isCalculating, calculateResults };
};
