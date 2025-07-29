
import { useState, useCallback } from 'react';
import { Profile } from '@/types/consultation';
import { CalculatorState } from './types';
import { calculateENPNutrition } from '@/utils/nutritionCalculations';
import { useUnifiedEcosystem } from '@/contexts/UnifiedEcosystemContext';
import { useToast } from '@/hooks/use-toast';

export const useCalculatorState = () => {
  const { setCalculationData } = useUnifiedEcosystem();
  const { toast } = useToast();
  
  const [state, setState] = useState<CalculatorState>({
    weight: 70,
    height: 170,
    age: 30,
    sex: 'M',
    activityLevel: 'moderado',
    objective: 'manutenção',
    profile: 'eutrofico',
    bmr: null,
    tdee: null,
    protein: null,
    carbs: null,
    fats: null,
    loading: false,
    calculated: false,
    activeTab: 'basic',
  });

  const setWeight = useCallback((weight: number) => {
    setState(prev => ({ ...prev, weight }));
  }, []);

  const setHeight = useCallback((height: number) => {
    setState(prev => ({ ...prev, height }));
  }, []);

  const setAge = useCallback((age: number) => {
    setState(prev => ({ ...prev, age }));
  }, []);

  const setSex = useCallback((sex: 'M' | 'F') => {
    setState(prev => ({ ...prev, sex }));
  }, []);

  const setActivityLevel = useCallback((activityLevel: string) => {
    setState(prev => ({ ...prev, activityLevel }));
  }, []);

  const setObjective = useCallback((objective: string) => {
    setState(prev => ({ ...prev, objective }));
  }, []);

  const setProfile = useCallback((profile: Profile) => {
    setState(prev => ({ ...prev, profile }));
  }, []);

  const setActiveTab = useCallback((activeTab: 'basic' | 'advanced' | 'results') => {
    setState(prev => ({ ...prev, activeTab }));
  }, []);

  const calculateNutrition = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const results = await calculateENPNutrition({
        weight: state.weight,
        height: state.height,
        age: state.age,
        sex: state.sex,
        activityLevel: state.activityLevel,
        objective: state.objective,
        profile: state.profile,
      });

      if (results) {
        const newState = {
          ...state,
          bmr: results.bmr,
          tdee: results.tdee,
          protein: results.protein,
          carbs: results.carbs,
          fats: results.fats,
          calculated: true,
          loading: false,
          activeTab: 'results' as const,
        };

        setState(newState);

        // Integrar com o ecossistema unificado
        setCalculationData({
          id: `calc-${Date.now()}`,
          weight: state.weight,
          height: state.height,
          age: state.age,
          sex: state.sex,
          activityLevel: state.activityLevel,
          objective: state.objective,
          profile: state.profile,
          bmr: results.bmr,
          tdee: results.tdee,
          protein: results.protein,
          carbs: results.carbs,
          fats: results.fats,
          calculatedAt: new Date().toISOString(),
        });

        toast({
          title: 'Cálculo Concluído',
          description: 'Dados integrados ao fluxo clínico com sucesso!',
        });
      }
    } catch (error) {
      console.error('Erro no cálculo:', error);
      setState(prev => ({ ...prev, loading: false }));
      
      toast({
        title: 'Erro no Cálculo',
        description: 'Erro ao calcular valores nutricionais',
        variant: 'destructive',
      });
    }
  }, [state, setCalculationData, toast]);

  const resetCalculator = useCallback(() => {
    setState({
      weight: 70,
      height: 170,
      age: 30,
      sex: 'M',
      activityLevel: 'moderado',
      objective: 'manutenção',
      profile: 'eutrofico',
      bmr: null,
      tdee: null,
      protein: null,
      carbs: null,
      fats: null,
      loading: false,
      calculated: false,
      activeTab: 'basic',
    });
  }, []);

  return {
    state,
    setWeight,
    setHeight,
    setAge,
    setSex,
    setActivityLevel,
    setObjective,
    setProfile,
    calculateNutrition,
    resetCalculator,
    setActiveTab,
  };
};
