
import { useState } from 'react';
import { calculateCompleteNutritionLegacy, LegacyCalculationResult, validateLegacyParameters } from '@/utils/nutrition/legacyCalculations';
import { profileToLegacy, stringToProfile } from '@/components/calculator/utils/profileUtils';
import { ActivityLevel, Objective } from '@/types/consultation';
import { CalculationCache } from '@/utils/performance/calculationCache';

export interface NutritionCalculationState {
  results: LegacyCalculationResult | null;
  isCalculating: boolean;
  error: string | null;
  fromCache?: boolean;
  cacheAge?: number;
}

export const useNutritionCalculation = () => {
  const [state, setState] = useState<NutritionCalculationState>({
    results: null,
    isCalculating: false,
    error: null
  });

  const calculate = async (
    weight: number,
    height: number,
    age: number,
    sex: 'M' | 'F',
    activityLevel: ActivityLevel,
    objective: Objective,
    profile: 'magro' | 'obeso' | 'atleta' | 'eutrofico' | 'sobrepeso_obesidade',
    customMacroPercentages?: {
      protein: number;
      carbs: number;
      fat: number;
    }
  ): Promise<LegacyCalculationResult | null> => {
    setState(prev => ({ ...prev, isCalculating: true, error: null }));

    try {
      // Create cache key from calculation inputs
      const cacheInputs = {
        weight,
        height,
        age,
        sex,
        activityLevel,
        objective,
        profile,
        customMacroPercentages
      };

      // Check cache first
      const cachedResult = CalculationCache.get(cacheInputs);
      if (cachedResult) {
        console.log('Using cached nutrition calculation result', {
          cacheAge: cachedResult.cacheAge,
          fromCache: true
        });

        const resultWithCache: LegacyCalculationResult = {
          ...cachedResult,
          fromCache: true,
          cacheAge: cachedResult.cacheAge
        };

        setState({
          results: resultWithCache,
          isCalculating: false,
          error: null,
          fromCache: true,
          cacheAge: cachedResult.cacheAge
        });

        return resultWithCache;
      }

      // Normalizar profile se necessário
      let normalizedProfile: 'magro' | 'obeso' | 'atleta';
      
      if (profile === 'eutrofico' || profile === 'sobrepeso_obesidade') {
        const profileType = stringToProfile(profile);
        normalizedProfile = profileToLegacy(profileType);
      } else {
        normalizedProfile = profile as 'magro' | 'obeso' | 'atleta';
      }

      console.log('Profile normalization:', { original: profile, normalized: normalizedProfile });

      // Validar parâmetros using legacy function
      const validation = validateLegacyParameters(weight, height, age, sex, activityLevel, objective, normalizedProfile);
      
      if (!validation.isValid) {
        throw new Error(`Parâmetros inválidos: ${validation.errors.join(', ')}`);
      }

      // Use legacy calculation function with 7 parameters
      const results = calculateCompleteNutritionLegacy(
        weight,
        height,
        age,
        sex,
        activityLevel,
        objective,
        normalizedProfile
      );

      // Add cache properties
      const resultsWithCache: LegacyCalculationResult = {
        ...results,
        fromCache: false
      };

      // Cache the results for future use
      CalculationCache.set(cacheInputs, resultsWithCache, 30 * 60 * 1000); // 30 minutes TTL

      setState({
        results: resultsWithCache,
        isCalculating: false,
        error: null,
        fromCache: false
      });

      console.log('Cálculo nutricional concluído:', {
        formulaUsed: results.formulaUsed,
        tmb: results.tmb,
        vet: results.vet,
        profile: normalizedProfile,
        recommendations: results.recommendations,
        cached: true
      });

      return resultsWithCache;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no cálculo nutricional';
      
      setState({
        results: null,
        isCalculating: false,
        error: errorMessage
      });

      console.error('Erro no cálculo nutricional:', error);
      return null;
    }
  };

  const reset = () => {
    setState({
      results: null,
      isCalculating: false,
      error: null
    });
  };

  return {
    ...state,
    calculate,
    reset
  };
};
