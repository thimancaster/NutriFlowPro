
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CalculatorData {
  id?: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: string;
  objective: string;
  bmr: number;
  tdee: number;
  protein: number;
  carbs: number;
  fats: number;
  totalCalories: number;
}

export interface CalculatorResult {
  bmr: number;
  tdee: number;
  macros: {
    protein: { grams: number; kcal: number };
    carbs: { grams: number; kcal: number };
    fats: { grams: number; kcal: number };
  };
  totalCalories: number;
}

export const useUnifiedCalculator = () => {
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { activePatient } = usePatient();
  const { toast } = useToast();

  const calculateNutrition = useCallback(async (data: {
    weight: number;
    height: number;
    age: number;
    gender: 'male' | 'female';
    activityLevel: string;
    objective: string;
  }): Promise<CalculatorResult | null> => {
    if (!user || !activePatient) {
      toast({
        title: 'Erro',
        description: 'Usuário ou paciente não encontrado',
        variant: 'destructive'
      });
      return null;
    }

    setIsCalculating(true);
    
    try {
      // Calcular BMR usando fórmula de Mifflin-St Jeor
      let bmr: number;
      if (data.gender === 'male') {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
      } else {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
      }

      // Fatores de atividade
      const activityFactors: Record<string, number> = {
        sedentario: 1.2,
        leve: 1.375,
        moderado: 1.55,
        intenso: 1.725,
        muito_intenso: 1.9
      };

      const activityFactor = activityFactors[data.activityLevel] || 1.55;
      let tdee = bmr * activityFactor;

      // Ajustar baseado no objetivo
      switch (data.objective) {
        case 'perda_peso':
          tdee *= 0.85; // Déficit de 15%
          break;
        case 'ganho_peso':
          tdee *= 1.15; // Superávit de 15%
          break;
        case 'manutencao':
        default:
          // Manter TDEE normal
          break;
      }

      // Calcular macros
      const proteinGrams = data.weight * 1.6; // 1.6g por kg
      const proteinKcal = proteinGrams * 4;
      
      const fatGrams = (tdee * 0.25) / 9; // 25% das calorias
      const fatKcal = fatGrams * 9;
      
      const carbsKcal = tdee - proteinKcal - fatKcal;
      const carbsGrams = carbsKcal / 4;

      const result: CalculatorResult = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        macros: {
          protein: { grams: Math.round(proteinGrams), kcal: Math.round(proteinKcal) },
          carbs: { grams: Math.round(carbsGrams), kcal: Math.round(carbsKcal) },
          fats: { grams: Math.round(fatGrams), kcal: Math.round(fatKcal) }
        },
        totalCalories: Math.round(tdee)
      };

      // Salvar dados no estado
      const calculatorDataToSave: CalculatorData = {
        ...data,
        bmr: result.bmr,
        tdee: result.tdee,
        protein: result.macros.protein.grams,
        carbs: result.macros.carbs.grams,
        fats: result.macros.fats.grams,
        totalCalories: result.totalCalories
      };

      setCalculatorData(calculatorDataToSave);

      return result;
    } catch (error) {
      console.error('Erro no cálculo:', error);
      toast({
        title: 'Erro no Cálculo',
        description: 'Erro ao calcular valores nutricionais',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [user, activePatient, toast]);

  const saveCalculation = useCallback(async (): Promise<string | null> => {
    if (!calculatorData || !user || !activePatient) {
      toast({
        title: 'Erro',
        description: 'Dados incompletos para salvar',
        variant: 'destructive'
      });
      return null;
    }

    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('calculations')
        .insert({
          user_id: user.id,
          patient_id: activePatient.id,
          weight: calculatorData.weight,
          height: calculatorData.height,
          age: calculatorData.age,
          gender: calculatorData.gender,
          activity_level: calculatorData.activityLevel,
          goal: calculatorData.objective,
          bmr: calculatorData.bmr,
          tdee: calculatorData.tdee,
          protein: calculatorData.protein,
          carbs: calculatorData.carbs,
          fats: calculatorData.fats,
          tipo: 'primeira_consulta',
          status: 'completo'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Atualizar dados com o ID salvo
      setCalculatorData(prev => prev ? { ...prev, id: data.id } : null);

      toast({
        title: 'Sucesso',
        description: 'Cálculo salvo com sucesso!',
      });

      return data.id;
    } catch (error) {
      console.error('Erro ao salvar cálculo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar cálculo',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [calculatorData, user, activePatient, toast]);

  const clearCalculation = useCallback(() => {
    setCalculatorData(null);
  }, []);

  return {
    calculatorData,
    isCalculating,
    isSaving,
    calculateNutrition,
    saveCalculation,
    clearCalculation,
    setCalculatorData
  };
};
