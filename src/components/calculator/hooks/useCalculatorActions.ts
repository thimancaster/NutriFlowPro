
/**
 * Calculator actions and business logic
 */

import { useToast } from '@/hooks/use-toast';
import { calculateCompleteNutritionLegacy, validateLegacyParameters } from '@/utils/nutrition/legacyCalculations';
import { profileToLegacy } from '@/components/calculator/utils/profileUtils';
import { stringToProfile } from '@/components/calculator/utils/profileUtils';
import { ActivityLevel, Objective } from '@/types/consultation';

export interface CalculationParams {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: string;
}

export const useCalculatorActions = () => {
  const { toast } = useToast();

  const validateAndCalculate = async (params: CalculationParams) => {
    // Validation
    if (!params.weight || !params.height || !params.age) {
      toast({
        title: "Dados incompletos",
        description: "Preencha peso, altura e idade para continuar.",
        variant: "destructive"
      });
      return null;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // UI feedback

      // Normalizar o profile usando a função de mapeamento
      const normalizedProfile = stringToProfile(params.profile);
      const legacyProfile = profileToLegacy(normalizedProfile);
      
      console.log('Profile conversion:', {
        original: params.profile,
        normalized: normalizedProfile,
        legacy: legacyProfile
      });
      
      // Validar parâmetros com valores legacy
      const validation = validateLegacyParameters(
        params.weight,
        params.height,
        params.age,
        params.sex,
        params.activityLevel as ActivityLevel,
        params.objective as Objective,
        legacyProfile
      );
      
      if (!validation.isValid) {
        console.error('Validation failed:', validation.errors);
        toast({
          title: "Parâmetros inválidos",
          description: validation.errors.join(', '),
          variant: "destructive"
        });
        return null;
      }
      
      // Use the legacy function with the correct signature (7 parameters)
      const nutritionResults = calculateCompleteNutritionLegacy(
        params.weight,
        params.height,
        params.age,
        params.sex,
        params.activityLevel as ActivityLevel,
        params.objective as Objective,
        legacyProfile
      );

      toast({
        title: "Cálculo realizado com sucesso",
        description: `Utilizada fórmula: ${nutritionResults.formulaUsed}`,
      });

      return nutritionResults;

    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao realizar os cálculos. Tente novamente.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    validateAndCalculate
  };
};
