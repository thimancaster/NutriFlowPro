
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loadPatientNutritionContext, savePatientMetrics } from '@/utils/patientDataLoader';
import { PatientInput, CalculationResult } from '@/types';
import { saveCalculationResults } from '@/services/calculationService';

interface NutritionState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  calculationId?: string;
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  result?: CalculationResult;
  error?: string;
}

export type ConsolidatedNutritionParams = PatientInput;

export const useConsolidatedNutrition = () => {
  const [state, setState] = useState<NutritionState>({ status: 'idle' });
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateFromPatient = useCallback(async (patientId: string) => {
    if (!user?.id) return;

    console.log('[ATTEND:E2E] Starting calculation from patient:', patientId);
    setState(prev => ({ ...prev, status: 'loading' }));

    try {
      // Load patient context
      const context = await loadPatientNutritionContext(patientId);
      
      if (!context.hasCompleteData) {
        setState({
          status: 'error',
          error: `Dados incompletos: ${context.missingFields.join(', ')}`
        });
        
        toast({
          title: "Dados incompletos",
          description: `Faltam dados: ${context.missingFields.join(', ')}. Preencha para prosseguir.`,
          variant: "destructive"
        });
        return;
      }

      // Perform calculation
      const result = await calculate(context.patientData);
      
      console.log('[ATTEND:E2E] Calculation completed successfully');
      setState({
        status: 'ready',
        calculationId: result.id,
        targets: result.targets,
        result
      });

    } catch (error: any) {
      console.error('[ATTEND:E2E] Calculation failed:', error);
      setState({
        status: 'error',
        error: error.message
      });
      
      toast({
        title: "Erro no cálculo",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user?.id, toast]);

  const calculate = useCallback(async (input: PatientInput): Promise<CalculationResult> => {
    if (!user?.id) throw new Error('User not authenticated');

    console.log('[ATTEND:E2E] Performing nutrition calculation', input);

    // Normalize gender field
    const sex = input.sex || (input.gender === 'M' ? 'male' : 'female');

    // Basic BMR calculation (Harris-Benedict)
    const bmr = sex === 'male' 
      ? 88.362 + (13.397 * input.weight) + (4.799 * input.height) - (5.677 * input.age)
      : 447.593 + (9.247 * input.weight) + (3.098 * input.height) - (4.330 * input.age);

    // Activity factor
    const activityFactors: Record<string, number> = {
      'sedentario': 1.2,
      'leve': 1.375,
      'moderado': 1.55,
      'intenso': 1.725,
      'extremo': 1.9
    };

    const activityFactor = activityFactors[input.activityLevel] || 1.55;
    const get = bmr * activityFactor;

    // Objective adjustments
    let vet = get;
    switch (input.objective) {
      case 'emagrecimento':
        vet = get * 0.85; // 15% deficit
        break;
      case 'hipertrofia':
        vet = get * 1.15; // 15% surplus
        break;
      default:
        vet = get;
    }

    // Macronutrient distribution
    const protein = Math.round(input.weight * 2.2); // 2.2g per kg
    const fats = Math.round(vet * 0.25 / 9); // 25% of calories from fat
    const carbs = Math.round((vet - (protein * 4) - (fats * 9)) / 4); // Remaining from carbs

    const calculationData = {
      patient_id: input.id,
      weight: input.weight,
      height: input.height,
      age: input.age,
      gender: input.gender, // Use the correct 'M' or 'F' format
      activity_level: input.activityLevel,
      goal: input.objective,
      bmr: Math.round(bmr),
      tdee: Math.round(get),
      protein,
      carbs,
      fats,
      tipo: 'primeira_consulta',
      status: 'completo',
      user_id: user.id
    };

    // Save to database
    const saveResult = await saveCalculationResults(calculationData);
    
    if (!saveResult.success) {
      console.error('[ATTEND:E2E] Save failed:', saveResult.error);
      throw new Error(saveResult.error || 'Failed to save calculation');
    }

    const result: CalculationResult = {
      id: saveResult.data?.id || '',
      bmr: Math.round(bmr),
      get: Math.round(get),
      vet: Math.round(vet),
      tmb: {
        value: Math.round(bmr),
        formula: 'Harris-Benedict Revisada'
      },
      gea: Math.round(get - bmr),
      adjustment: Math.round(vet - get),
      formulaUsed: 'Harris-Benedict Revisada',
      targets: {
        calories: Math.round(vet),
        protein,
        carbs,
        fats
      },
      macros: {
        protein: {
          grams: protein,
          kcal: protein * 4,
          percentage: Math.round((protein * 4 / vet) * 100)
        },
        carbs: {
          grams: carbs,
          kcal: carbs * 4,
          percentage: Math.round((carbs * 4 / vet) * 100)
        },
        fat: {
          grams: fats,
          kcal: fats * 9,
          percentage: Math.round((fats * 9 / vet) * 100)
        }
      }
    };

    return result;
  }, [user?.id]);

  const savePatientChanges = useCallback(async (
    patientId: string,
    changes: {
      weight?: number;
      height?: number;
      notes?: string;
    }
  ) => {
    if (!user?.id) return false;

    console.log('[ATTEND:E2E] Saving patient changes');
    return await savePatientMetrics(patientId, user.id, changes);
  }, [user?.id]);

  return {
    state,
    calculateFromPatient,
    calculate,
    savePatientChanges,
    isReady: state.status === 'ready',
    isLoading: state.status === 'loading',
    hasError: state.status === 'error',
    // Legacy compatibility
    results: state.result,
    isCalculating: state.status === 'loading',
    error: state.error,
    calculateNutrition: calculate,
    clearResults: () => setState({ status: 'idle' })
  };
};
